import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// GET /api/my-reservations?name=xxx | ?ids=id1,id2,id3
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const ids = searchParams.get("ids");
  
  const session = await getSession();
  let query = supabase
    .from("reservations")
    .select("id, card_id, quantity, status, queue_number, slip_url, proof_url, created_at, ingame_name, customer_name, week_start")
    .neq("status", "cancelled");

  if (session?.user?.id) {
    // If logged in, fetch by profile_id
    query = query.eq("profile_id", session.user.id);
  } else if (ids) {
    // Fetch by localStorage IDs
    const idList = ids.split(",").filter(Boolean).slice(0, 100);
    if (idList.length === 0) return NextResponse.json([]);
    query = query.in("id", idList);
  } else if (name) {
    // Fallback to name search
    const cleanName = name.replace(/[%_\\]/g, "").trim().slice(0, 100);
    if (!cleanName) return NextResponse.json({ error: "ชื่อไม่ถูกต้อง" }, { status: 400 });
    query = query.eq("customer_name", cleanName);
  } else {
    return NextResponse.json({ error: "name or ids required, or not logged in" }, { status: 400 });
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
