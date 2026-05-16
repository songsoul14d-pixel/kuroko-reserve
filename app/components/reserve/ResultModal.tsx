"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Upload, Loader2, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  result: {
    success: boolean;
    queueNumber?: number;
    total?: number;
    weeks?: number;
    message?: string;
    reservations?: any[];
  } | null;
  resetForm: () => void;
  selectedCardLabel?: string;
  quantity: number;
  settings?: any;
}

export default function ResultModal({ result, resetForm, selectedCardLabel, quantity, settings }: Props) {
  const [showQR, setShowQR] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadedSlips, setUploadedSlips] = useState<Record<string, string>>({});
  const [requestedIds, setRequestedIds] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<"success" | "payment" | "done">("success");

  // Get the reservation IDs from result
  const reservationIds = result?.reservations?.map((r: any) => r.id) || [];

  // Auto advance to payment step after showing success
  useEffect(() => {
    if (result?.success && step === "success") {
      const timer = setTimeout(() => setStep("payment"), 1200);
      return () => clearTimeout(timer);
    }
  }, [result?.success, step]);

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

      if (type === 'slip') {
        setUploadedSlips(prev => ({ ...prev, [reservationId]: publicUrl }));
      }

      // After uploading slip, advance to done
      if (type === 'slip') {
        setTimeout(() => setStep("done"), 500);
      }
    } catch (err: any) {
      alert("อัปโหลดล้มเหลว: " + (err.message || "ลองใหม่อีกครั้ง"));
    } finally {
      setUploadingId(null);
    }
  };

  if (!result) return null;

  const qrUrl = settings?.promptpay_qr_url || "/promptpay-qr.jpg";
  const receiverName = settings?.payment_receiver_name;
  const allSlipsUploaded = reservationIds.length > 0 && reservationIds.every((id: string) => uploadedSlips[id]);

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
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-[#0a0a0a] border-t md:border border-white/[0.06] rounded-t-2xl md:rounded-2xl p-6 md:p-8 max-w-md w-full text-center relative max-h-[95vh] overflow-y-auto"
        >
          {/* Drag indicator for mobile */}
          <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-800 rounded-full" />

          {result.success ? (
            <div>
              {/* Step 1: Success confirmation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, delay: 0.1 }}
                className={`w-16 h-16 mx-auto mb-4 bg-green-500/10 border border-green-500/15 rounded-full flex items-center justify-center ${step !== "success" ? "hidden" : ""}`}
              >
                <CheckCircle2 size={32} className="text-green-400" />
              </motion.div>

              {step === "success" ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-white">จองสำเร็จ</h2>
                  <div className="mt-3">
                    <p className="text-zinc-500 text-sm">คิว {selectedCardLabel}</p>
                    <p className="text-4xl font-bold text-indigo-400 mt-1">#{result.queueNumber}</p>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/15 rounded-xl">
                    <span className="text-zinc-400 text-sm">ยอดชำระ</span>
                    <span className="text-green-400 text-lg font-bold">฿{result.total?.toLocaleString()}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="text-left">
                  {/* Success summary - compact */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-white">จองสำเร็จ</h2>
                      <p className="text-zinc-500 text-sm">#{result.queueNumber} — ฿{result.total?.toLocaleString()}</p>
                    </div>
                    <div className="px-2.5 py-1 bg-green-500/10 rounded-lg">
                      <CheckCircle2 size={16} className="text-green-400" />
                    </div>
                  </div>

                  {/* Step 2: Payment */}
                  {step === "payment" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5"
                    >
                      {/* Step indicator */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-[10px] font-bold">1</div>
                        <div className="flex-1 h-px bg-green-500/20" />
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">2</div>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <div className="w-6 h-6 rounded-full bg-white/[0.04] flex items-center justify-center text-zinc-600 text-[10px] font-bold">3</div>
                      </div>

                      <div className="text-center">
                        <h3 className="text-base font-bold text-white">ชำระเงิน</h3>
                        <p className="text-zinc-500 text-xs mt-1">สแกน QR Code เพื่อชำระยอด {result.total?.toLocaleString()} บาท</p>
                      </div>

                      {/* QR Code */}
                      <div className="flex justify-center">
                        <div className="p-3 bg-white rounded-xl">
                          <img src={qrUrl} alt="พร้อมเพย์" className="w-40 h-40 object-contain" />
                        </div>
                      </div>
                      {receiverName && (
                        <p className="text-center text-xs text-zinc-500">
                          ชื่อผู้รับ: <span className="text-white font-medium">{receiverName}</span>
                        </p>
                      )}

                      {/* Proof checkbox */}
                      {reservationIds.length > 0 && (
                        <div className="space-y-3">
                          <label className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl cursor-pointer hover:bg-white/[0.04] transition-colors">
                            <input
                              type="checkbox"
                              checked={requestedIds[reservationIds[0]] || false}
                              onChange={(e) => setRequestedIds(prev => ({ ...prev, [reservationIds[0]]: e.target.checked }))}
                              className="w-4 h-4 rounded border-zinc-700 bg-white/[0.03] text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer mt-0.5"
                            />
                            <span className="text-xs text-zinc-400 font-medium leading-relaxed">
                              ยืนยันว่าได้กด <span className="text-indigo-400">&quot;ขอไอเทม&quot;</span> ในชมรม Heal_Hee แล้ว
                            </span>
                          </label>

                          {/* Slip upload */}
                          {reservationIds.map((resId: string) => (
                            <div key={resId} className={`relative group/btn ${!requestedIds[resId] ? "opacity-30 pointer-events-none" : ""}`}>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, resId, 'slip')}
                                disabled={!!uploadingId || !requestedIds[resId]}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                              />
                              <div className={`flex items-center justify-center gap-2 p-3.5 border rounded-xl transition-colors ${
                                uploadedSlips[resId]
                                  ? "bg-green-500/5 border-green-500/10"
                                  : "bg-indigo-600/10 border-indigo-600/20"
                              }`}>
                                {uploadingId === resId ? (
                                  <Loader2 size={16} className="text-indigo-400 animate-spin" />
                                ) : uploadedSlips[resId] ? (
                                  <CheckCircle2 size={16} className="text-green-400" />
                                ) : (
                                  <Upload size={16} className="text-indigo-400" />
                                )}
                                <span className={`text-sm font-medium ${uploadedSlips[resId] ? "text-green-400" : "text-white"}`}>
                                  {uploadedSlips[resId] ? "อัปโหลดสลิปแล้ว" : "อัปโหลดสลิปโอนเงิน"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Done */}
                  {step === "done" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-4 py-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-16 h-16 mx-auto bg-green-500/10 border border-green-500/15 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 size={32} className="text-green-400" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-bold text-white">ชำระเงินเรียบร้อย</h3>
                        <p className="text-zinc-500 text-sm mt-1">รอแอดมินยืนยันยอดและจัดส่งตามรอบครับ</p>
                      </div>

                      <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-left">
                        <p className="text-xs text-zinc-400 font-medium mb-2">สถานะถัดไป</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 flex items-center gap-2 text-xs text-zinc-500">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            ชำระเงินแล้ว
                          </div>
                          <div className="w-4 h-px bg-white/[0.06]" />
                          <div className="flex-1 flex items-center gap-2 text-xs text-zinc-600">
                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                            แอดมินยืนยัน
                          </div>
                          <div className="w-4 h-px bg-white/[0.06]" />
                          <div className="flex-1 flex items-center gap-2 text-xs text-zinc-600">
                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                            จัดส่ง
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 space-y-2">
                {step === "success" && (
                  <button
                    onClick={() => setStep("payment")}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors"
                  >
                    ชำระเงิน
                  </button>
                )}

                {step === "done" && (
                  <Link
                    href="/queue"
                    className="flex items-center justify-center w-full py-3.5 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-xl font-medium text-sm transition-colors"
                  >
                    ดูคิวของฉัน
                  </Link>
                )}

                <button
                  onClick={resetForm}
                  className="w-full py-3 bg-transparent hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300 rounded-xl font-medium transition-colors text-sm"
                >
                  {step === "done" ? "ปิด" : "ทำทีหลัง"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/15 rounded-full flex items-center justify-center"
              >
                <AlertCircle size={32} className="text-red-400" />
              </motion.div>
              <h2 className="text-lg font-bold text-red-400">จองไม่สำเร็จ</h2>
              <p className="text-zinc-500 mt-2 text-sm">{result.message}</p>
              <button
                onClick={resetForm}
                className="mt-6 w-full py-3.5 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-xl font-medium transition-colors text-sm"
              >
                ลองใหม่
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
