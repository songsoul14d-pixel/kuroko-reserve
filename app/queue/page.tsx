"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Clock, Check, X, Package, User, Upload, Loader2, Shield, CheckCircle2, Gamepad2, ChevronDown, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Reservation {
  id: string;
  card_id: string;
  quantity: number;
  status: string;
  slip_url: string | null;
  proof_url: string | null;
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
  const [settings, setSettings] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const [requestedIds, setRequestedIds] = useState<Record<string, boolean>>({});

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
      // Fetch settings
      const settingsRes = await fetch("/api/admin/settings");
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
    } catch (err) {
      console.error("Failed to fetch user or settings:", err);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, reservationId: string, type: 'slip' | 'proof') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(reservationId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${reservationId}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `qr/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('slips')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('slips')
        .getPublicUrl(filePath);

      const updateData: any = { reservation_id: reservationId };
      if (type === 'slip') updateData.slip_url = publicUrl;
      else updateData.proof_url = publicUrl;

      const res = await fetch("/api/reserve/slip", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Failed to update database");

      // Update local state
      setResults(prev => prev.map(r => 
        r.id === reservationId 
          ? { 
              ...r, 
              ...(type === 'slip' ? { slip_url: publicUrl, status: "paid" } : { proof_url: publicUrl }) 
            } 
          : r
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

        {/* Payment Info Toggle */}
        {settings && results.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 overflow-hidden">
            <button 
              onClick={() => setShowQR(!showQR)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <DollarSign size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">ข้อมูลการชำระเงิน</p>
                  <p className="text-[10px] text-zinc-500">กดเพื่อดู QR Code และรายละเอียด</p>
                </div>
              </div>
              <ChevronDown size={18} className={`text-zinc-500 transition-transform ${showQR ? 'rotate-180' : ''}`} />
            </button>

            {showQR && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-6 pt-6 border-t border-zinc-800 flex flex-col items-center gap-4"
              >
                <div className="p-4 bg-white rounded-2xl shadow-xl shadow-indigo-500/10">
                  <img 
                    src={settings.promptpay_qr_url || "/promptpay-qr.jpg"} 
                    alt="พร้อมเพย์" 
                    className="w-48 h-48 object-contain" 
                  />
                </div>
                <div className="text-center">
                  <p className="text-zinc-400 text-xs">สแกน QR เพื่อชำระเงิน</p>
                  {settings.payment_receiver_name && (
                    <p className="text-indigo-400 font-bold text-sm mt-1">
                      ชื่อผู้รับ: {settings.payment_receiver_name}
                    </p>
                  )}
                  <p className="text-zinc-500 text-[10px] mt-2 max-w-[200px] mx-auto">
                    โอนแล้วอย่าลืมอัปโหลดสลิปที่รายการคิวของคุณด้านล่างครับ
                  </p>
                </div>
              </motion.div>
            )}
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

                  {/* Dual Upload Section */}
                  <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-3">
                    {/* In-game Proof Upload */}
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, r.id, 'proof')}
                        disabled={!!uploadingId}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                      />
                      <div className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                        r.proof_url ? "bg-green-500/5 border-green-500/10" : "bg-zinc-950 border-zinc-800 group-hover:border-indigo-500/30"
                      }`}>
                        <div className="flex items-center gap-3">
                          {r.proof_url ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-green-500/20">
                              <img src={r.proof_url} alt="Proof" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                              <Gamepad2 size={16} className="text-zinc-600" />
                            </div>
                          )}
                          <div>
                            <p className={`text-xs font-bold ${r.proof_url ? "text-green-400" : "text-zinc-400"}`}>
                              {r.proof_url ? "อัปโหลดรูปในเกมแล้ว" : "อัปโหลดรูปหลักฐานการขอ"}
                            </p>
                            <p className="text-[10px] text-zinc-500">{r.proof_url ? "แอดมินใช้ตรวจสอบเลขคิว" : "แคปหน้าจอตอนกดขอในชมรม"}</p>
                          </div>
                        </div>
                        {uploadingId === r.id ? (
                          <Loader2 size={14} className="text-indigo-400 animate-spin" />
                        ) : (
                          <Upload size={14} className={r.proof_url ? "text-green-400" : "text-zinc-600"} />
                        )}
                      </div>
                    </div>

                    {/* Request Confirmation Checkbox */}
                    {!r.slip_url && (
                      <label className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={requestedIds[r.id] || false}
                          onChange={(e) => setRequestedIds(prev => ({ ...prev, [r.id]: e.target.checked }))}
                          className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-[11px] text-zinc-400 font-bold group-hover:text-zinc-300 transition-colors leading-tight">
                          ฉันได้กด <span className="text-red-400">"ขอไอเทม"</span> ในชมรม Heal_Hee เรียบร้อยแล้ว (สำคัญมาก!)
                        </span>
                      </label>
                    )}

                    {/* Slip Upload */}
                    <div className={`relative group ${!r.slip_url && !requestedIds[r.id] ? "opacity-40 grayscale" : ""}`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, r.id, 'slip')}
                        disabled={!!uploadingId || (!r.slip_url && !requestedIds[r.id])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                      />
                      <div className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                        r.slip_url ? "bg-green-500/5 border-green-500/10" : "bg-zinc-950 border-zinc-800 group-hover:border-indigo-500/30"
                      }`}>
                        <div className="flex items-center gap-3">
                          {r.slip_url ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-green-500/20">
                              <img src={r.slip_url} alt="Slip" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                              <Upload size={16} className="text-zinc-600" />
                            </div>
                          )}
                          <div>
                            <p className={`text-xs font-bold ${r.slip_url ? "text-green-400" : "text-zinc-400"}`}>
                              {r.slip_url ? "อัปโหลดสลิปแล้ว" : "อัปโหลดสลิปชำระเงิน"}
                            </p>
                            <p className="text-[10px] text-zinc-500">{r.slip_url ? "รอแอดมินยืนยันยอด" : "โอนตามยอดที่แจ้งในใบจอง"}</p>
                          </div>
                        </div>
                        {uploadingId === r.id ? (
                          <Loader2 size={14} className="text-indigo-400 animate-spin" />
                        ) : (
                          <Upload size={14} className={r.slip_url ? "text-green-400" : "text-zinc-600"} />
                        )}
                      </div>
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
