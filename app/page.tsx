import { supabase } from "@/lib/supabase";
import { Card, CARD_COLORS, CATEGORY_LABELS } from "@/lib/types";
import CardGridClient from "./CardGridClient";

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
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">
          🏀 <span className="text-indigo-400">Kuroko</span> Card Reserve
        </h1>
        <p className="text-zinc-400 mt-3 text-lg">
          จองคิวซื้อการ์ดล่วงหน้า — ไม่พลาดตัวที่อยากได้
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <a href="/queue" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all">
            🔍 ตรวจสอบคิว
          </a>
          <a href="/admin" className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 rounded-xl text-sm font-bold text-zinc-400 transition-all">
            🛡️ Admin
          </a>
        </div>
      </div>

      {/* Cards Grid */}
      <CardGridClient cards={(cards || []) as Card[]} />

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-zinc-600 text-sm">
        <p>Kuroko Card Reserve © 2026</p>
      </div>
    </div>
  );
}
