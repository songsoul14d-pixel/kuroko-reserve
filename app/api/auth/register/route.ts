import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { login } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password, full_name, facebook_url, ingame_name } = await req.json();

    if (!username || !password || !full_name) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ" }, { status: 400 });
    }

    // Check if username exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      return NextResponse.json({ error: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const { data: profile, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username,
        password_hash: passwordHash,
        full_name,
        facebook_url: facebook_url || null,
        ingame_name: ingame_name || null,
        is_admin: false
      })
      .select()
      .single();

    if (error) throw error;

    await login({ id: profile.id, username: profile.username, is_admin: profile.is_admin || false });


    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก" }, { status: 500 });
  }
}
