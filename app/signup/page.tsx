"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, ArrowLeft, Sparkles, AlertCircle, Link as LinkIcon, Gamepad2, UserCircle, Loader2, Shield } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    facebook_url: "",
    ingame_name: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 py-16 relative overflow-hidden font-body">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
 
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors z-10 font-black text-[10px] uppercase tracking-widest"
      >
        <ArrowLeft size={16} />
        กลับหน้าหลัก
      </Link>
 
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">
            <Sparkles size={12} className="text-amber-400" />
            สมัครสมาชิก
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">JOIN <span className="text-indigo-500 italic">THE CLUB</span></h1>
          <p className="text-zinc-500 mt-4 text-[11px] font-black uppercase tracking-widest">สร้างบัญชีเพื่อรับสิทธิพิเศษและจองคิวได้รวดเร็วขึ้น</p>
        </div>
 
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
 
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-3 text-red-400 text-[10px] font-black uppercase tracking-widest"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
 
            <div className="space-y-8 relative z-10">
              {/* Login Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Shield size={14} className="text-indigo-500" />
                  <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">ข้อมูลเข้าสู่ระบบ</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">ชื่อผู้ใช้ (Username) *</label>
                    <div className="relative group/input">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-800"
                        placeholder="USER"
                      />
                    </div>
                  </div>
 
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">รหัสผ่าน (Password) *</label>
                    <div className="relative group/input">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" size={18} />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-800"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>
 
              {/* Profile Info */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 px-1">
                  <UserCircle className="text-indigo-500" size={14} />
                  <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">ข้อมูลโปรไฟล์ส่วนตัว</h3>
                </div>
 
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">ชื่อ-นามสกุล *</label>
                  <div className="relative group/input">
                    <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" size={18} />
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full pl-14 pr-6 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-800"
                      placeholder="ชื่อที่ใช้จองคิว"
                    />
                  </div>
                </div>
 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Facebook URL</label>
                    <div className="relative group/input">
                      <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" size={18} />
                      <input
                        type="text"
                        value={formData.facebook_url}
                        onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-800"
                        placeholder="FB LINK"
                      />
                    </div>
                  </div>
 
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">ชื่อในเกม</label>
                    <div className="relative group/input">
                      <Gamepad2 className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" size={18} />
                      <input
                        type="text"
                        value={formData.ingame_name}
                        onChange={(e) => setFormData({ ...formData, ingame_name: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-800"
                        placeholder="IGN"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
 
            <button
              disabled={loading}
              className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black transition-all shadow-2xl shadow-indigo-600/30 disabled:bg-zinc-800 disabled:text-zinc-700 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "สร้างบัญชีผู้ใช้"
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-zinc-500 text-sm">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            เข้าสู่ระบบ
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
