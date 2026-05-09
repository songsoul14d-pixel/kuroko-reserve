import { supabase } from "@/lib/supabase";
import { Card } from "@/lib/types";
import CardGridClient from "./CardGridClient";
import { Sparkles, User } from "lucide-react";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import HomeClientWrapper from "./components/HomeClientWrapper";
import UserMenu from "./components/UserMenu";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  
  let userProfile = null;
  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, full_name, facebook_url, ingame_name, avatar_url, is_admin")
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 overflow-x-hidden">
      {/* Header / Nav */}
      <div className="absolute top-6 right-6 z-50 hidden md:flex items-center gap-3">
        {session ? (
          <UserMenu user={{ 
            username: session.user.username, 
            is_admin: userProfile?.is_admin 
          }} />
        ) : (

          <Link href="/login" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <User size={14} />
            เข้าสู่ระบบ
          </Link>
        )}
      </div>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-12 md:pt-24 pb-4 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-6">
          <Sparkles size={12} />
          Kuroko Rivals Card Shop
        </div>
        <h1 className="text-3xl md:text-7xl font-black tracking-tight leading-tight md:leading-none">
          🏀 <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Transfer Center</span>
        </h1>
        <p className="text-zinc-400 mt-4 text-lg max-w-md mx-auto font-medium">
          ตรวจสอบรอบการโอนของและคิวของคุณได้ที่นี่
        </p>
      </div>

      <HomeClientWrapper>
        <CardGridClient cards={(cards || []) as Card[]} user={userProfile} settings={settings} />
      </HomeClientWrapper>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent mb-8" />
        <p className="text-zinc-600 text-sm">Kuroko Card Reserve © 2026</p>
        <p className="text-zinc-700 text-xs mt-1">Powered by ❤️</p>
      </div>
    </div>
  );
}

