import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/my-reservations?name=xxx
// Public endpoint — only returns safe fields
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  // Sanitize
  const cleanName = name.replace(/[%_\\]/g, "").trim().slice(0, 100);
  if (!cleanName) return NextResponse.json({ error: "ชื่อไม่ถูกต้อง" }, { status: 400 });

  const { data, error } = await supabase
    .from("reservations")
    .select("id, card_id, quantity, status, queue_number, created_at")
    .eq("customer_name", cleanName)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
