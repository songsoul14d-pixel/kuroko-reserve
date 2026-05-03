import { supabase } from "@/lib/supabase";
import { Card } from "@/lib/types";
import CardGridClient from "./CardGridClient";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-10 text-center relative">
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
          <div className="mt-6 flex items-center justify-center gap-3">
            <a href="/queue" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
              🔍 ตรวจสอบคิว
            </a>
            <a href="/admin" className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 rounded-xl text-sm font-bold text-zinc-400 transition-all">
              🛡️ Admin
            </a>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <CardGridClient cards={(cards || []) as Card[]} />

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent mb-8" />
        <p className="text-zinc-600 text-sm">Kuroko Card Reserve © 2026</p>
        <p className="text-zinc-700 text-xs mt-1">Powered by ❤️</p>
      </div>
    </div>
  );
}
