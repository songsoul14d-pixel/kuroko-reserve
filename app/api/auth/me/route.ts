import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, facebook_url, ingame_name, avatar_url, is_admin")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: profile });
}
