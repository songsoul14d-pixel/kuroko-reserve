import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// POST /api/reservations/claim
// Move localStorage-based reservations to the logged-in profile
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ claimed: 0 });
  }

  // Update reservations that don't have a profile_id yet
  const { data, error } = await supabase
    .from("reservations")
    .update({ profile_id: session.user.id })
    .in("id", ids)
    .is("profile_id", null)
    .neq("status", "cancelled")
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ claimed: data?.length || 0 });
}
