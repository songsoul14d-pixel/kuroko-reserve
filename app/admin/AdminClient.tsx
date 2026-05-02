"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  X,
  MessageCircle,
  Package,
  Users,
  Clock,
  DollarSign,
  RefreshCw,
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
}

interface Props {
  reservations: Reservation[];
  cards: Card[];
  weekStart: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  queued: { label: "รอคิว", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  paid: { label: "ชำระแล้ว", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  confirmed: { label: "ยืนยันแล้ว", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  delivered: { label: "ส่งแล้ว", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  cancelled: { label: "ยกเลิก", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

export default function AdminClient({ reservations: initialReservations, cards, weekStart }: Props) {
  const [reservations, setReservations] = useState(initialReservations);
  const [filter, setFilter] = useState<string>("all");

  const cardMap = Object.fromEntries(cards.map((c) => [c.id, c]));

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/admin/reservations?week_start=${weekStart}`);
    const data = await res.json();
    setReservations(data);
  }, [weekStart]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await refresh();
  };

  const filtered = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);

  const stats = {
    total: reservations.length,
    queued: reservations.filter((r) => r.status === "queued").length,
    paid: reservations.filter((r) => r.status === "paid").length,
    delivered: reservations.filter((r) => r.status === "delivered").length,
    revenue: reservations
      .filter((r) => r.status === "delivered" || r.status === "paid" || r.status === "confirmed")
      .reduce((s, r) => s + r.quantity * (cardMap[r.card_id]?.price || 0), 0),
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black">
              🛡️ <span className="text-indigo-400">Admin</span> Panel
            </h1>
            <p className="text-zinc-500 text-sm mt-1">สัปดาห์ {formatDate(weekStart)}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refresh} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all">
              <RefreshCw size={16} />
            </button>
            <Link href="/" className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all">
              <ArrowLeft size={14} />
              หน้าลูกค้า
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

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", "queued", "paid", "confirmed", "delivered", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f ? "bg-indigo-600 text-white" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {f === "all" ? "ทั้งหมด" : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-zinc-500 py-12">ไม่มีรายการ</p>
          ) : (
            filtered.map((r) => {
              const card = cardMap[r.card_id];
              const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.queued;
              return (
                <div key={r.id} className={`p-4 rounded-xl border ${st.bg}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Queue number */}
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-lg font-black text-indigo-400 shrink-0">
                        #{r.queue_number}
                      </div>
                      <div>
                        <p className="font-bold">{r.customer_name}</p>
                        <p className="text-sm text-zinc-400">
                          {card?.label || r.card_id} × {r.quantity} = <span className="text-indigo-400 font-bold">฿{(r.quantity * (card?.price || 0)).toLocaleString()}</span>
                        </p>
                        {r.notes && <p className="text-xs text-zinc-500 mt-1">📝 {r.notes}</p>}
                        <p className="text-[10px] text-zinc-600 mt-1">{new Date(r.created_at).toLocaleString("th-TH")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${st.color} ${st.bg}`}>
                        {st.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800/50">
                    {r.facebook_url && (
                      <a
                        href={r.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all"
                      >
                        <MessageCircle size={12} /> ทัก Facebook
                      </a>
                    )}
                    {r.status === "queued" && (
                      <button onClick={() => updateStatus(r.id, "paid")} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all">
                        💰 ชำระแล้ว
                      </button>
                    )}
                    {r.status === "paid" && (
                      <button onClick={() => updateStatus(r.id, "confirmed")} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs font-bold text-purple-400 hover:bg-purple-500/20 transition-all">
                        ✅ ยืนยัน
                      </button>
                    )}
                    {r.status === "confirmed" && (
                      <button onClick={() => updateStatus(r.id, "delivered")} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs font-bold text-green-400 hover:bg-green-500/20 transition-all">
                        📦 ส่งแล้ว
                      </button>
                    )}
                    {r.status !== "cancelled" && r.status !== "delivered" && (
                      <button onClick={() => updateStatus(r.id, "cancelled")} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all">
                        ❌ ยกเลิก
                      </button>
                    )}
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
