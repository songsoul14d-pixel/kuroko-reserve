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
  let { card_id, customer_name, facebook_url, quantity, weeks, notes } = body;

  customer_name = sanitize(String(customer_name || "").trim()).slice(0, 100);
  facebook_url = facebook_url ? String(facebook_url).trim().slice(0, 500) : null;
  notes = notes ? sanitize(String(notes).trim()).slice(0, 500) : null;
  weeks = Math.min(Math.max(parseInt(weeks) || 1, 1), 4);

  if (!card_id || !customer_name) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }
  if (!quantity || quantity < 1 || quantity > 3) {
    return NextResponse.json({ error: "จำนวน 1-3 ใบ" }, { status: 400 });
  }

  const { data: card } = await supabase.from("cards").select("id, label, price").eq("id", card_id).single();
  if (!card) {
    return NextResponse.json({ error: "ไม่พบการ์ดนี้" }, { status: 404 });
  }

  // Create reservations for each week
  let weekStart = getWeekStart();
  const created = [];
  let firstQueueNumber = 0;
  let totalAmount = 0;

  for (let w = 0; w < weeks; w++) {
    // Check duplicate for this week
    const { data: existing } = await supabase
      .from("reservations")
      .select("id")
      .eq("card_id", card_id)
      .eq("week_start", weekStart)
      .eq("customer_name", customer_name)
      .neq("status", "cancelled")
      .limit(1);

    if (existing && existing.length > 0) {
      // Skip this week if already reserved
      weekStart = getNextWeekStart(weekStart);
      continue;
    }

    // Max 50 per card per week
    const { count } = await supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("card_id", card_id)
      .eq("week_start", weekStart)
      .neq("status", "cancelled");

    if ((count ?? 0) >= 50) {
      weekStart = getNextWeekStart(weekStart);
      continue;
    }

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
        quantity,
        week_start: weekStart,
        queue_number: queueNumber,
        status: "queued",
        notes: w === 0 ? notes : (notes ? `${notes} (สัปดาห์ที่ ${w + 1})` : `สัปดาห์ที่ ${w + 1}`),
      })
      .select()
      .single();

    if (!error && data) {
      if (firstQueueNumber === 0) firstQueueNumber = queueNumber;
      totalAmount += quantity * card.price;
      created.push(data);
    }

    weekStart = getNextWeekStart(weekStart);
  }

  if (created.length === 0) {
    return NextResponse.json({ error: "คุณจองการ์ดนี้ครอบคลุมสัปดาห์ที่เลือกไปหมดแล้ว" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    queue_number: firstQueueNumber,
    weeks_created: created.length,
    total: totalAmount,
    reservations: created,
  });
}
