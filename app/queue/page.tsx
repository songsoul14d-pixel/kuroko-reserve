"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Clock, Check, X, Package } from "lucide-react";

interface Reservation {
  id: string;
  card_id: string;
  quantity: number;
  status: string;
  queue_number: number;
  created_at: string;
}

interface Card {
  id: string;
  label: string;
  price: number;
}

const STATUS_DISPLAY: Record<string, { label: string; icon: string; color: string }> = {
  queued: { label: "รอคิว", icon: "⏳", color: "text-yellow-400" },
  paid: { label: "ชำระแล้ว", icon: "💰", color: "text-blue-400" },
  confirmed: { label: "ยืนยันแล้ว", icon: "✅", color: "text-purple-400" },
  delivered: { label: "ส่งแล้ว", icon: "📦", color: "text-green-400" },
  cancelled: { label: "ยกเลิก", icon: "❌", color: "text-red-400" },
};

export default function QueuePage() {
  const [name, setName] = useState("");
  const [results, setResults] = useState<(Reservation & { card?: Card; peopleAhead?: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cardsMap, setCardsMap] = useState<Record<string, Card>>({});

  const search = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setSearched(true);

    // Fetch cards for labels
    const cardsRes = await fetch("/api/cards");
    const cardsData: Card[] = await cardsRes.json();
    const map: Record<string, Card> = {};
    for (const c of cardsData) map[c.id] = c;
    setCardsMap(map);

    // Search reservations by name
    const res = await fetch(`/api/my-reservations?name=${encodeURIComponent(name.trim())}`);
    const data = await res.json();

    // Calculate people ahead for each
    const enriched = data.map((r: Reservation) => ({
      ...r,
      card: map[r.card_id],
    }));

    setResults(enriched);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-4">
      <div className="max-w-lg mx-auto pt-16 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black">
            🔍 ตรวจสอบ<span className="text-indigo-400">คิว</span>
          </h1>
          <p className="text-zinc-500 mt-2">กรอกชื่อเพื่อดูตำแหน่งคิวของคุณ</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="ชื่อที่ใช้จอง..."
            className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={search}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-40"
          >
            {loading ? "..." : "ค้นหา"}
          </button>
        </div>

        {searched && results.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <p className="text-lg">ไม่พบคิวของคุณ</p>
            <p className="text-sm mt-1">ลองเช็คชื่อที่ใช้จองใหม่นะ</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((r) => {
              const st = STATUS_DISPLAY[r.status] || STATUS_DISPLAY.queued;
              return (
                <div key={r.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-xl font-black text-indigo-400">
                        #{r.queue_number}
                      </div>
                      <div>
                        <p className="font-bold">{r.card?.label || r.card_id}</p>
                        <p className="text-sm text-zinc-400">× {r.quantity} ใบ</p>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${st.color}`}>
                      {st.icon} {st.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors">
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
