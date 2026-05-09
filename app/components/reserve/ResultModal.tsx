import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";

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
}

export default function ResultModal({ result, resetForm, selectedCardLabel, quantity }: Props) {
  if (!result) return null;

  return (
    <AnimatePresence>
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
          {result.success && (
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          )}

          {result.success ? (
            <div className="relative text-center">
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
                <p className="text-zinc-400">คิว {selectedCardLabel} ของคุณ</p>
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
                    📅 จอง {result.weeks} สัปดาห์ ({quantity} ใบ × {result.weeks} สัปดาห์)
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
            onClick={resetForm}
            className="mt-6 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all w-full active:scale-95 shadow-xl shadow-indigo-600/20 uppercase tracking-widest"
          >
            เสร็จสิ้น
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
