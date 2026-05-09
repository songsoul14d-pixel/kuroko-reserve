import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getWeekStart } from "@/lib/types";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000;

function sanitize(str: string): string {
  return str.replace(/[%_\\]/g, "");
}

function getNextWeekStart(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (entry && entry.resetAt > now && entry.count >= RATE_LIMIT) {
    return NextResponse.json({ error: "จองเยอะเกินไป รอสักครู่แล้วลองใหม่" }, { status: 429 });
  }
  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
  } else {
    entry.count++;
  }

  const body = await req.json();
  let { card_id, customer_name, facebook_url, ingame_name, profile_id, quantity, selected_weeks, notes } = body;

  customer_name = sanitize(String(customer_name || "").trim()).slice(0, 100);
  facebook_url = facebook_url ? String(facebook_url).trim().slice(0, 500) : null;
  ingame_name = ingame_name ? sanitize(String(ingame_name).trim()).slice(0, 100) : null;
  notes = notes ? sanitize(String(notes).trim()).slice(0, 500) : null;

  if (!card_id || !customer_name || !selected_weeks || !Array.isArray(selected_weeks) || selected_weeks.length === 0) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบและเลือกสัปดาห์" }, { status: 400 });
  }
  if (!quantity || quantity < 1 || quantity > 3) {
    return NextResponse.json({ error: "จำนวน 1-3 ใบ" }, { status: 400 });
  }

  const { data: card } = await supabase.from("cards").select("id, label, price").eq("id", card_id).single();
  if (!card) {
    return NextResponse.json({ error: "ไม่พบการ์ดนี้" }, { status: 404 });
  }

  const created = [];
  let firstQueueNumber = 0;
  let totalAmount = 0;

  for (const weekStart of selected_weeks) {
    // Check duplicate for this week
    const { data: existing } = await supabase
      .from("reservations")
      .select("id")
      .eq("card_id", card_id)
      .eq("week_start", weekStart)
      .eq("customer_name", customer_name)
      .neq("status", "cancelled")
      .limit(1);

    if (existing && existing.length > 0) continue;

    // Max 50 per card per week
    const { count } = await supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("card_id", card_id)
      .eq("week_start", weekStart)
      .neq("status", "cancelled");

    if ((count ?? 0) >= 50) continue;

    // Get next queue number
    const { data: lastReservation } = await supabase
      .from("reservations")
      .select("queue_number")
      .eq("card_id", card_id)
      .eq("week_start", weekStart)
      .order("queue_number", { ascending: false })
      .limit(1);

    const queueNumber = (lastReservation?.[0]?.queue_number ?? 0) + 1;

    const { data, error } = await supabase
      .from("reservations")
      .insert({
        card_id,
        customer_name,
        facebook_url,
        ingame_name,
        profile_id,
        quantity,
        week_start: weekStart,
        queue_number: queueNumber,
        status: "queued",
        notes: notes || null,
      })
      .select()
      .single();

    if (!error && data) {
      if (firstQueueNumber === 0) firstQueueNumber = queueNumber;
      totalAmount += quantity * card.price;
      created.push(data);

      // Auto-update profile with latest info if linked
      if (profile_id) {
        await supabase
          .from("profiles")
          .update({
            facebook_url: facebook_url || undefined,
            ingame_name: ingame_name || undefined
          })
          .eq("id", profile_id);
      }
    }
  }

  if (created.length === 0) {
    return NextResponse.json({ error: "สัปดาห์ที่เลือกถูกจองเต็มหรือคุณจองไปแล้ว" }, { status: 400 });
  }


  return NextResponse.json({
    success: true,
    queue_number: firstQueueNumber,
    weeks_created: created.length,
    total: totalAmount,
    reservations: created,
  });
}
