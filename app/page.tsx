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
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 overflow-x-hidden">
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
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <User size={14} />
            เข้าสู่ระบบ
          </Link>
        )}
      </div>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-20 md:pt-40 pb-12 text-center relative">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-40 -left-20 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none animate-float" />
        <div
          className="absolute top-20 -right-20 w-[250px] h-[250px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none animate-float"
          style={{ animationDelay: "-3s" }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-10 shadow-2xl backdrop-blur-xl">
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
            Kuroko Rivals Card Reserve
          </div>

          <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-8 select-none">
            <span className="text-white block mb-2">TRANSFER</span>
            <span className="bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent italic text-glow-indigo">
              CENTER
            </span>
          </h1>

          <p className="text-zinc-500 mt-8 text-base md:text-xl max-w-xl mx-auto font-medium leading-relaxed mb-12">
            จองคิวรับการ์ดล่วงหน้าและตรวจสอบสถานะการโอนของคุณได้ง่ายๆ{" "}
            <br className="hidden md:block" />
            ด้วยระบบอัตโนมัติที่พรีเมียมที่สุดในไทย
          </p>

          {/* Social Proof / Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-60 hover:opacity-100 transition-opacity duration-500">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white leading-none">
                80+
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                สมาชิกทั้งหมด
              </span>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden md:block" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-indigo-400 leading-none">
                99.9%
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                อัตราความสำเร็จ
              </span>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden md:block" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white leading-none">
                24/7
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                ระบบอัตโนมัติ
              </span>
            </div>
          </div>
        </div>
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
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent mb-8" />
        <p className="text-zinc-600 text-sm">Kuroko Card Reserve © 2026</p>
        <p className="text-zinc-700 text-xs mt-1">Powered by ❤️</p>
      </div>
    </div>
  );
}
