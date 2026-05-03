"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CARD_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { ChevronRight, Sparkles, Shield, Zap, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";

interface Props {
  cards: Card[];
}

export default function CardGridClient({ cards }: Props) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", facebookUrl: "", quantity: 1, weeks: 1, notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; queueNumber?: number; total?: number; weeks?: number; message?: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

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
          weeks: formData.weeks,
          notes: formData.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setResult({ success: false, message: data.error });
      } else {
        setResult({ success: true, queueNumber: data.queue_number, total: data.total, weeks: data.weeks_created });
        // Fire confetti
        import("canvas-confetti").then((confetti) => {
          confetti.default({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#818cf8", "#6366f1", "#a78bfa", "#fbbf24"] });
          setTimeout(() => confetti.default({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } }), 200);
          setTimeout(() => confetti.default({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } }), 400);
        });
      }
    } catch {
      setResult({ success: false, message: "เกิดข้อผิดพลาด ลองใหม่" });
    }
    setSubmitting(false);
  };

  const grouped = cards.reduce((acc, card) => {
    if (!acc[card.category]) acc[card.category] = [];
    acc[card.category].push(card);
    return acc;
  }, {} as Record<string, Card[]>);

  const categoryOrder = ["standard", "SP", "LG"];
  const selectedCardData = cards.find((c) => c.id === selectedCard);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-2xl shadow-indigo-500/25"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden"
            >
              {/* Glow effect */}
              {result.success && (
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
              )}

              {result.success ? (
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.1 }}
                    className="w-20 h-20 mx-auto mb-4 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 size={40} className="text-green-400" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                  >
                    จองสำเร็จ!
                  </motion.h2>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4"
                  >
                    <p className="text-zinc-400">คิว {selectedCardData?.label} ของคุณ</p>
                    <p className="text-5xl font-black text-indigo-400 mt-1">#{result.queueNumber}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <span className="text-zinc-400 text-sm">ยอดชำระ</span>
                      <span className="text-green-400 text-xl font-black">฿{result.total?.toLocaleString()}</span>
                    </div>
                    {result.weeks && result.weeks > 1 && (
                      <p className="text-sm text-zinc-500 mt-2">
                        📅 จอง {result.weeks} สัปดาห์ ({formData.quantity} ใบ × {result.weeks} สัปดาห์)
                      </p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-5"
                  >
                    <div className="p-4 bg-white rounded-2xl inline-block shadow-lg shadow-white/5">
                      <img src="/promptpay-qr.jpg" alt="พร้อมเพย์" className="w-44 h-44 object-contain" />
                    </div>
                    <p className="text-zinc-400 text-sm mt-3">
                      สแกน QR เพื่อชำระเงิน แล้วส่งสลิปมาทาง{" "}
                      <a href="https://www.facebook.com/wachirawit.dongdee/" target="_blank" className="text-blue-400 underline hover:text-blue-300 font-bold">
                        Facebook
                      </a>
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4 flex items-center justify-center gap-2 text-zinc-500 text-xs"
                  >
                    <Clock size={12} />
                    ชำระแล้วจะได้รับการ์ดภายในสัปดาห์นี้
                  </motion.div>
                </div>
              ) : (
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.1 }}
                    className="w-20 h-20 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center"
                  >
                    <AlertCircle size={40} className="text-red-400" />
                  </motion.div>
                  <h2 className="text-xl font-black text-red-400">จองไม่สำเร็จ</h2>
                  <p className="text-zinc-400 mt-2">{result.message}</p>
                </div>
              )}

              <button
                onClick={() => { setResult(null); setShowForm(false); setSelectedCard(null); setFormData({ name: "", facebookUrl: "", quantity: 1, weeks: 1, notes: "" }); }}
                className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all w-full"
              >
                ปิด
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reserve Form Modal */}
      <AnimatePresence>
        {showForm && selectedCard && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-md w-full relative overflow-hidden"
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black">จองคิว</h2>
                  <p className="text-indigo-400 font-bold text-sm">{selectedCardData?.label}</p>
                </div>
                <button onClick={() => { setShowForm(false); setSelectedCard(null); }} className="p-2 hover:bg-zinc-800 rounded-lg transition-all">
                  <X size={18} className="text-zinc-500" />
                </button>
              </div>

              {/* Price badge */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <span className="text-xs text-zinc-400">ราคา</span>
                <span className="text-indigo-400 font-black text-lg">฿{selectedCardData?.price}</span>
                <span className="text-xs text-zinc-500">/ใบ</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-400 mb-1 block">ชื่อ-นามสกุล / ชื่อ Facebook *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    placeholder="ชื่อที่ใช้ติดต่อ"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 mb-1 block">ลิงก์ Facebook</label>
                  <input
                    type="text"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 mb-1 block">จำนวน (ใบ)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormData({ ...formData, quantity: n })}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                          formData.quantity === n
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-indigo-500/50"
                        }`}
                      >
                        {n} ใบ
                        <span className="block text-[10px] mt-0.5 opacity-70">
                          ฿{(n * (selectedCardData?.price || 0)).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 mb-1 block">จองกี่สัปดาห์?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setFormData({ ...formData, weeks: w })}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                          formData.weeks === w
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-indigo-500/50"
                        }`
                      }
                      >
                        {w} สัปดาห์
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 mb-1 block">หมายเหตุ</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 h-16 resize-none transition-all"
                    placeholder="ข้อความเพิ่มเติม..."
                  />
                </div>
              </div>

              {/* Total preview */}
              <div className="mt-4 flex items-center justify-between px-4 py-3 bg-zinc-800/50 rounded-xl">
                <span className="text-sm text-zinc-400">รวม</span>
                <span className="text-xl font-black text-indigo-400">
                  ฿{(formData.quantity * (selectedCardData?.price || 0) * formData.weeks).toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!formData.name.trim() || submitting}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    กำลังจอง...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    ยืนยันจองคิว
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Grid by Category */}
      {categoryOrder.map((cat) => {
        const catCards = grouped[cat];
        if (!catCards || catCards.length === 0) return null;

        return (
          <div key={cat} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className={`w-2.5 h-2.5 rounded-full ${cat === "SP" ? "bg-purple-500" : cat === "LG" ? "bg-orange-500" : "bg-blue-500"}`} />
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">
                {CATEGORY_LABELS[cat] || cat}
              </h2>
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] text-zinc-600">{catCards.length} ตัว</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {catCards.map((card, index) => {
                const color = CARD_COLORS[card.id] || "#6366f1";
                return (
                  <motion.button
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => { setSelectedCard(card.id); setShowForm(true); }}
                    className="group relative bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 text-left hover:border-indigo-500/40 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-indigo-500/5"
                  >
                    {/* Glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)` }} />

                    {/* Color accent */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-300 group-hover:h-1 opacity-40 group-hover:opacity-100" style={{ backgroundColor: color }} />

                    {/* Image */}
                    <div className="w-full aspect-square rounded-xl mb-3 overflow-hidden bg-zinc-800 relative">
                      <img
                        src={card.image_url || `/card/${card.id}.png`}
                        alt={card.label}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-all duration-300 flex items-center justify-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <div className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">
                            จองคิว
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    <p className="font-bold text-sm truncate">{card.label}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-indigo-400 font-black">฿{card.price}</span>
                      <ChevronRight size={14} className="text-zinc-700 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* How it works */}
      <div className="mt-12 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-6">
          <h3 className="font-black text-lg mb-6 text-center flex items-center justify-center gap-2">
            <Zap size={18} className="text-yellow-400" />
            ทำงานยังไง?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "👆", title: "เลือกการ์ด", desc: "กดเลือกตัวที่อยากได้", color: "from-blue-500/10 to-blue-500/5" },
              { icon: "📝", title: "กรอกข้อมูล", desc: "ชื่อ + Facebook + จำนวน", color: "from-purple-500/10 to-purple-500/5" },
              { icon: "💳", title: "ชำระเงิน", desc: "สแกน QR + ส่งสลิป", color: "from-green-500/10 to-green-500/5" },
              { icon: "✅", title: "รับการ์ด", desc: "เราทักไปเมื่อพร้อมส่ง", color: "from-indigo-500/10 to-indigo-500/5" },
            ].map((s, i) => (
              <div key={i} className={`relative p-5 rounded-2xl bg-gradient-to-b ${s.color} text-center group hover:scale-105 transition-transform`}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center text-[10px] font-black text-zinc-500">
                  {i + 1}
                </div>
                <p className="font-bold text-sm">{s.title}</p>
                <p className="text-zinc-500 text-xs mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="border-t border-zinc-800 px-6 py-4 flex flex-wrap items-center justify-center gap-6 text-zinc-600 text-xs">
          <div className="flex items-center gap-1.5">
            <Shield size={14} /> ข้อมูลปลอดภัย
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={14} /> จองได้ทันที
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} /> ส่งภายในสัปดาห์
          </div>
        </div>
      </div>
    </div>
  );
}
