"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        // Redirect back to queue page if came from there, else home
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get("redirect") || "/";
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(data.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 relative overflow-hidden font-body">
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-medium text-xs"
      >
        <ArrowLeft size={14} />
        กลับหน้าหลัก
      </Link>
 
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white">เข้าสู่ระบบ</h1>
          <p className="text-zinc-500 mt-2 text-sm">ยินดีต้อนรับกลับมา</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 relative">
            
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-2 text-red-400 text-xs font-medium"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
 
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-1">ชื่อผู้ใช้</label>
                <div className="relative group/input">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" size={16} />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                    placeholder="ระบุชื่อผู้ใช้ของคุณ"
                  />
                </div>
              </div>
 
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-1">รหัสผ่าน</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" size={16} />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
 
            <button
              disabled={loading}
              className="w-full mt-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-zinc-500 text-sm">
          ยังไม่มีบัญชี?{" "}
          <Link href="/signup" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
            สมัครสมาชิก
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
