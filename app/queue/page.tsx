"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Clock, Upload, Loader2, Gamepad2, ChevronDown, DollarSign } from "lucide-react";
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
  customer_name?: string;
  week_start?: string;
}

interface Card {
  id: string;
  label: string;
  price: number;
}

const STATUS_DISPLAY: Record<string, { label: string; color: string; bg: string }> = {
  queued: { label: "รอคิว", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  paid: { label: "ชำระแล้ว", color: "text-blue-400", bg: "bg-blue-500/10" },
  confirmed: { label: "ยืนยันแล้ว", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  delivered: { label: "ส่งแล้ว", color: "text-green-400", bg: "bg-green-500/10" },
  cancelled: { label: "ยกเลิก", color: "text-red-400", bg: "bg-red-500/10" },
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
        // Claim localStorage reservations to this profile
        await claimLocalReservations();
        await search(true);
      } else {
        // No login — check localStorage for device-based history
        const localIds = getLocalReservationIds();
        if (localIds.length > 0) {
          await searchByIds(localIds);
        }
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

  const getLocalReservationIds = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem("kuroko_reservation_ids") || "[]");
    } catch { return []; }
  };

  const searchByIds = async (ids: string[]) => {
    if (ids.length === 0) return;
    setSearched(true);
    try {
      let map = cardsMap;
      if (Object.keys(map).length === 0) {
        const cardsRes = await fetch("/api/cards");
        const cardsData: Card[] = await cardsRes.json();
        map = {};
        for (const c of cardsData) map[c.id] = c;
        setCardsMap(map);
      }
      const res = await fetch(`/api/my-reservations?ids=${ids.join(",")}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data.map((r: Reservation) => ({ ...r, card: map[r.card_id] })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const claimLocalReservations = async () => {
    const localIds = getLocalReservationIds();
    if (localIds.length === 0) return;
    try {
      const res = await fetch("/api/reservations/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: localIds }),
      });
      const data = await res.json();
      // Clear localStorage after claiming
      if (data.claimed > 0) {
        localStorage.removeItem("kuroko_reservation_ids");
      }
    } catch (err) {
      console.error("Claim failed:", err);
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
    <div className="min-h-screen bg-[#0a0a0a] p-4 font-body">
      <div className="max-w-lg mx-auto pt-12 md:pt-20 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white">
            ตรวจสอบคิว
          </h1>
          <p className="text-zinc-500 text-sm">กรอกชื่อเพื่อดูสถานะและคิวการรับของของคุณ</p>
        </div>

        {user ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {user.full_name?.charAt(0) || user.username?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-white text-base">ยินดีต้อนรับ</p>
              <p className="text-zinc-500 text-sm">{user.full_name || user.username}</p>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-zinc-400" />
              </div>
              <div>
                <p className="font-bold text-white text-base">ประวัติการจอง</p>
                <p className="text-zinc-500 text-sm">{results.length} รายการจากเครื่องนี้</p>
              </div>
            </div>
            <Link href="/login?redirect=/queue" className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs transition-colors">
              บันทึก
            </Link>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="กรอกชื่อที่ใช้จอง..."
                className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>
            <button
              onClick={() => search()}
              disabled={loading}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors disabled:bg-zinc-800 disabled:text-zinc-600"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "ค้นหา"}
            </button>
          </div>
        )}

        {/* Payment Info Toggle */}
        {settings && results.length > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 overflow-hidden">
            <button 
              onClick={() => setShowQR(!showQR)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <DollarSign size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-white">ข้อมูลการชำระเงิน</p>
                  <p className="text-[10px] text-zinc-500">กดเพื่อดู QR Code และรายละเอียด</p>
                </div>
              </div>
              <ChevronDown size={16} className={`text-zinc-500 transition-transform ${showQR ? 'rotate-180' : ''}`} />
            </button>

            {showQR && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-5 pt-5 border-t border-white/[0.06] flex flex-col items-center gap-3"
              >
                <div className="p-4 bg-white rounded-2xl">
                  <img 
                    src={settings.promptpay_qr_url || "/promptpay-qr.jpg"} 
                    alt="พร้อมเพย์" 
                    className="w-44 h-44 object-contain" 
                  />
                </div>
                <div className="text-center">
                  <p className="text-zinc-500 text-xs">สแกน QR เพื่อชำระเงิน</p>
                  {settings.payment_receiver_name && (
                    <p className="text-indigo-400 font-medium text-sm mt-1">
                      ชื่อผู้รับ: {settings.payment_receiver_name}
                    </p>
                  )}
                  <p className="text-zinc-600 text-[10px] mt-2 max-w-[200px] mx-auto">
                    โอนแล้วอย่าลืมอัปโหลดสลิปที่รายการคิวของคุณด้านล่างครับ
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {searched && results.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <p className="text-base">ไม่พบคิวของคุณ</p>
            <p className="text-sm mt-1">ลองเช็คชื่อที่ใช้จองใหม่นะ</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((r) => {
              const st = STATUS_DISPLAY[r.status] || STATUS_DISPLAY.queued;
              return (
                <div key={r.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden">
                  
                  <div className="flex gap-4">
                    {/* Character Card Image */}
                    <div className="relative w-16 h-20 shrink-0">
                      <img 
                        src={`/card/${r.card_id}.png`} 
                        alt={r.card?.label} 
                        className="w-full h-full object-cover rounded-xl border border-white/[0.06]"
                      />
                      <div className="absolute -top-2 -left-2 bg-[#0a0a0a] border border-white/[0.06] text-zinc-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        #{r.queue_number}
                      </div>
                    </div>
 
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-white text-base leading-tight">{r.card?.label || r.card_id}</h3>
                          <p className="text-indigo-400 font-bold text-sm mt-0.5">฿{((r.card?.price || 0) * r.quantity).toLocaleString()}</p>
                        </div>
                        <div className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium ${st.color} ${st.bg}`}>
                          {st.label}
                        </div>
                      </div>
 
                      {r.ingame_name && (
                        <div className="mt-3 flex items-center gap-2 px-2.5 py-1 bg-white/[0.02] rounded-lg border border-white/[0.04] w-fit">
                          <Gamepad2 size={10} className="text-zinc-600" />
                          <span className="text-[10px] font-medium text-zinc-500 truncate max-w-[120px]">
                            {r.ingame_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
 
                  {/* Dual Upload Section */}
                  <div className="mt-5 pt-5 border-t border-white/[0.06] grid grid-cols-1 gap-3">
                    
                    {/* In-game Proof Upload */}
                    <div className="relative group/btn">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, r.id, 'proof')}
                        disabled={!!uploadingId}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                      />
                      <div className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${
                        r.proof_url ? "bg-green-500/5 border-green-500/10" : "bg-white/[0.02] border-white/[0.06] group-hover/btn:border-white/[0.12]"
                      }`}>
                        <div className="flex items-center gap-3">
                          {r.proof_url ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-green-500/10">
                              <img src={r.proof_url} alt="Proof" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                              <Gamepad2 size={16} className="text-zinc-600" />
                            </div>
                          )}
                          <div>
                            <p className={`text-xs font-medium ${r.proof_url ? "text-green-400" : "text-zinc-400"}`}>
                              {r.proof_url ? "อัปโหลดหลักฐานแล้ว" : "อัปโหลดหลักฐาน"}
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-0.5">แคปหน้าจอตอนกดขอในชมรม</p>
                          </div>
                        </div>
                        {uploadingId === r.id ? (
                          <Loader2 size={14} className="text-indigo-400 animate-spin" />
                        ) : (
                          <div className={`p-1.5 rounded-lg ${r.proof_url ? 'bg-green-500/10' : 'bg-white/[0.03]'}`}>
                            <Upload size={14} className={r.proof_url ? "text-green-400" : "text-zinc-600"} />
                          </div>
                        )}
                      </div>
                    </div>
 
                    {/* Request Confirmation Checkbox */}
                    {!r.slip_url && (
                      <label className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl cursor-pointer hover:bg-white/[0.04] transition-colors">
                        <input 
                          type="checkbox" 
                          checked={requestedIds[r.id] || false}
                          onChange={(e) => setRequestedIds(prev => ({ ...prev, [r.id]: e.target.checked }))}
                          className="w-4 h-4 rounded border-zinc-700 bg-white/[0.03] text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                        />
                        <span className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                          ฉันได้กด <span className="text-indigo-400">&quot;ขอไอเทม&quot;</span> ในชมรมแล้ว
                        </span>
                      </label>
                    )}
 
                    {/* Slip Upload */}
                    <div className={`relative group/btn ${!r.slip_url && !requestedIds[r.id] ? "opacity-30 pointer-events-none" : ""}`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, r.id, 'slip')}
                        disabled={!!uploadingId || (!r.slip_url && !requestedIds[r.id])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                      />
                      <div className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${
                        r.slip_url ? "bg-green-500/5 border-green-500/10" : "bg-white/[0.02] border-white/[0.06] group-hover/btn:border-white/[0.12]"
                      }`}>
                        <div className="flex items-center gap-3">
                          {r.slip_url ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-green-500/10">
                              <img src={r.slip_url} alt="Slip" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-600/10 flex items-center justify-center">
                              <Upload size={16} className="text-indigo-400" />
                            </div>
                          )}
                          <div>
                            <p className={`text-xs font-medium ${r.slip_url ? "text-green-400" : "text-white"}`}>
                              {r.slip_url ? "ชำระเงินเรียบร้อย" : "อัปโหลดสลิป"}
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-0.5">{r.slip_url ? "รอแอดมินยืนยันยอด" : "โอนตามยอดที่แจ้งในใบจอง"}</p>
                          </div>
                        </div>
                        {uploadingId === r.id ? (
                          <Loader2 size={14} className="text-indigo-400 animate-spin" />
                        ) : (
                          <div className={`p-1.5 rounded-lg ${r.slip_url ? 'bg-green-500/10' : 'bg-indigo-600'}`}>
                            <Upload size={14} className={r.slip_url ? "text-green-400" : "text-white"} />
                          </div>
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
          <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
