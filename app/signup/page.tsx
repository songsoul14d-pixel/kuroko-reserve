"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, ArrowLeft, Sparkles, AlertCircle, Link as LinkIcon, Gamepad2, UserCircle } from "lucide-react";
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
        router.push("/");
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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors z-10"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-bold">กลับหน้าหลัก</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">
            <Sparkles size={12} />
            Join the Club
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">สมัครสมาชิก</h1>
          <p className="text-zinc-500 mt-2">สร้างบัญชีเพื่อบันทึกข้อมูลและจองคิวได้รวดเร็วขึ้น</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-black/50">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Login Info */}
              <div className="md:col-span-2">
                <h3 className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-4">ข้อมูลเข้าสู่ระบบ</h3>
              </div>
              
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-2 block uppercase tracking-wider">User *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-700"
                    placeholder="ชื่อผู้ใช้"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 mb-2 block uppercase tracking-wider">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-700"
                    placeholder="รหัสผ่าน"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="md:col-span-2 pt-4">
                <h3 className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-4">ข้อมูลโปรไฟล์ (ใช้ตอนจองอัตโนมัติ)</h3>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 mb-2 block uppercase tracking-wider">ชื่อ-นามสกุล *</label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-700"
                    placeholder="ชื่อที่ใช้จองคิว"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 mb-2 block uppercase tracking-wider">Facebook URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input
                    type="text"
                    value={formData.facebook_url}

                    onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-700"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 mb-2 block uppercase tracking-wider">ชื่อในเกม</label>
                <div className="relative">
                  <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input
                    type="text"
                    value={formData.ingame_name}
                    onChange={(e) => setFormData({ ...formData, ingame_name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-700"
                    placeholder="ชื่อตัวละครในเกม"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "สร้างบัญชี"
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
