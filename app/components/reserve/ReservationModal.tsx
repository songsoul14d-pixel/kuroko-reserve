import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Shield, Loader2 } from "lucide-react";
import { formatThaiDate } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  selectedCard: string | null;
  selectedCardData: any;
  formData: any;
  setFormData: (data: any) => void;
  availableWeeks: string[];
  submitting: boolean;
  confirmLimit: boolean;
  setConfirmLimit: (confirm: boolean) => void;
  resetForm: () => void;
  onSubmit: () => void;
}

export default function ReservationModal({
  isOpen,
  selectedCard,
  selectedCardData,
  formData,
  setFormData,
  availableWeeks,
  submitting,
  confirmLimit,
  setConfirmLimit,
  resetForm,
  onSubmit
}: Props) {
  if (!isOpen || !selectedCard) return null;

  return (
    <AnimatePresence>
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
          {/* Drag indicator for mobile */}
          <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-800 rounded-full" />
          
          {/* Top accent glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-indigo-500 rounded-full blur-sm" />

          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">จอง <span className="text-indigo-500 italic">ทันที</span></h2>
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">{selectedCardData?.label}</p>
            </div>
            <button onClick={resetForm} className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all text-zinc-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-6 mb-8 p-5 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-inner">
            <div className="w-20 h-24 rounded-2xl overflow-hidden border border-zinc-700 shadow-xl shrink-0">
              <img src={`/card/${selectedCard}.png`} alt={selectedCardData?.label} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">การ์ดพรีเมียม</span>
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
                  className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700"
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
                  className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700"
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
                className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700"
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
                        ? "bg-indigo-600 text-white border-indigo-600 active:scale-95 shadow-lg shadow-indigo-600/20"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 active:scale-95"
                    }`}
                  >
                    {n} <span className="text-[10px] opacity-70">ใบ</span>
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
                        const newWeeks = isSelected 
                          ? formData.selectedWeeks.filter((w: string) => w !== week)
                          : [...formData.selectedWeeks, week];
                        setFormData({ ...formData, selectedWeeks: newWeeks });
                      }}
                      className={`p-4 rounded-2xl font-black transition-all border text-left relative overflow-hidden ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 active:scale-95 shadow-lg shadow-indigo-600/20"
                          : "bg-zinc-900 border-zinc-800 active:scale-95"
                      }`}
                    >
                      <div className={`text-[10px] uppercase tracking-tighter mb-1 ${isSelected ? "text-white" : isCurrentWeek ? "text-indigo-400" : "text-zinc-500"}`}>
                        {isCurrentWeek ? "🚀 รอบปัจจุบัน" : `📅 รอบที่ ${idx + 1}`}
                      </div>
                      <div className={`text-[11px] uppercase tracking-widest ${isSelected ? "text-white" : "text-zinc-300"}`}>
                        {formatThaiDate(week)}
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
                  ข้อตกลงสำคัญ
                </p>
                <label className="flex items-start gap-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={confirmLimit}
                    onChange={(e) => setConfirmLimit(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer mt-1"
                  />
                  <span className="text-[11px] text-zinc-400 font-bold leading-relaxed group-hover/limit:text-zinc-300 transition-colors">
                    ยอมรับเงื่อนไขการขอของ <span className="text-white">3 ใบ/สัปดาห์</span> และขอรูปหลักฐานเพื่อตรวจสอบคิวในภายหลัง
                  </span>
                </label>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    if (!confirmLimit) return alert("กรุณากดยืนยันการยอมรับเงื่อนไข");
                    onSubmit();
                  }}
                  disabled={submitting || formData.selectedWeeks.length === 0 || !confirmLimit || !formData.name.trim()}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 disabled:text-zinc-700 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-widest"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  {submitting ? "กำลังดำเนินการ..." : "ยืนยันการจอง"}
                </button>
                
                <div className="flex items-center justify-between px-4">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">ราคารวมทั้งหมด</span>
                  <span className="text-lg font-black text-white">฿{(formData.quantity * (selectedCardData?.price || 0) * (formData.selectedWeeks.length || 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
