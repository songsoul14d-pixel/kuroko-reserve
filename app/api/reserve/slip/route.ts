import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  try {
    const { reservation_id, slip_url, proof_url } = await req.json();

    if (!reservation_id) {
      return NextResponse.json({ error: "Missing reservation_id" }, { status: 400 });
    }

    const updateData: any = {};
    if (proof_url) updateData.proof_url = proof_url;

    if (slip_url) {
      updateData.slip_url = slip_url;
      updateData.status = "paid";

      const now = new Date();
      const rounds = ["10:30", "12:30", "15:30", "18:30", "21:30"];
      const cutOffMinutes = 5;
      
      let deliverySlot = null;
      for (const round of rounds) {
        const [hour, minute] = round.split(":").map(Number);
        const roundTime = new Date(now);
        roundTime.setHours(hour, minute, 0, 0);
        const cutOffTime = new Date(roundTime);
        cutOffTime.setMinutes(cutOffTime.getMinutes() - cutOffMinutes);
        if (now < cutOffTime) {
          deliverySlot = roundTime.toISOString();
          break;
        }
      }
      
      if (!deliverySlot) {
        const firstRoundTomorrow = new Date(now);
        firstRoundTomorrow.setDate(now.getDate() + 1);
        const [hour, minute] = rounds[0].split(":").map(Number);
        firstRoundTomorrow.setHours(hour, minute, 0, 0);
        deliverySlot = firstRoundTomorrow.toISOString();
      }
      updateData.delivery_slot = deliverySlot;
    }

    const { data, error } = await supabase
      .from("reservations")
      .update(updateData)
      .eq("id", reservation_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
