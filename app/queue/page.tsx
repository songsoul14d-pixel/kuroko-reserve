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
  queued: { label: "รอชำระเงิน", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  paid: { label: "ชำระแล้ว", color: "text-blue-400", bg: "bg-blue-500/10" },
  confirmed: { label: "ยืนยันแล้ว", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  delivered: { label: "ส่งแล้ว", color: "text-green-400", bg: "bg-green-500/10" },
  cancelled: { label: "ยกเลิก", color: "text-red-400", bg: "bg-red-500/10" },
};

export default function QueuePage() {
  const [name, setName] = useState("");
  const [results, setResults] = useState<(Reservation & { card?: Card })[]>([]);
  const [loading, setLoading] = useState(true);
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
        await claimLocalReservations();
        await search(true);
      } else {
        // No login — check localStorage for device-based history
        const localIds = getLocalReservationIds();
        if (localIds.length > 0) {
          await searchByIds(localIds);
        }
        setLoading(false);
      }

      // Fetch settings for QR
      const settingsRes = await fetch("/api/admin/settings");
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
    } catch (err) {
      console.error("Failed to fetch user or settings:", err);
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
    } finally {
      setLoading(false);
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
      let map = cardsMap;
      if (Object.keys(map).length === 0) {
        const cardsRes = await fetch("/api/cards");
        const cardsData: Card[] = await cardsRes.json();
        map = {};
        for (const c of cardsData) map[c.id] = c;
        setCardsMap(map);
      }

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
      <div className="max-w-lg mx-auto pt-12 md:pt-20 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white">คิวของฉัน</h1>
          <p className="text-zinc-500 text-sm">
            {user ? `สวัสดี ${user.full_name || user.username}` : "ตรวจสอบสถานะการจองของคุณ"}
          </p>
        </div>

        {/* Logged-in user badge */}
        {user && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {user.full_name?.charAt(0) || user.username?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">{user.full_name || user.username}</p>
              <p className="text-zinc-600 text-xs">เข้าสู่ระบบแล้ว</p>
            </div>
          </div>
        )}

        {/* Search bar — always visible, compact */}
        {!user && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="กรอกชื่อที่ใช้จอง..."
                className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>
            <button
              onClick={() => search()}
              disabled={loading}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors disabled:bg-zinc-800 disabled:text-zinc-600 text-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "ค้นหา"}
            </button>
          </div>
        )}

        {/* Payment QR — show when there are queued results */}
        {settings && results.some(r => r.status === "queued") && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 overflow-hidden">
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign size={16} className="text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-white">ชำระเงิน</p>
                  <p className="text-[10px] text-zinc-500">กดเพื่อดู QR PromptPay</p>
                </div>
              </div>
              <ChevronDown size={16} className={`text-zinc-500 transition-transform ${showQR ? 'rotate-180' : ''}`} />
            </button>

            {showQR && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col items-center gap-3"
              >
                <div className="p-3 bg-white rounded-xl">
                  <img
                    src={settings.promptpay_qr_url || "/promptpay-qr.jpg"}
                    alt="พร้อมเพย์"
                    className="w-40 h-40 object-contain"
                  />
                </div>
                {settings.payment_receiver_name && (
                  <p className="text-xs text-zinc-500">
                    ชื่อผู้รับ: <span className="text-white font-medium">{settings.payment_receiver_name}</span>
                  </p>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-zinc-600" size={24} />
          </div>
        )}

        {/* No results */}
        {searched && !loading && results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">ไม่พบรายการจอง</p>
            <Link href="/" className="text-indigo-400 text-sm mt-2 inline-block hover:text-indigo-300 transition-colors">
              เลือกจองการ์ด
            </Link>
          </div>
        )}

        {/* Reservation Cards */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((r) => {
              const st = STATUS_DISPLAY[r.status] || STATUS_DISPLAY.queued;
              const needsSlip = !r.slip_url && r.status !== "delivered" && r.status !== "cancelled";
              const needsProof = !r.proof_url && r.status !== "delivered" && r.status !== "cancelled";

              return (
                <div key={r.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                  <div className="flex gap-4">
                    <div className="relative w-14 h-[70px] shrink-0">
                      <img
                        src={`/card/${r.card_id}.png`}
                        alt={r.card?.label}
                        className="w-full h-full object-cover rounded-xl border border-white/[0.06]"
                      />
                      <div className="absolute -top-1.5 -left-1.5 bg-[#0a0a0a] border border-white/[0.06] text-zinc-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        #{r.queue_number}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-white text-sm leading-tight">{r.card?.label || r.card_id}</h3>
                          <p className="text-indigo-400 font-bold text-xs mt-0.5">฿{((r.card?.price || 0) * r.quantity).toLocaleString()}</p>
                        </div>
                        <div className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium ${st.color} ${st.bg}`}>
                          {st.label}
                        </div>
                      </div>

                      {r.ingame_name && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-600">
                          <Gamepad2 size={10} />
                          <span className="truncate">{r.ingame_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Section — only show for active reservations */}
                  {needsSlip && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
                      {/* Confirmation checkbox */}
                      <label className="flex items-center gap-2.5 px-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requestedIds[r.id] || false}
                          onChange={(e) => setRequestedIds(prev => ({ ...prev, [r.id]: e.target.checked }))}
                          className="w-3.5 h-3.5 rounded border-zinc-700 bg-white/[0.03] text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                        />
                        <span className="text-[11px] text-zinc-500">
                          กด <span className="text-indigo-400">&quot;ขอไอเทม&quot;</span> ในชมรมแล้ว
                        </span>
                      </label>

                      {/* Proof upload */}
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
                          <div className="flex items-center gap-2.5">
                            {r.proof_url ? (
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-green-500/10">
                                <img src={r.proof_url} alt="Proof" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                                <Gamepad2 size={14} className="text-zinc-600" />
                              </div>
                            )}
                            <div>
                              <p className={`text-xs font-medium ${r.proof_url ? "text-green-400" : "text-zinc-400"}`}>
                                {r.proof_url ? "หลักฐานเรียบร้อย" : "แนบหลักฐานในเกม"}
                              </p>
                            </div>
                          </div>
                          {uploadingId === r.id ? (
                            <Loader2 size={14} className="text-indigo-400 animate-spin" />
                          ) : r.proof_url ? (
                            <div className="p-1 rounded bg-green-500/10"><Checkmark /></div>
                          ) : (
                            <Upload size={14} className="text-zinc-600" />
                          )}
                        </div>
                      </div>

                      {/* Slip upload */}
                      <div className={`relative group/btn ${!requestedIds[r.id] ? "opacity-30 pointer-events-none" : ""}`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, r.id, 'slip')}
                          disabled={!!uploadingId || !requestedIds[r.id]}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        />
                        <div className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${
                          "bg-indigo-600/10 border-indigo-600/20 group-hover/btn:border-indigo-600/40"
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-600/10 flex items-center justify-center">
                              <Upload size={14} className="text-indigo-400" />
                            </div>
                            <p className="text-xs font-medium text-white">อัปโหลดสลิปโอนเงิน</p>
                          </div>
                          {uploadingId === r.id ? (
                            <Loader2 size={14} className="text-indigo-400 animate-spin" />
                          ) : (
                            <span className="text-[10px] text-zinc-500">เลือกไฟล์</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Already uploaded slip — show compact */}
                  {r.slip_url && r.status !== "delivered" && r.status !== "cancelled" && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <p className="text-xs text-zinc-400">รอแอดมินยืนยันยอดและจัดส่ง</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center pt-4">
          <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}

function Checkmark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
