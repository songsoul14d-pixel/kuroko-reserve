import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { full_name, facebook_url, ingame_name, new_password } = await req.json();

    const updateData: any = {
      full_name,
      facebook_url,
      ingame_name,
      updated_at: new Date().toISOString()
    };

    // If password is provided, hash it
    if (new_password && new_password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(new_password, 10);
      updateData.password = hashedPassword;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
