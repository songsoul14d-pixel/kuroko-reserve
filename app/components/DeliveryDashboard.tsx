"use client";

import { useEffect, useState } from "react";
import { Clock, Users, ChevronRight } from "lucide-react";
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
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-white">
            ตารางการโอนของวันนี้
          </h2>
          <p className="text-zinc-600 text-xs mt-1">อัปเดตตามคิวที่ส่งสลิป</p>
        </div>
        <div className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">Next Round</p>
          <p className="text-base font-bold text-white">
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

      <div className="space-y-3">
        {rounds.map((round) => {
          const items = getRoundItems(round);
          return (
            <div key={round} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-center text-zinc-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{round} น.</h3>
                    <p className="text-[10px] text-zinc-600 font-medium flex items-center gap-1">
                      <Users size={10} /> {items.length} รายการ
                    </p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-medium ${items.length > 0 ? "bg-green-500/10 text-green-400" : "bg-white/[0.03] text-zinc-600"}`}>
                  {items.length > 0 ? "กำลังเตรียมส่ง" : "ว่าง"}
                </div>
              </div>

              {items.length > 0 && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map((item) => (
                      <div key={item.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 bg-white/[0.04] rounded-lg flex items-center justify-center text-[10px] font-bold text-zinc-500 border border-white/[0.06]">
                            #{item.queue_number}
                          </span>
                          <span className="text-xs font-medium text-zinc-300">
                            {maskName(item.ingame_name)}
                          </span>
                          <span className="text-[10px] text-zinc-600">{item.card_id}</span>
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'confirmed' ? "bg-green-400" : "bg-zinc-500"}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link 
          href="/queue"
          className="flex-1 flex items-center justify-center gap-2 p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors"
        >
          เช็คคิว / แจ้งโอนเงิน
          <ChevronRight size={16} />
        </Link>
        <button 
          onClick={() => {
            const el = document.getElementById("reservation-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex-1 flex items-center justify-center gap-2 p-3.5 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] text-zinc-300 rounded-xl font-bold text-sm transition-colors"
        >
          จองคิวเพิ่ม
          <ChevronRight size={16} />
        </button>
      </div>

      <p className="mt-5 text-center text-zinc-600 text-[10px]">
        กรุณาแจ้งโอนและกดขอในเกมให้เรียบร้อยก่อนรอบส่ง 30 นาที
      </p>
    </div>
  );
}
