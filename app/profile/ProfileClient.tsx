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
    <div className="min-h-screen bg-zinc-950 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-8 font-bold text-sm">
          <ArrowLeft size={16} /> กลับหน้าแรก
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16" />

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">จัดการโปรไฟล์</h1>
              <p className="text-zinc-500 text-sm">แก้ไขข้อมูลส่วนตัวของคุณ</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 block">ชื่อ-นามสกุล</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input 
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="วชิรวิทย์ ดวงดี"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 block">Facebook URL</label>
                <div className="relative">
                  <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input 
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="https://facebook.com/your-profile"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 block">ชื่อในเกม (สำหรับส่งของ)</label>
                <div className="relative">
                  <Gamepad2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input 
                    type="text"
                    value={formData.ingame_name}
                    onChange={(e) => setFormData({ ...formData, ingame_name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="ชื่อในเกมของคุณ"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/50 mt-6">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 block text-indigo-400">เปลี่ยนรหัสผ่าน (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input 
                    type="password"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="รหัสผ่านใหม่"
                  />
                </div>
              </div>
            </div>

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl text-sm font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> บันทึกข้อมูลเรียบร้อยแล้ว!
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
