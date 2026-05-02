"use client";

import { useState } from "react";
import { Card, CARD_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { Lock, Users, ChevronRight } from "lucide-react";

interface Props {
  cards: Card[];
}

export default function CardGridClient({ cards }: Props) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    facebookUrl: "",
    quantity: 1,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; queueNumber?: number; total?: number; message?: string } | null>(null);

  const handleSubmit = async () => {
    if (!selectedCard || !formData.name.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_id: selectedCard,
          customer_name: formData.name.trim(),
          facebook_url: formData.facebookUrl.trim() || null,
          quantity: formData.quantity,
          notes: formData.notes.trim() || null,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setResult({ success: false, message: data.error });
      } else {
        setResult({ success: true, queueNumber: data.queue_number, total: data.total });
      }
    } catch {
      setResult({ success: false, message: "เกิดข้อผิดพลาด ลองใหม่" });
    }
    setSubmitting(false);
  };

  // Group cards by category
  const grouped = cards.reduce((acc, card) => {
    if (!acc[card.category]) acc[card.category] = [];
    acc[card.category].push(card);
    return acc;
  }, {} as Record<string, Card[]>);

  const categoryOrder = ["standard", "SP", "LG"];

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      {/* Result Modal */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full text-center">
            {result.success ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-black text-green-400">จองสำเร็จ!</h2>
                <p className="text-zinc-400 mt-2">
                  คิว {cards.find(c => c.id === selectedCard)?.label} ของคุณ: <span className="text-3xl font-black text-indigo-400">#{result.queueNumber}</span>
                </p>
                <p className="text-zinc-300 text-lg font-bold mt-2">
                  ยอดชำระ: <span className="text-green-400">฿{result.total?.toLocaleString()}</span>
                </p>

                {/* QR PromptPay */}
                <div className="mt-4 p-4 bg-white rounded-2xl inline-block">
                  <img src="/promptpay-qr.jpg" alt="พร้อมเพย์" className="w-48 h-48 object-contain" />
                </div>
                <p className="text-zinc-400 text-sm mt-2">สแกน QR เพื่อชำระเงิน แล้วส่งสลิปมาทาง <a href="https://www.facebook.com/wachirawit.dongdee/" target="_blank" className="text-blue-400 underline hover:text-blue-300">Facebook</a></p>

                <p className="text-zinc-500 text-xs mt-3">
                  ชำระแล้วจะได้รับการ์ดภายในสัปดาห์นี้
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-xl font-black text-red-400">จองไม่สำเร็จ</h2>
                <p className="text-zinc-400 mt-2">{result.message}</p>
              </>
            )}
            <button
              onClick={() => { setResult(null); setShowForm(false); setSelectedCard(null); setFormData({ name: "", facebookUrl: "", quantity: 1, notes: "" }); }}
              className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Reserve Form Modal */}
      {showForm && selectedCard && !result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-black mb-1">จองคิว — {cards.find(c => c.id === selectedCard)?.label}</h2>
            <p className="text-zinc-500 text-sm mb-4">
              ราคา ฿{cards.find(c => c.id === selectedCard)?.price}/ใบ
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1 block">ชื่อ-นามสกุล / ชื่อ Facebook *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="ชื่อที่ใช้ติดต่อ"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1 block">ลิงก์ Facebook</label>
                <input
                  type="text"
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1 block">จำนวน (ใบ)</label>
                <select
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                >
                  {[1, 2, 3].map(n => (
                    <option key={n} value={n}>{n} ใบ (฿{(n * (cards.find(c => c.id === selectedCard)?.price || 0)).toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1 block">หมายเหตุ</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 h-20 resize-none"
                  placeholder="ข้อความเพิ่มเติม..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowForm(false); setSelectedCard(null); }}
                className="flex-1 py-3 border border-zinc-700 rounded-xl font-bold text-zinc-400 hover:bg-zinc-800 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name.trim() || submitting}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-40"
              >
                {submitting ? "กำลังจอง..." : "ยืนยันจองคิว"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Grid by Category */}
      {categoryOrder.map((cat) => {
        const catCards = grouped[cat];
        if (!catCards || catCards.length === 0) return null;

        return (
          <div key={cat} className="mb-10">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${cat === "SP" ? "bg-purple-500" : cat === "LG" ? "bg-orange-500" : "bg-blue-500"}`} />
              {CATEGORY_LABELS[cat] || cat}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {catCards.map((card) => {
                const color = CARD_COLORS[card.id] || "#6366f1";
                return (
                  <button
                    key={card.id}
                    onClick={() => { setSelectedCard(card.id); setShowForm(true); }}
                    className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-left hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-all overflow-hidden"
                  >
                    {/* Color accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 opacity-60" style={{ backgroundColor: color }} />

                    {/* Image placeholder */}
                    <div
                      className="w-full aspect-square rounded-xl mb-3 flex items-center justify-center text-5xl overflow-hidden bg-zinc-800"
                    >
                      <img 
                        src={card.image_url || `/card/${card.id}.png`} 
                        alt={card.label} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    </div>

                    <p className="font-bold text-sm truncate">{card.label}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-indigo-400 font-black">฿{card.price}</span>
                      <ChevronRight size={14} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* How it works */}
      <div className="mt-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
        <h3 className="font-black text-lg mb-4 text-center">ทำงานยังไง?</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          {[
            { step: "1", icon: "👆", title: "เลือกการ์ด", desc: "กดเลือกตัวที่อยากได้" },
            { step: "2", icon: "📝", title: "กรอกข้อมูล", desc: "ชื่อ + Facebook + จำนวน" },
            { step: "3", icon: "⏳", title: "รอคิว", desc: "ดูตำแหน่งคิวของคุณ" },
            { step: "4", icon: "✅", title: "รับการ์ด", desc: "เราทักไปเมื่อพร้อมส่ง" },
          ].map((s) => (
            <div key={s.step} className="p-4">
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="font-bold text-sm">{s.title}</p>
              <p className="text-zinc-500 text-xs mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
