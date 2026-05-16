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
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 font-body">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-medium text-xs">
          <ArrowLeft size={14} /> กลับหน้าแรก
        </Link>
 
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-center text-indigo-400">
              <User size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">จัดการโปรไฟล์</h1>
              <p className="text-zinc-500 text-[10px] mt-1">แก้ไขข้อมูลส่วนตัวของคุณ</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-1">ชื่อ-นามสกุล</label>
                <div className="relative group/input">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" />
                  <input 
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                    placeholder="วชิรวิทย์ ดวงดี"
                  />
                </div>
              </div>
 
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-1">Facebook URL</label>
                <div className="relative group/input">
                  <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" />
                  <input 
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                    placeholder="https://facebook.com/your-profile"
                  />
                </div>
              </div>
 
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-1">ชื่อในเกม (สำหรับส่งของ)</label>
                <div className="relative group/input">
                  <Gamepad2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" />
                  <input 
                    type="text"
                    value={formData.ingame_name}
                    onChange={(e) => setFormData({ ...formData, ingame_name: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                    placeholder="ชื่อในเกมของคุณ"
                  />
                </div>
              </div>
 
              <div className="pt-5 border-t border-white/[0.06] mt-5 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={12} className="text-indigo-400" />
                  <label className="text-[10px] font-medium text-indigo-400 uppercase tracking-wider">เปลี่ยนรหัสผ่าน</label>
                </div>
                <div className="relative group/input">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-400 transition-colors" />
                  <input 
                    type="password"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                    placeholder="รหัสผ่านใหม่ (เว้นว่างไว้เพื่อไม่เปลี่ยน)"
                  />
                </div>
              </div>
            </div>
 
            {success && (
              <div className="bg-green-500/5 border border-green-500/10 text-green-400 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
                <CheckCircle2 size={14} /> บันทึกข้อมูลเรียบร้อยแล้ว
              </div>
            )}
 
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
