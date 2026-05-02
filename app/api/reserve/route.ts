import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getWeekStart } from "@/lib/types";

// POST /api/reserve — ลูกค้าจองคิว
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { card_id, customer_name, facebook_url, quantity, notes } = body;

  if (!card_id || !customer_name) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  if (!quantity || quantity < 1 || quantity > 3) {
    return NextResponse.json({ error: "จำนวน 1-3 ใบ" }, { status: 400 });
  }

  const weekStart = getWeekStart();

  // Check card exists
  const { data: card } = await supabase.from("cards").select("id, label").eq("id", card_id).single();
  if (!card) {
    return NextResponse.json({ error: "ไม่พบการ์ดนี้" }, { status: 404 });
  }

  // Check if same name already queued for same card this week
  const { data: existing } = await supabase
    .from("reservations")
    .select("id")
    .eq("card_id", card_id)
    .eq("week_start", weekStart)
    .ilike("customer_name", customer_name.trim())
    .neq("status", "cancelled")
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "คุณจองการ์ดนี้ไปแล้วสัปดาห์นี้" }, { status: 400 });
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

  // Insert
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      card_id,
      customer_name: customer_name.trim(),
      facebook_url: facebook_url || null,
      quantity,
      week_start: weekStart,
      queue_number: queueNumber,
      status: "queued",
      notes: notes || null,
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
    reservation: data,
  });
}
