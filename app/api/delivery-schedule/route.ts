import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch only reservations that have a delivery_slot (paid/confirmed)
    const { data, error } = await supabase
      .from("reservations")
      .select("id, card_id, queue_number, ingame_name, delivery_slot, status")
      .not("delivery_slot", "is", null)
      .neq("status", "cancelled")
      .order("delivery_slot", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
