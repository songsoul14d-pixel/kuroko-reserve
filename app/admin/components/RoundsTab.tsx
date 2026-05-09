import { Clock, Package, Check, Gamepad2, Eye } from "lucide-react";
import { STATUS_CONFIG } from "@/lib/types";

interface Props {
  reservations: any[];
  updateStatus: (id: string, status: string) => void;
}

export default function RoundsTab({ reservations, updateStatus }: Props) {
  const roundTimes = ["10:30", "12:30", "15:30", "18:30", "21:30"];

  return (
    <div className="space-y-8">
      <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-4 flex items-center gap-3">
        <Clock size={20} className="text-indigo-400" />
        <p className="text-sm text-zinc-400">รายการจะปรากฏที่นี่เฉพาะคิวที่ **ส่งสลิปแล้ว** เท่านั้น เพื่อให้คุณเช็คยอดและส่งของในเกมตามรอบเวลา</p>
      </div>
      
      {roundTimes.map(roundTime => {
        const items = reservations.filter(r => {
          if (!r.delivery_slot) return false;
          const d = new Date(r.delivery_slot);
          const t = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          return t === roundTime;
        });

        if (items.length === 0) return null;

        return (
          <div key={roundTime} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 bg-zinc-900 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 font-black">
                  {roundTime}
                </div>
                <h3 className="text-lg font-black text-white">รอบส่งของ {roundTime} น.</h3>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={async () => {
                    if (confirm(`คุณส่งของให้ทั้ง ${items.length} รายการในรอบ ${roundTime} เรียบร้อยแล้วใช่ไหม?`)) {
                      for (const item of items) {
                        if (item.status !== 'delivered') await updateStatus(item.id, 'delivered');
                      }
                    }
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-green-500/20"
                >
                  📦 ส่งครบทุกรายการแล้ว
                </button>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(r => (
                <div key={r.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 shrink-0 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-indigo-400 font-black">
                    #{r.queue_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-white truncate">{r.ingame_name || r.customer_name}</h4>
                      <span className="text-[10px] font-black text-indigo-400 uppercase">{r.card_id}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-zinc-500">จอง {r.quantity} ใบ</p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${STATUS_CONFIG[r.status]?.bg} ${STATUS_CONFIG[r.status]?.color}`}>
                        {STATUS_CONFIG[r.status]?.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.proof_url && (
                       <a href={r.proof_url} target="_blank" className="p-2 bg-zinc-900 border border-indigo-500/30 rounded-lg text-indigo-400 hover:text-white transition-all" title="ดูรูปในเกม">
                          <Gamepad2 size={14} />
                       </a>
                    )}
                    {r.slip_url && (
                       <a href={r.slip_url} target="_blank" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all" title="ดูสลิป">
                          <Eye size={14} />
                       </a>
                    )}
                    {r.status !== 'delivered' && (
                      <button onClick={() => updateStatus(r.id, "delivered")} className="p-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all">
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {reservations.filter(r => r.delivery_slot).length === 0 && (
         <div className="py-20 text-center">
            <Package size={48} className="mx-auto text-zinc-800 mb-4" />
            <h3 className="text-xl font-bold text-zinc-500">ยังไม่มีรายการส่งของในรอบต่างๆ</h3>
            <p className="text-zinc-600 text-sm mt-1">รายการจะขึ้นมาหลังจากลูกค้าส่งสลิปแล้วเท่านั้น</p>
         </div>
      )}
    </div>
  );
}
