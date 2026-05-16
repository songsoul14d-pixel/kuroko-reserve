import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Loader2 } from "lucide-react";
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
        className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4"
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-[#0a0a0a] border-t md:border border-white/[0.06] rounded-t-2xl md:rounded-2xl p-6 md:p-8 max-w-lg w-full relative max-h-[95vh] overflow-y-auto"
        >
          {/* Drag indicator for mobile */}
          <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-800 rounded-full" />

          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">จองการ์ด</h2>
              <p className="text-zinc-500 text-sm">{selectedCardData?.label}</p>
            </div>
            <button onClick={resetForm} className="w-8 h-8 flex items-center justify-center bg-white/[0.04] border border-white/[0.06] rounded-lg hover:bg-white/[0.08] transition-colors text-zinc-400">
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <div className="w-16 h-20 rounded-xl overflow-hidden border border-white/[0.06] shrink-0">
              <img src={`/card/${selectedCard}.png`} alt={selectedCardData?.label} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">฿{selectedCardData?.price}</span>
                <span className="text-xs text-zinc-500">/ใบ</span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="reserve_name" className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-1">ชื่อที่ใช้จอง *</label>
                <input
                  id="reserve_name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                  placeholder="ชื่อ-นามสกุล / Facebook"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="reserve_ign" className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-1">ชื่อในเกม</label>
                <input
                  id="reserve_ign"
                  type="text"
                  value={formData.ingameName}
                  onChange={(e) => setFormData({ ...formData, ingameName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                  placeholder="IGN"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reserve_fb" className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-1">ลิงก์ Facebook</label>
              <input
                id="reserve_fb"
                type="text"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                placeholder="https://facebook.com/yourname"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-1">จำนวนที่ต้องการ</label>
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData({ ...formData, quantity: n })}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors border ${
                      formData.quantity === n
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white/[0.03] border-white/[0.06] text-zinc-500 hover:border-white/[0.12]"
                    }`}
                  >
                    {n} ใบ
                    <div className={`text-[10px] mt-0.5 ${formData.quantity === n ? 'text-indigo-200' : 'text-zinc-600'}`}>
                      ฿{(n * (selectedCardData?.price || 0)).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-1">เลือกรอบการโอน</label>
              <div className="grid grid-cols-2 gap-2">
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
                      className={`p-3 rounded-xl font-bold transition-colors border text-left ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]"
                      }`}
                    >
                      <div className={`text-[10px] mb-0.5 ${isSelected ? "text-white" : isCurrentWeek ? "text-indigo-400" : "text-zinc-500"}`}>
                        {isCurrentWeek ? "รอบปัจจุบัน" : `รอบที่ ${idx + 1}`}
                      </div>
                      <div className={`text-[11px] ${isSelected ? "text-white" : "text-zinc-300"}`}>
                        {formatThaiDate(week)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Shield size={11} className="text-indigo-400" />
                  ข้อตกลงสำคัญ
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={confirmLimit}
                    onChange={(e) => setConfirmLimit(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-white/[0.03] text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer mt-0.5"
                  />
                  <span className="text-xs text-zinc-400 font-medium leading-relaxed">
                    ยอมรับเงื่อนไขการขอของ <span className="text-white">3 ใบ/สัปดาห์</span> และขอรูปหลักฐานเพื่อตรวจสอบคิวในภายหลัง
                  </span>
                </label>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (!confirmLimit) return alert("กรุณากดยืนยันการยอมรับเงื่อนไข");
                    onSubmit();
                  }}
                  disabled={submitting || formData.selectedWeeks.length === 0 || !confirmLimit || !formData.name.trim()}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : null}
                  {submitting ? "กำลังดำเนินการ..." : "ยืนยันการจอง"}
                </button>
                
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">ราคารวม</span>
                  <span className="text-base font-bold text-white">฿{(formData.quantity * (selectedCardData?.price || 0) * (formData.selectedWeeks.length || 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
