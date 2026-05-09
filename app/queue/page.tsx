"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Clock, Check, X, Package, User, Upload, Loader2, Shield, CheckCircle2, Gamepad2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Reservation {
  id: string;
  card_id: string;
  quantity: number;
  status: string;
  slip_url: string | null;
  created_at: string;
  ingame_name?: string;
  queue_number: number;
}

interface Card {
  id: string;
  label: string;
  price: number;
}

const STATUS_DISPLAY: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  queued: { label: "รอคิว", icon: "⏳", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  paid: { label: "ชำระแล้ว", icon: "💰", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  confirmed: { label: "ยืนยันแล้ว", icon: "✅", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  delivered: { label: "ส่งแล้ว", icon: "📦", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  cancelled: { label: "ยกเลิก", icon: "❌", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

export default function QueuePage() {
  const [name, setName] = useState("");
  const [results, setResults] = useState<(Reservation & { card?: Card; peopleAhead?: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const [cardsMap, setCardsMap] = useState<Record<string, Card>>({});

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  const checkUserAndFetch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        await search(true); // Auto search for user
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  const search = async (isAuto = false) => {
    if (!isAuto && !name.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      // Fetch cards for labels if not already fetched
      let map = cardsMap;
      if (Object.keys(map).length === 0) {
        const cardsRes = await fetch("/api/cards");
        const cardsData: Card[] = await cardsRes.json();
        map = {};
        for (const c of cardsData) map[c.id] = c;
        setCardsMap(map);
      }

      // Search reservations
      const url = isAuto ? "/api/my-reservations" : `/api/my-reservations?name=${encodeURIComponent(name.trim())}`;
      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data)) {
        const enriched = data.map((r: Reservation) => ({
          ...r,
          card: map[r.card_id],
        }));
        setResults(enriched);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, reservationId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(reservationId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${reservationId}_${Date.now()}.${fileExt}`;
      const filePath = `qr/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('slips')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('slips')
        .getPublicUrl(filePath);

      const res = await fetch("/api/reserve/slip", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_id: reservationId,
          slip_url: publicUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to update database");

      // Update local state
      setResults(prev => prev.map(r => 
        r.id === reservationId ? { ...r, slip_url: publicUrl, status: "paid" } : r
      ));

    } catch (err: any) {
      alert("อัปโหลดล้มเหลว: " + (err.message || "ลองใหม่อีกครั้ง"));
    } finally {
      setUploadingId(null);
    }
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

        {user ? (
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xl">
              {user.full_name?.charAt(0) || user.username?.charAt(0)}
            </div>
            <div>
              <p className="font-black text-indigo-400">คิวของคุณ</p>
              <p className="text-zinc-400 text-sm">{user.full_name || user.username}</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="กรอกชื่อที่ใช้จอง..."
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
            <button
              onClick={() => search()}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-40 shadow-lg shadow-indigo-600/20"
            >
              {loading ? "..." : "ค้นหา"}
            </button>
          </div>
        )}

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
                <div key={r.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="flex gap-4">
                    {/* Character Card Image */}
                    <div className="relative w-16 h-16 shrink-0">
                      <img 
                        src={`/card/${r.card_id}.png`} 
                        alt={r.card?.label} 
                        className="w-full h-full object-cover rounded-xl border border-zinc-800"
                      />
                      <div className="absolute -top-2 -left-2 bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-lg">
                        #{r.queue_number}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-black text-white truncate">{r.card?.label || r.card_id}</h3>
                          <p className="text-indigo-400 font-bold text-xs">จอง {r.quantity} ใบ</p>
                        </div>
                        <div className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${st.color} ${st.bg || "bg-zinc-800/50"}`}>
                          {st.label}
                        </div>
                      </div>

                      {r.ingame_name && (
                        <div className="mt-2 flex items-center gap-1.5 text-zinc-500">
                          <div className="w-4 h-4 bg-zinc-800 rounded-full flex items-center justify-center">
                            <Gamepad2 size={10} className="text-zinc-400" />
                          </div>
                          <span className="text-[11px] font-medium truncate">รับโดย: <span className="text-zinc-300">{r.ingame_name}</span></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slip Upload Section */}
                  <div className="mt-4 pt-4 border-t border-zinc-800/50">
                    {r.slip_url ? (
                      <div className="flex items-center justify-between bg-green-500/5 border border-green-500/10 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-green-500/20">
                            <img src={r.slip_url} alt="สลิป" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-green-400 flex items-center gap-1">
                              <CheckCircle2 size={12} /> อัปโหลดสลิปแล้ว
                            </p>
                            <p className="text-[10px] text-zinc-500">รอ Admin ตรวจสอบ</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <a href={r.slip_url} target="_blank" className="text-[10px] font-bold text-indigo-400 hover:underline">ดูรูป</a>
                          {(r.status === "paid" || r.status === "queued") && (
                            <div className="relative group">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, r.id)}
                                disabled={!!uploadingId}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <button className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-all underline decoration-dotted">เปลี่ยนรูป</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : r.status === "queued" ? (
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, r.id)}
                          disabled={!!uploadingId}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        />
                        <div className={`flex items-center justify-center gap-2 py-2.5 border border-dashed rounded-xl transition-all ${
                          uploadingId === r.id 
                            ? "bg-zinc-800/50 border-zinc-700" 
                            : "bg-indigo-600/5 border-indigo-500/20 group-hover:border-indigo-500/40 group-hover:bg-indigo-600/10"
                        }`}>
                          {uploadingId === r.id ? (
                            <>
                              <Loader2 size={14} className="text-indigo-400 animate-spin" />
                              <span className="text-indigo-400 font-bold text-[11px]">กำลังอัปโหลด...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={14} className="text-indigo-400" />
                              <span className="text-indigo-400 font-bold text-[11px]">อัปโหลดสลิปชำระเงิน</span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : null}
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
