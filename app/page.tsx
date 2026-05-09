import { supabase } from "@/lib/supabase";
import { Card } from "@/lib/types";
import CardGridClient from "./CardGridClient";
import { Sparkles, User } from "lucide-react";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

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
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header / Nav */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        {session ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <User size={14} className="text-indigo-400" />
              <span className="text-sm font-bold text-zinc-300">{session.user.username}</span>
            </div>
            <LogoutButton />
          </div>
        ) : (

          <Link href="/login" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <User size={14} />
            เข้าสู่ระบบ
          </Link>
        )}
      </div>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-10 text-center relative">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-6">
            <Sparkles size={12} />
            Kuroko Rivals Card Shop
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
            🏀 <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Card Reserve</span>
          </h1>
          <p className="text-zinc-400 mt-4 text-lg max-w-md mx-auto">
            จองคิวซื้อการ์ดล่วงหน้า — ไม่พลาดตัวที่อยากได้
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a href="/queue" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-500/25 flex items-center gap-2">
              🔍 ตรวจสอบคิว
            </a>
            {session?.user?.is_admin && (
              <a href="/admin" className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-2xl text-sm font-bold text-zinc-400 transition-all flex items-center gap-2">
                🛡️ Admin
              </a>
            )}
          </div>

        </div>
      </div>

      {/* Cards Grid */}
      <CardGridClient cards={(cards || []) as Card[]} user={userProfile} settings={settings} />

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent mb-8" />
        <p className="text-zinc-600 text-sm">Kuroko Card Reserve © 2026</p>
        <p className="text-zinc-700 text-xs mt-1">Powered by ❤️</p>
      </div>
    </div>
  );
}

