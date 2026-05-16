"use client";

import { ReactNode } from "react";
import DeliveryDashboard from "./DeliveryDashboard";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  children: ReactNode; // This will be the CardGridClient
}

export default function HomeClientWrapper({ children }: Props) {
  const scrollToReservation = () => {
    const el = document.getElementById("reservation-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const [copied, setCopied] = useState(false);

  const copyClubId = () => {
    navigator.clipboard.writeText("210083");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Onboarding Steps — Compact */}
      <div className="max-w-5xl mx-auto px-4 pt-8 mb-8">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-black text-white mb-5">ขั้นตอนการสั่งซื้อบัตรพร</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { step: "01", title: "เข้าชมรม", desc: "Heal_Hee (ID: 210083)" },
              { step: "02", title: "กดขอในเกม", desc: "เลือกบัตรที่ต้องการ" },
              { step: "03", title: "จองในเว็บ", desc: "เลือกคิวตามรอบเวลา" },
              { step: "04", title: "ส่งหลักฐาน", desc: "แนบสลิป + รูปในเกม" },
            ].map((s, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-sm font-black text-zinc-600 shrink-0">{s.step}</span>
                <div>
                  <h4 className="font-bold text-white text-sm">{s.title}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-3">
            <button 
              onClick={copyClubId}
              className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg flex items-center gap-2 hover:bg-white/[0.08] transition-colors"
            >
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Club ID:</span>
              <code className="text-sm text-white font-bold">210083</code>
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-zinc-500" />}
            </button>
            <p className="text-[11px] text-zinc-600">
              หากยังไม่กดขอในเกม <span className="text-zinc-400">&quot;ห้ามโอนเงิน&quot;</span> มาก่อนเด็ดขาด
            </p>
          </div>
        </div>
      </div>
      {/* Delivery Table */}
      <div className="relative">
        <DeliveryDashboard />
      </div>


      {/* Reservation Section */}
      <div id="reservation-section" className="pt-8 md:pt-16 pb-8">
        <div className="max-w-5xl mx-auto px-4 text-center mb-8">
          <h2 className="text-2xl font-black text-white">เลือกสินค้าที่ต้องการ</h2>
          <p className="text-zinc-500 text-sm mt-1">เลือกตัวละครที่ต้องการจองคิว เพื่อรับในรอบการโอนที่ใกล้ที่สุด</p>
        </div>
        {children}
      </div>
    </>
  );
}
