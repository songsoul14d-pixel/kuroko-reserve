"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Package,
  Users,
  Clock,
  DollarSign,
  RefreshCw,
  Check,
  X,
  ChevronDown,
} from "lucide-react";

interface Reservation {
  id: string;
  card_id: string;
  customer_name: string;
  facebook_url: string | null;
  quantity: number;
  status: string;
  week_start: string;
  queue_number: number;
  slip_url: string | null;
  notes: string | null;
  created_at: string;
}

interface Card {
  id: string;
  label: string;
  category: string;
  price: number;
  image_url: string | null;
}

interface Props {
  weekStart: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  queued: { label: "รอคิว", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  paid: { label: "ชำระแล้ว", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  confirmed: { label: "ยืนยันแล้ว", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  delivered: { label: "ส่งแล้ว", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  cancelled: { label: "ยกเลิก", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

export default function AdminClient({ weekStart }: Props) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [cardFilter, setCardFilter] = useState<string>("all");
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(weekStart);

  // Reload when week changes (after auth)
  const [weekDataLoaded, setWeekDataLoaded] = useState<string | null>(null);
  if (authenticated && selectedWeek !== weekDataLoaded) {
    setWeekDataLoaded(selectedWeek);
    refresh();
  }

  const shiftWeek = (dir: number) => {
    const d = new Date(selectedWeek);
    d.setDate(d.getDate() + 7 * dir);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    setSelectedWeek(d.toISOString().split("T")[0]);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

  const adminHeaders = { "x-admin-pin": pinInput };

  const loadData = useCallback(async () => {
    const [resRes, cardsRes] = await Promise.all([
      fetch(`/api/admin/reservations?week_start=${selectedWeek}`, { headers: adminHeaders }),
      fetch("/api/cards"),
    ]);
    const resData = await resRes.json();
    const cardsData = await cardsRes.json();
    setReservations(resData);
    setCards(cardsData);
  }, [selectedWeek, pinInput]);

  const handleLogin = async () => {
    setAuthLoading(true);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pinInput }),
    });
    const data = await res.json();
    if (data.valid) {
      setAuthenticated(true);
      // Load data after auth
      const [resRes, cardsRes] = await Promise.all([
        fetch(`/api/admin/reservations?week_start=${selectedWeek}`, { headers: { "x-admin-pin": pinInput } }),
        fetch("/api/cards"),
      ]);
      setReservations(await resRes.json());
      setCards(await cardsRes.json());
    } else {
      setPinError(true);
    }
    setAuthLoading(false);
  };

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/admin/reservations?week_start=${selectedWeek}`, { headers: adminHeaders });
    setReservations(await res.json());
  }, [selectedWeek, pinInput]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...adminHeaders },
      body: JSON.stringify({ id, status }),
    });
    await refresh();
  };

  // PIN login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h1 className="text-xl font-black mb-4">Admin Login</h1>
          <input
            type="password"
            value={pinInput}
            onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
            placeholder="ใส่ PIN"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-indigo-500"
            autoFocus
          />
          {pinError && <p className="text-red-400 text-sm mt-2">PIN ไม่ถูกต้อง</p>}
          <button
            onClick={handleLogin}
            disabled={authLoading}
            className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-40"
          >
            {authLoading ? "กำลังตรวจ..." : "เข้าสู่ระบบ"}
          </button>
          <a href="/" className="block mt-4 text-sm text-zinc-500 hover:text-indigo-400">← กลับหน้าหลัก</a>
        </div>
      </div>
    );
  }

  const cardMap = Object.fromEntries(cards.map((c) => [c.id, c]));

  const filtered = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);
  const cardFiltered = cardFilter === "all" ? filtered : filtered.filter((r) => r.card_id === cardFilter);

  const stats = {
    total: reservations.length,
    queued: reservations.filter((r) => r.status === "queued").length,
    paid: reservations.filter((r) => r.status === "paid").length,
    delivered: reservations.filter((r) => r.status === "delivered").length,
    revenue: reservations
      .filter((r) => r.status === "delivered" || r.status === "paid" || r.status === "confirmed")
      .reduce((s, r) => s + r.quantity * (cardMap[r.card_id]?.price || 0), 0),
  };

  // Group by card
  const groupedByCard: Record<string, Reservation[]> = {};
  for (const r of cardFiltered) {
    if (!groupedByCard[r.card_id]) groupedByCard[r.card_id] = [];
    groupedByCard[r.card_id].push(r);
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black">🛡️ <span className="text-indigo-400">Admin</span> Panel</h1>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => shiftWeek(-1)} className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all">
                <ChevronLeft size={14} />
              </button>
              <span className="text-zinc-500 text-sm font-bold">
                {selectedWeek === weekStart ? "📌 " : ""}{formatDate(selectedWeek)}
              </span>
              <button onClick={() => shiftWeek(1)} className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all">
                <ChevronRight size={14} />
              </button>
              {selectedWeek !== weekStart && (
                <button onClick={() => setSelectedWeek(weekStart)} className="text-[10px] px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg font-bold hover:bg-indigo-600/30 transition-all">
                  กลับสัปดาห์นี้
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refresh} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all">
              <RefreshCw size={16} />
            </button>
            <Link href="/" className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all">
              <ArrowLeft size={14} /> หน้าลูกค้า
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: <Users size={16} />, label: "ทั้งหมด", value: stats.total, color: "text-indigo-400" },
            { icon: <Clock size={16} />, label: "รอคิว", value: stats.queued, color: "text-yellow-400" },
            { icon: <DollarSign size={16} />, label: "ชำระแล้ว", value: stats.paid, color: "text-blue-400" },
            { icon: <Package size={16} />, label: "ส่งแล้ว", value: stats.delivered, color: "text-green-400" },
            { icon: <DollarSign size={16} />, label: "รายได้", value: `฿${stats.revenue.toLocaleString()}`, color: "text-indigo-400" },
          ].map((s, i) => (
            <div key={i} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
              <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-zinc-500 font-bold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter by status */}
        <div className="flex gap-2 flex-wrap">
          {["all", "queued", "paid", "confirmed", "delivered", "cancelled"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? "bg-indigo-600 text-white" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"}`}>
              {f === "all" ? "ทั้งหมด" : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>

        {/* Card filter button */}
        <button
          onClick={() => setShowCardPicker(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all"
        >
          {cardFilter === "all" ? (
            <>
              <img src={`/card/${cards[0]?.id}.png`} alt="" className="w-5 h-5 rounded object-cover" />
              <img src={`/card/${cards[3]?.id}.png`} alt="" className="w-5 h-5 rounded object-cover -ml-2" />
              <img src={`/card/${cards[6]?.id}.png`} alt="" className="w-5 h-5 rounded object-cover -ml-2" />
              <span className="text-zinc-400">ทุกตัวละคร</span>
            </>
          ) : (
            <>
              <img src={`/card/${cardFilter}.png`} alt={cardMap[cardFilter]?.label} className="w-6 h-6 rounded object-cover" />
              <span className="text-indigo-400">{cardMap[cardFilter]?.label}</span>
            </>
          )}
          <ChevronDown size={14} className="text-zinc-500" />
        </button>

        {/* Card Picker Modal */}
        {showCardPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowCardPicker(false)}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg">เลือกตัวละคร</h3>
                <button onClick={() => setShowCardPicker(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                  <X size={18} className="text-zinc-500" />
                </button>
              </div>

              {/* All button */}
              <button
                onClick={() => { setCardFilter("all"); setShowCardPicker(false); }}
                className={`w-full p-3 mb-3 rounded-xl border transition-all flex items-center gap-3 ${cardFilter === "all" ? "bg-indigo-600/10 border-indigo-500/30" : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"}`}
              >
                <div className="w-10 h-10 bg-zinc-700 rounded-xl flex items-center justify-center text-lg">🏀</div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-sm">ทุกตัวละคร</p>
                  <p className="text-xs text-zinc-500">แสดงคิวทั้งหมด</p>
                </div>
                {cardFilter === "all" && <Check size={16} className="text-indigo-400" />}
              </button>

              {/* Grouped by category */}
              {["standard", "SP", "LG"].map((cat) => {
                const catCards = cards.filter((c) => c.category === cat);
                if (catCards.length === 0) return null;
                return (
                  <div key={cat} className="mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2 px-1">
                      {cat === "SP" ? "SP" : cat === "LG" ? "Last Game" : "Standard"}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {catCards.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => { setCardFilter(cardFilter === card.id ? "all" : card.id); setShowCardPicker(false); }}
                          className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                            cardFilter === card.id
                              ? "bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/30"
                              : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"
                          }`}
                        >
                          <img src={`/card/${card.id}.png`} alt={card.label} className="w-12 h-12 rounded-xl object-cover" />
                          <span className="text-[11px] font-bold truncate w-full text-center">{card.label}</span>
                          <span className="text-[9px] text-indigo-400 font-bold">฿{card.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List grouped by card */}
        <div className="space-y-6">
          {Object.entries(groupedByCard).length === 0 ? (
            <p className="text-center text-zinc-500 py-12">ไม่มีรายการ</p>
          ) : (
            Object.entries(groupedByCard).map(([cardId, cardReservations]) => {
              const card = cardMap[cardId];
              return (
                <div key={cardId}>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
                    <img src={`/card/${cardId}.png`} alt={card?.label} className="w-6 h-6 rounded object-cover" />
                    {card?.label || cardId} ({cardReservations.length} คิว)
                  </h3>
                  <div className="space-y-2">
                    {cardReservations.map((r) => {
                      const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.queued;
                      return (
                        <div key={r.id} className={`p-4 rounded-xl border ${st.bg}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-lg font-black text-indigo-400 shrink-0">#{r.queue_number}</div>
                              <div>
                                <p className="font-bold">{r.customer_name}</p>
                                <p className="text-sm text-zinc-400">× {r.quantity} = <span className="text-indigo-400 font-bold">฿{(r.quantity * (card?.price || 0)).toLocaleString()}</span></p>
                                {r.notes && <p className="text-xs text-zinc-500 mt-1">📝 {r.notes}</p>}
                                <p className="text-[10px] text-zinc-600 mt-1">{new Date(r.created_at).toLocaleString("th-TH")}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${st.color} ${st.bg}`}>{st.label}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800/50">
                            {r.facebook_url && (
                              <a href={r.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all">
                                <MessageCircle size={12} /> ทัก Facebook
                              </a>
                            )}
                            {r.status === "queued" && (
                              <button onClick={() => updateStatus(r.id, "paid")} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all">💰 ชำระแล้ว</button>
                            )}
                            {r.status === "paid" && (
                              <button onClick={() => updateStatus(r.id, "confirmed")} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs font-bold text-purple-400 hover:bg-purple-500/20 transition-all">✅ ยืนยัน</button>
                            )}
                            {r.status === "confirmed" && (
                              <button onClick={() => updateStatus(r.id, "delivered")} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs font-bold text-green-400 hover:bg-green-500/20 transition-all">📦 ส่งแล้ว</button>
                            )}
                            {r.status !== "cancelled" && r.status !== "delivered" && (
                              <button onClick={() => updateStatus(r.id, "cancelled")} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all">❌ ยกเลิก</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
