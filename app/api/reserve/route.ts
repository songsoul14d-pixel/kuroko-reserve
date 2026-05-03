import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getWeekStart } from "@/lib/types";

// Simple in-memory rate limiter (per IP, resets on redeploy)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max 5 reservations per IP per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function sanitize(str: string): string {
  return str.replace(/[%_\\]/g, ""); // Remove SQL wildcard characters
}

export async function POST(req: NextRequest) {
  // Rate limit by IP
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
  let { card_id, customer_name, facebook_url, quantity, notes } = body;

  // Sanitize inputs
  customer_name = sanitize(String(customer_name || "").trim()).slice(0, 100);
  facebook_url = facebook_url ? String(facebook_url).trim().slice(0, 500) : null;
  notes = notes ? sanitize(String(notes).trim()).slice(0, 500) : null;

  if (!card_id || !customer_name) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  if (!quantity || quantity < 1 || quantity > 3) {
    return NextResponse.json({ error: "จำนวน 1-3 ใบ" }, { status: 400 });
  }

  // Validate card_id exists (prevent injection)
  const { data: card } = await supabase.from("cards").select("id, label, price").eq("id", card_id).single();
  if (!card) {
    return NextResponse.json({ error: "ไม่พบการ์ดนี้" }, { status: 404 });
  }

  const weekStart = getWeekStart();

  // Check duplicate (using exact match, not ilike)
  const { data: existing } = await supabase
    .from("reservations")
    .select("id")
    .eq("card_id", card_id)
    .eq("week_start", weekStart)
    .eq("customer_name", customer_name)
    .neq("status", "cancelled")
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "คุณจองการ์ดนี้ไปแล้วสัปดาห์นี้" }, { status: 400 });
  }

  // Max reservations per card per week
  const { count } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("card_id", card_id)
    .eq("week_start", weekStart)
    .neq("status", "cancelled");

  if ((count ?? 0) >= 50) {
    return NextResponse.json({ error: "คิวเต็มแล้วสัปดาห์นี้" }, { status: 400 });
  }

  // Get next queue number PER CARD TYPE
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
      notes,
    })
    .select()
    .single();

  if (error) {
    console.error("Reserve error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด ลองใหม่" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    queue_number: queueNumber,
    total: quantity * card.price,
    reservation: data,
  });
}
