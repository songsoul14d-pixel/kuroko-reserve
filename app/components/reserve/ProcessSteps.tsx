import { Zap, Sparkles, Shield, CheckCircle2 } from "lucide-react";

const STEPS = [
  { icon: <Sparkles size={28} />, title: "เลือกตัวละคร", desc: "เลือกนักเตะที่คุณต้องการจอง", color: "text-blue-400", glow: "shadow-blue-500/20" },
  { icon: <Shield size={28} />, title: "กรอกข้อมูล", desc: "ระบุชื่อและข้อมูลการติดต่อให้ครบถ้วน", color: "text-emerald-400", glow: "shadow-emerald-500/20" },
  { icon: <Zap size={28} />, title: "ชำระเงิน", desc: "สแกนจ่ายผ่าน QR Code สะดวกและรวดเร็ว", color: "text-amber-400", glow: "shadow-amber-500/20" },
  { icon: <CheckCircle2 size={28} />, title: "เสร็จสิ้น", desc: "รอรับบัตรตัวละครของคุณภายในเกม", color: "text-green-400", glow: "shadow-green-500/20" },
];

export default function ProcessSteps() {
  return (
    <div className="py-20 px-8 bg-zinc-900/40 border border-zinc-800/50 rounded-[4rem] relative overflow-hidden group mb-12">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
      
      <div className="relative z-10 space-y-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">
            <Zap size={12} className="text-amber-400" />
            รวดเร็ว ทันใจ
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">จองง่ายๆ ใน <span className="text-indigo-500 italic">4 ขั้นตอน</span></h2>
          <p className="text-zinc-500 text-sm md:text-base mt-4 font-black uppercase tracking-widest opacity-60">สัมผัสประสบการณ์การจองที่พรีเมียมที่สุด</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          <div className="absolute top-10 left-20 right-20 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent hidden lg:block" />

          {STEPS.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-6 group/step relative">
              <div className={`w-20 h-20 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center ${step.color} group-hover/step:border-indigo-500/50 transition-all duration-500 shadow-2xl ${step.glow} relative z-10 bg-zinc-950 group-hover/step:scale-110 group-hover/step:-translate-y-2`}>
                {step.icon}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                  0{i+1}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-white text-base uppercase tracking-tight group-hover/step:text-indigo-400 transition-colors">{step.title}</h3>
                <p className="text-zinc-500 text-xs font-bold leading-relaxed max-w-[160px] mx-auto uppercase tracking-wide opacity-80">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
