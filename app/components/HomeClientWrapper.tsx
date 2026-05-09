"use client";

import { ReactNode } from "react";
import DeliveryDashboard from "./DeliveryDashboard";

interface Props {
  children: ReactNode; // This will be the CardGridClient
}

export default function HomeClientWrapper({ children }: Props) {
  const scrollToReservation = () => {
    const el = document.getElementById("reservation-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const copyClubId = () => {
    navigator.clipboard.writeText("210083");
    alert("คัดลอก ID ชมรม 210083 แล้ว!");
  };

  return (
    <>
      {/* Onboarding Stepper */}
      <div className="max-w-5xl mx-auto px-4 pt-10 mb-12">
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-sm md:text-lg">💡</span>
              ขั้นตอนการสั่งซื้อบัตรพร
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
              {[
                { step: "01", title: "เข้าชมรม", desc: "Heal_Hee (ID: 210083)", detail: "รอคูลดาวน์ 1 ชม. หากเพิ่งย้าย", icon: "🏠" },
                { step: "02", title: "กดขอในเกม", desc: "เลือกบัตรที่ต้องการ", detail: "จำกัด 3 ใบ / สัปดาห์", icon: "🎮" },
                { step: "03", title: "จองในเว็บ", desc: "เลือกคิวตามรอบเวลา", detail: "โอนเงินตามยอดที่สรุป", icon: "💳" },
                { step: "04", title: "ส่งหลักฐาน", desc: "แนบสลิป + รูปในเกม", detail: "รอรับของตามรอบส่ง", icon: "📦" }
              ].map((s, i) => (
                <div key={i} className="relative group">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-950 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                        {s.icon}
                      </div>
                      <span className="text-2xl md:text-4xl font-black text-white/10 group-hover:text-indigo-500/20 transition-colors">{s.step}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-white mb-1">{s.title}</h4>
                      <p className="text-sm text-zinc-400 font-bold">{s.desc}</p>
                      <p className="text-[11px] text-indigo-400/70 font-bold mt-1">{s.detail}</p>
                    </div>
                  </div>
                  {i < 3 && <div className="hidden md:block absolute top-6 -right-4 w-8 h-px bg-indigo-500/20" />}
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-indigo-500/10 flex flex-wrap items-center gap-4">
              <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3">
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Club ID:</span>
                <code className="text-indigo-400 font-black">210083</code>
                <button onClick={copyClubId} className="text-[10px] px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg font-bold hover:bg-indigo-600/40 transition-all">Copy ID</button>
              </div>
              <p className="text-xs text-zinc-500 font-bold">⚠️ หากยังไม่กดขอในเกม <span className="text-white">"ห้ามโอนเงิน"</span> มาก่อนเด็ดขาด!</p>
            </div>
          </div>
        </div>
      </div>
      {/* Delivery Table */}
      <div className="relative">
        <DeliveryDashboard />
      </div>


      {/* Reservation Section */}
      <div id="reservation-section" className="pt-10 md:pt-20 pb-10">
        <div className="max-w-5xl mx-auto px-4 text-center mb-10">
          <h2 className="text-3xl font-black text-white">📦 เลือกสินค้าที่ต้องการ</h2>
          <p className="text-zinc-500 text-sm mt-2">เลือกตัวละครที่ต้องการจองคิว เพื่อรับในรอบการโอนที่ใกล้ที่สุด</p>
        </div>
        {children}
      </div>
    </>
  );
}
