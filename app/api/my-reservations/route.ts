import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// GET /api/my-reservations?name=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  
  const session = await getSession();
  let query = supabase
    .from("reservations")
    .select("id, card_id, quantity, status, queue_number, slip_url, proof_url, created_at, ingame_name")
    .neq("status", "cancelled");

  if (session?.user?.id) {
    // If logged in, fetch by profile_id
    query = query.eq("profile_id", session.user.id);
  } else if (name) {
    // Fallback to name search
    const cleanName = name.replace(/[%_\\]/g, "").trim().slice(0, 100);
    if (!cleanName) return NextResponse.json({ error: "ชื่อไม่ถูกต้อง" }, { status: 400 });
    query = query.eq("customer_name", cleanName);
  } else {
    return NextResponse.json({ error: "name required or not logged in" }, { status: 400 });
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
