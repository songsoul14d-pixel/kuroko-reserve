import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

import { getSession } from "@/lib/auth";

async function checkAuth(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.is_admin === true;
}


// GET /api/admin/reservations?week_start=xxx
export async function GET(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });


  const { searchParams } = new URL(req.url);
  const weekStart = searchParams.get("week_start");

  let query = supabase.from("reservations").select("*").order("queue_number", { ascending: true });
  if (weekStart) query = query.eq("week_start", weekStart);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH /api/admin/reservations — update status
export async function PATCH(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });


  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

  const allowed = ["queued", "paid", "confirmed", "delivered", "cancelled"];
  if (!allowed.includes(status)) return NextResponse.json({ error: "invalid status" }, { status: 400 });

  const { data, error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/reservations?id=xxx
export async function DELETE(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });


  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("reservations").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
