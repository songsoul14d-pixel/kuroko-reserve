"use client";

import { useEffect, useState } from "react";
import { Clock, Users, Package, ChevronRight, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ScheduleItem {
  id: string;
  card_id: string;
  queue_number: number;
  ingame_name: string;
  delivery_slot: string;
  status: string;
}

export default function DeliveryDashboard() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const rounds = ["10:30", "12:30", "15:30", "18:30", "21:30"];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await fetch("/api/delivery-schedule");
      const data = await res.json();
      if (Array.isArray(data)) setSchedule(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const maskName = (name: string) => {
    if (!name) return "---";
    if (name.length <= 3) return name[0] + "***";
    return name.slice(0, 3) + "***" + name.slice(-1);
  };

  const getRoundItems = (roundStr: string) => {
    return schedule.filter(item => {
      const date = new Date(item.delivery_slot);
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      return timeStr === roundStr;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between flex-wrap gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            📅 ตารางการโอนของวันนี้
          </h2>
          <p className="text-zinc-500 text-sm mt-1">อัปเดตแบบ Real-time ตามคิวที่ส่งสลิป</p>
        </div>
        <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Next Round</p>
          <p className="text-lg font-black text-white">
            {rounds.find(r => {
                const [h, m] = r.split(':').map(Number);
                const now = new Date();
                const rt = new Date();
                rt.setHours(h, m, 0, 0);
                return rt > now;
            }) || rounds[0]}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {rounds.map((round) => {
          const items = getRoundItems(round);
          return (
            <div key={round} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-5 flex items-center justify-between bg-zinc-900/80">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{round} น.</h3>
                    <p className="text-xs text-zinc-500 font-bold flex items-center gap-1 uppercase tracking-widest">
                      <Users size={12} /> {items.length} รายการ
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${items.length > 0 ? "bg-green-500/10 text-green-400" : "bg-zinc-800 text-zinc-500"}`}>
                  {items.length > 0 ? "📦 กำลังเตรียมส่ง" : "ว่าง"}
                </div>
              </div>

              {items.length > 0 && (
                <div className="p-4 bg-zinc-950/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map((item) => (
                      <div key={item.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-[10px] font-black text-indigo-400 border border-zinc-700">
                            #{item.queue_number}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-white flex items-center gap-1">
                              <Gamepad2 size={10} className="text-indigo-400" />
                              {maskName(item.ingame_name)}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">{item.card_id}</span>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${item.status === 'confirmed' ? "bg-purple-500 animate-pulse" : "bg-blue-500"}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        );
      })}
    </div>
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link 
          href="/queue"
          className="flex-1 flex items-center justify-center gap-3 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-600/20"
        >
          🔍 เช็คคิว / แจ้งโอนเงิน
          <ChevronRight size={18} />
        </Link>
        <button 
          onClick={() => {
            const el = document.getElementById("reservation-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex-1 flex items-center justify-center gap-3 p-4 bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-zinc-300 rounded-2xl font-black transition-all"
        >
          📦 จองคิวเพิ่ม
          <ChevronRight size={18} />
        </button>
      </div>

      <p className="mt-6 text-center text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
        ⚠️ กรุณาแจ้งโอนและกดขอในเกมให้เรียบร้อยก่อนรอบส่ง 30 นาที
      </p>
    </div>
  );
}
