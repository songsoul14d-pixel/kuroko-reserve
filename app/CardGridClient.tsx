"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Card, CARD_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { ChevronRight, Sparkles, Shield, Zap, Clock, CheckCircle2, AlertCircle, X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  cards: Card[];
  user?: any;
  settings?: any;
}

export default function CardGridClient({ cards, user, settings }: Props) {

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmLimit, setConfirmLimit] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.full_name || "",
    facebookUrl: user?.facebook_url || "",
    ingameName: user?.ingame_name || "",
    quantity: 1,
    selectedWeeks: [] as string[],
    notes: "",
  });

  // Calculate available weeks (current + next 3)
  const getAvailableWeeks = () => {
    const weeks = [];
    let current = new Date();
    // Get current Monday
    const day = current.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    current.setDate(current.getDate() + diff);
    
    for (let i = 0; i < 4; i++) {
      weeks.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  };

  const availableWeeks = getAvailableWeeks();

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; queueNumber?: number; total?: number; weeks?: number; message?: string; reservations?: any[] } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedSlip, setUploadedSlip] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-fill profile data when user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.full_name || prev.name,
        facebookUrl: user.facebook_url || prev.facebookUrl,
        ingameName: user.ingame_name || prev.ingameName
      }));
    }
  }, [user]);

  useEffect(() => {
    if (showForm && formData.selectedWeeks.length === 0) {
      // Default to current week
      setFormData(prev => ({ ...prev, selectedWeeks: [availableWeeks[0]] }));
    }
  }, [showForm, availableWeeks, formData.selectedWeeks.length]);


  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !result?.reservations) return;

    setUploading(true);
    try {
      // Path: slips/9a2b53e2-e177-40ec-9961-48cb43732bcd/qr/{reservation_id}_{timestamp}.png
      // Since there might be multiple reservations (for multiple weeks), we'll update the first one or all of them.
      // The user likely wants one slip for the whole order.
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${result.reservations[0].id}_${Date.now()}.${fileExt}`;
      const filePath = `qr/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('slips')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('slips')
        .getPublicUrl(filePath);

      // Update all reservations in this order with the same slip
      for (const res of result.reservations) {
        await fetch("/api/reserve/slip", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reservation_id: res.id,
            slip_url: publicUrl,
          }),
        });
      }

      setUploadedSlip(publicUrl);
      setToast("อัปโหลดสลิปสำเร็จ!");
    } catch (err: any) {
      console.error(err);
      setToast("อัปโหลดล้มเหลว: " + (err.message || "ลองใหม่อีกครั้ง"));
    } finally {
      setUploading(false);
    }
  };

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
          ingame_name: formData.ingameName.trim() || null,
          profile_id: user?.id || null,
          quantity: formData.quantity,
          selected_weeks: formData.selectedWeeks,
          notes: formData.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setResult({ success: false, message: data.error });
      } else {
        setResult({ 
          success: true,
          queueNumber: data.queue_number,
          total: data.total, 
          weeks: formData.selectedWeeks.length,
          reservations: data.reservations
        });
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
            className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4"
          >
            <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-zinc-900 border-t md:border border-zinc-700 rounded-t-[2rem] md:rounded-3xl p-8 max-w-md w-full text-center relative max-h-[95vh] overflow-y-auto"
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
                    className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
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
                    className="mt-8 space-y-4"
                  >
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                      <p className="text-indigo-400 font-bold text-sm">จองคิวสำเร็จแล้ว!</p>
                      <p className="text-zinc-400 text-xs mt-1">กรุณาไปที่หน้า "เช็คคิว" เพื่อชำระเงินและส่งสลิปยืนยันรายการครับ</p>
                    </div>

                    <Link 
                      href="/queue"
                      className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-500/20"
                    >
                      🔍 ไปหน้าเช็คคิว
                    </Link>
                    
                    <p className="text-zinc-500 text-[10px]">
                      หากมีข้อสงสัย ทักแชทสอบถามทาง{" "}
                      <a href="https://www.facebook.com/wachirawit.dongdee/" target="_blank" className="text-blue-400 underline hover:text-blue-300 font-bold">
                        Facebook
                      </a>
                    </p>
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
                onClick={() => { 
                  setUploadedSlip(null);
                  setResult(null); 
                  setShowForm(false); 
                  setSelectedCard(null); 
                  setFormData({ 
                    name: user?.full_name || "", 
                    facebookUrl: user?.facebook_url || "", 
                    ingameName: user?.ingame_name || "", 
                    quantity: 1, 
                    selectedWeeks: [], 
                    notes: "" 
                  }); 
                }}

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
            className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-xl p-0 md:p-4"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-zinc-950 border-t md:border border-zinc-800 rounded-t-[3rem] md:rounded-[2.5rem] p-8 md:p-10 max-w-lg w-full relative max-h-[95vh] overflow-y-auto shadow-2xl"
            >
              {/* Top accent glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-indigo-500 rounded-full blur-sm" />
 
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">RESERVE <span className="text-indigo-500 italic">NOW</span></h2>
                  <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">{selectedCardData?.label}</p>
                </div>
                <button onClick={() => { 
                  setShowForm(false); 
                  setSelectedCard(null); 
                  setFormData({ 
                    name: user?.full_name || "", 
                    facebookUrl: user?.facebook_url || "", 
                    ingameName: user?.ingame_name || "", 
                    quantity: 1, 
                    selectedWeeks: [], 
                    notes: "" 
                  }); 
                }} className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all text-zinc-400">
                  <X size={20} />
                </button>
              </div>
 
              {/* Hero Item Display */}
              <div className="flex items-center gap-6 mb-8 p-5 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-inner">
                <div className="w-20 h-24 rounded-2xl overflow-hidden border border-zinc-700 shadow-xl shrink-0">
                  <img src={`/card/${selectedCard}.png`} alt={selectedCardData?.label} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Premium Card</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">฿{selectedCardData?.price}</span>
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">/ใบ</span>
                  </div>
                </div>
              </div>
 
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="reserve_name" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">ชื่อที่ใช้จอง *</label>
                    <input
                      id="reserve_name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700"
                      placeholder="ชื่อ-นามสกุล / Facebook"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reserve_ign" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">ชื่อในเกม</label>
                    <input
                      id="reserve_ign"
                      type="text"
                      value={formData.ingameName}
                      onChange={(e) => setFormData({ ...formData, ingameName: e.target.value })}
                      className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700"
                      placeholder="IGN"
                    />
                  </div>
                </div>
 
                <div className="space-y-2">
                  <label htmlFor="reserve_fb" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">ลิงก์ FACEBOOK</label>
                  <input
                    id="reserve_fb"
                    type="text"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700"
                    placeholder="https://facebook.com/yourname"
                  />
                </div>
 
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">จำนวนที่ต้องการ</label>
                  <div className="flex gap-3">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormData({ ...formData, quantity: n })}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all border ${
                          formData.quantity === n
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20 active:scale-95"
                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 active:scale-95"
                        }`}
                      >
                        {n} <span className="text-[10px] opacity-70">CARD{n > 1 ? 'S' : ''}</span>
                        <div className={`text-[8px] mt-1 tracking-widest ${formData.quantity === n ? 'text-indigo-200' : 'text-zinc-600'}`}>
                          ฿{(n * (selectedCardData?.price || 0)).toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
 
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">เลือกรอบการโอน</label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableWeeks.map((week, idx) => {
                      const isSelected = formData.selectedWeeks.includes(week);
                      const isCurrentWeek = idx === 0;
                      return (
                        <button
                          key={week}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormData({ ...formData, selectedWeeks: formData.selectedWeeks.filter(w => w !== week) });
                            } else {
                              setFormData({ ...formData, selectedWeeks: [...formData.selectedWeeks, week] });
                            }
                          }}
                          className={`p-4 rounded-2xl font-black transition-all border text-left relative overflow-hidden ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-600/20 active:scale-95"
                              : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 active:scale-95"
                          }`}
                        >
                          {isSelected && <div className="absolute -top-1 -right-1 w-6 h-6 bg-white/20 rounded-full blur-md" />}
                          <div className={`text-[10px] uppercase tracking-tighter mb-1 ${isSelected ? "text-white" : isCurrentWeek ? "text-indigo-400" : "text-zinc-500"}`}>
                            {isCurrentWeek ? "🚀 รอบปัจจุบัน" : `📅 รอบที่ ${idx + 1}`}
                          </div>
                          <div className={`text-[11px] uppercase tracking-widest ${isSelected ? "text-white" : "text-zinc-300"}`}>
                            {new Date(week).toLocaleDateString("en-US", { day: 'numeric', month: 'short' })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
 
                <div className="pt-4 space-y-5">
                  <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-3xl relative group/limit">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-full opacity-50" />
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Shield size={12} className="text-indigo-400" />
                      Important Agreement
                    </p>
                    <label className="flex items-start gap-4 cursor-pointer">
                      <div className="relative flex items-center mt-1">
                        <input 
                          type="checkbox" 
                          checked={confirmLimit}
                          onChange={(e) => setConfirmLimit(e.target.checked)}
                          className="w-5 h-5 rounded-lg border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                        />
                      </div>
                      <span className="text-[11px] text-zinc-400 font-bold leading-relaxed group-hover/limit:text-zinc-300 transition-colors">
                        ยอมรับเงื่อนไขการขอของ <span className="text-white">3 ใบ/สัปดาห์</span> และขอรูปหลักฐานเพื่อตรวจสอบคิวในภายหลัง
                      </span>
                    </label>
                  </div>
 
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        if (!confirmLimit) {
                          alert("กรุณากดยืนยันการยอมรับเงื่อนไข");
                          return;
                        }
                        handleSubmit();
                      }}
                      disabled={submitting || formData.selectedWeeks.length === 0 || !confirmLimit || !formData.name.trim()}
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 disabled:text-zinc-700 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-widest"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                      {submitting ? "Processing..." : "Confirm Booking"}
                    </button>
                    
                    <div className="flex items-center justify-between px-4">
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Total Price</span>
                      <span className="text-lg font-black text-white">฿{(formData.quantity * (selectedCardData?.price || 0) * (formData.selectedWeeks.length || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Grid by Category */}
      {categoryOrder.map((cat) => {
        const catCards = (grouped as any)[cat];
        if (!catCards || catCards.length === 0) return null;

        return (
          <div key={cat} className="space-y-6 mb-12">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                  cat === "SP" ? "bg-emerald-500 shadow-emerald-500/50" : 
                  cat === "LG" ? "bg-orange-500 shadow-orange-500/50" : 
                  "bg-blue-500 shadow-blue-500/50"
                }`} />
                {CATEGORY_LABELS[cat] || cat}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {catCards.map((card: any, index: number) => {
                const color = CARD_COLORS[card.id] || "#6366f1";
                return (
                  <motion.button
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => { setSelectedCard(card.id); setShowForm(true); }}
                    className="group relative flex flex-col bg-zinc-900 border border-zinc-800 rounded-[2rem] p-3 text-left hover:border-indigo-500/50 transition-all duration-500 overflow-hidden"
                  >
                    {/* Background Glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
                         style={{ background: `radial-gradient(circle at 50% 100%, ${color}20, transparent 80%)` }} />
                    
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-zinc-950 mb-4">
                      <img
                        src={card.image_url || `/card/${card.id}.png`}
                        alt={card.label}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60" />
                      
                      {/* Price Tag Floating */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-white tracking-widest">
                          ฿{card.price}
                        </div>
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="px-2 pb-2">
                      <h3 className="font-black text-white text-base md:text-lg leading-tight group-hover:text-indigo-400 transition-colors">
                        {card.label}
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">
                        {CATEGORY_LABELS[cat]} SERIES
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* How it works */}
      <div className="py-20 px-8 bg-zinc-900/40 border border-zinc-800/50 rounded-[4rem] relative overflow-hidden group mb-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
        
        <div className="relative z-10 space-y-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">
              <Zap size={12} className="text-amber-400" />
              ULTRA FAST PROCESS
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">จองง่ายๆ ใน <span className="text-indigo-500 italic">4 ขั้นตอน</span></h2>
            <p className="text-zinc-500 text-sm md:text-base mt-4 font-black uppercase tracking-widest opacity-60">สัมผัสประสบการณ์การจองที่พรีเมียมที่สุด</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connecting lines for desktop */}
            <div className="absolute top-10 left-20 right-20 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent hidden lg:block" />

            {[
              { icon: <Sparkles size={28} />, title: "เลือกตัวละคร", desc: "เลือกนักเตะที่คุณต้องการจอง", color: "text-blue-400", glow: "shadow-blue-500/20" },
              { icon: <Shield size={28} />, title: "กรอกข้อมูล", desc: "ระบุชื่อและข้อมูลการติดต่อให้ครบถ้วน", color: "text-emerald-400", glow: "shadow-emerald-500/20" },
              { icon: <Zap size={28} />, title: "ชำระเงิน", desc: "สแกนจ่ายผ่าน QR Code สะดวกและรวดเร็ว", color: "text-amber-400", glow: "shadow-amber-500/20" },
              { icon: <CheckCircle2 size={28} />, title: "เสร็จสิ้น", desc: "รอรับบัตรตัวละครของคุณภายในเกม", color: "text-green-400", glow: "shadow-green-500/20" },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-6 group/step relative">
                <div className={`w-20 h-20 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center ${step.color} group-hover/step:border-indigo-500/50 transition-all duration-500 shadow-2xl ${step.glow} relative z-10 bg-zinc-950 group-hover/step:scale-110 group-hover/step:-translate-y-2`}>
                  {step.icon}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                    0{i+1}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-white text-base uppercase tracking-tight group-hover/step:text-indigo-400 transition-colors">{step.title}</h3>
                  <p className="text-zinc-500 text-xs font-bold leading-relaxed max-w-[160px] mx-auto uppercase tracking-wide opacity-80">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
