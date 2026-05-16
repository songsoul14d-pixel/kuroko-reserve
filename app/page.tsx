import { supabase } from "@/lib/supabase";
import { Card } from "@/lib/types";
import CardGridClient from "./CardGridClient";
import { User } from "lucide-react";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import HomeClientWrapper from "./components/HomeClientWrapper";
import UserMenu from "./components/UserMenu";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  let userProfile = null;
  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "id, username, full_name, facebook_url, ingame_name, avatar_url, is_admin",
      )
      .eq("id", session.user.id)
      .single();
    userProfile = profile;
  }

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const { data: settingsData } = await supabase
    .from("system_settings")
    .select("key, value");

  const settings = (settingsData || []).reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header / Nav */}
      <div className="absolute top-6 right-6 z-50 hidden md:flex items-center gap-3">
        {session ? (
          <UserMenu
            user={{
              username: session.user.username,
              is_admin: userProfile?.is_admin,
            }}
          />
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 text-zinc-400 hover:text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <User size={14} />
            เข้าสู่ระบบ
          </Link>
        )}
      </div>

      <HomeClientWrapper>
        <CardGridClient
          cards={(cards || []) as Card[]}
          user={userProfile}
          settings={settings}
        />
      </HomeClientWrapper>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-zinc-700 text-xs">Kuroko Card Reserve 2026</p>
      </div>
    </div>
  );
}
