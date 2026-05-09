"use client";

import { useState } from "react";
import { ArrowLeft, User, Link2, Gamepad2, Lock, Save, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Props {
  user: any;
}

export default function ProfileClient({ user }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    facebook_url: user?.facebook_url || "",
    ingame_name: user?.ingame_name || "",
    new_password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSuccess(true);
        setFormData(prev => ({ ...prev, new_password: "" }));
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 font-body">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-10 font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft size={16} /> กลับหน้าแรก
        </Link>
 
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
          {/* Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
 
          <div className="flex items-center gap-6 mb-10 relative z-10">
            <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:border-indigo-500/30 transition-all duration-500">
              <User size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">EDIT <span className="text-indigo-500 italic">PROFILE</span></h1>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">จัดการข้อมูลส่วนตัวของคุณ</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">ชื่อ-นามสกุล</label>
                <div className="relative group/input">
                  <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" />
                  <input 
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-800"
                    placeholder="วชิรวิทย์ ดวงดี"
                  />
                </div>
              </div>
 
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">FACEBOOK URL</label>
                <div className="relative group/input">
                  <Link2 size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" />
                  <input 
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-800"
                    placeholder="https://facebook.com/your-profile"
                  />
                </div>
              </div>
 
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">ชื่อในเกม (สำหรับส่งของ)</label>
                <div className="relative group/input">
                  <Gamepad2 size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" />
                  <input 
                    type="text"
                    value={formData.ingame_name}
                    onChange={(e) => setFormData({ ...formData, ingame_name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-800"
                    placeholder="ชื่อในเกมของคุณ"
                  />
                </div>
              </div>
 
              <div className="pt-8 border-t border-zinc-800/50 mt-8 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={14} className="text-indigo-500" />
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">SECURITY SETTINGS</label>
                </div>
                <div className="relative group/input">
                  <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" />
                  <input 
                    type="password"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-800"
                    placeholder="รหัสผ่านใหม่ (เว้นว่างไว้เพื่อไม่เปลี่ยน)"
                  />
                </div>
              </div>
            </div>
 
            {success && (
              <div className="bg-green-500/5 border border-green-500/10 text-green-400 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 relative z-10 animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 size={18} /> บันทึกข้อมูลเรียบร้อยแล้ว!
              </div>
            )}
 
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 relative z-10 uppercase tracking-widest active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
