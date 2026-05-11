import { Search, ChevronDown, Check, CheckCircle2, ExternalLink, Gamepad2, ImageIcon, MessageCircle, Eye, Trash2, X } from "lucide-react";
import { STATUS_CONFIG, getWeekStart } from "@/lib/types";

interface Props {
  statusFilter: string;
  setStatusFilter: (f: string) => void;
  cardFilter: string;
  setCardFilter: (f: string) => void;
  showCardPicker: boolean;
  setShowCardPicker: (s: boolean) => void;
  cards: any[];
  cardMap: Record<string, any>;
  groupedByCard: Record<string, any[]>;
  weekFilter: string;
  setWeekFilter: (w: string) => void;
  allWeeks: string[];
  updateStatus: (id: string, status: string) => void;
}

export default function ReservationsTab({
  statusFilter,
  setStatusFilter,
  cardFilter,
  setCardFilter,
  showCardPicker,
  setShowCardPicker,
  weekFilter,
  setWeekFilter,
  allWeeks,
  cards,
  cardMap,
  groupedByCard,
  updateStatus
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-zinc-800/50">
        {allWeeks.map((w) => {
          const date = new Date(w);
          const label = date.toLocaleDateString("th-TH", { day: 'numeric', month: 'short' });
          const isCurrent = w === getWeekStart();
          return (
            <button
              key={w}
              onClick={() => setWeekFilter(w)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                weekFilter === w
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
              }`}
            >
              สัปดาห์ {label} {isCurrent && "🏀"}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "queued", "paid", "confirmed", "delivered", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
              statusFilter === f
                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
            }`}
          >
            {f === "all" ? "ทั้งหมด" : STATUS_CONFIG[f]?.label || f}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowCardPicker(true)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all"
      >
        {cardFilter === "all" ? (
          <>
            <img src={`/card/${cards[0]?.id}.png`} alt="" className="w-5 h-5 rounded object-cover" />
            <img src={`/card/${cards[3]?.id}.png`} alt="" className="w-5 h-5 rounded object-cover -ml-2" />
            <img src={`/card/${cards[6]?.id}.png`} alt="" className="w-5 h-5 rounded object-cover -ml-2" />
            <span className="text-zinc-400">ทุกตัวละคร</span>
          </>
        ) : (
          <>
            <img src={`/card/${cardFilter}.png`} alt={cardMap[cardFilter]?.label} className="w-6 h-6 rounded object-cover" />
            <span className="text-indigo-400">{cardMap[cardFilter]?.label}</span>
          </>
        )}
        <ChevronDown size={14} className="text-zinc-500" />
      </button>

      {showCardPicker && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setShowCardPicker(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 md:p-6 max-w-lg w-full my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg text-white">เลือกตัวละคร</h3>
              <button onClick={() => setShowCardPicker(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X size={18} className="text-zinc-500" />
              </button>
            </div>

            <button
              onClick={() => { setCardFilter("all"); setShowCardPicker(false); }}
              className={`w-full p-3 mb-3 rounded-xl border transition-all flex items-center gap-3 ${cardFilter === "all" ? "bg-indigo-600/10 border-indigo-500/30" : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"}`}
            >
              <div className="w-10 h-10 bg-zinc-700 rounded-xl flex items-center justify-center text-lg">🏀</div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm text-white">ทุกตัวละคร</p>
                <p className="text-xs text-zinc-500">แสดงคิวทั้งหมด</p>
              </div>
              {cardFilter === "all" && <Check size={16} className="text-indigo-400" />}
            </button>

            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
              {["standard", "SP", "LG"].map((cat) => {
                const catCards = cards.filter((c) => c.category === cat);
                if (catCards.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2 px-1">
                      {cat === "SP" ? "SP" : cat === "LG" ? "Last Game" : "Standard"}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {catCards.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => { setCardFilter(cardFilter === card.id ? "all" : card.id); setShowCardPicker(false); }}
                          className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                            cardFilter === card.id
                              ? "bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/30"
                              : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"
                          }`}
                        >
                          <img src={`/card/${card.id}.png`} alt={card.label} className="w-12 h-12 rounded-xl object-cover" />
                          <span className="text-[11px] font-bold truncate w-full text-center text-white">{card.label}</span>
                          <span className="text-[9px] text-indigo-400 font-bold">฿{card.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedByCard).length === 0 ? (
          <p className="text-center text-zinc-500 py-12">ไม่มีรายการ</p>
        ) : (
          Object.entries(groupedByCard).map(([cardId, cardReservations]) => {
            const card = cardMap[cardId];
            return (
              <div key={cardId}>
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                  <img src={`/card/${cardId}.png`} alt={card?.label} className="w-6 h-6 rounded object-cover" />
                  {card?.label || cardId} ({cardReservations.length} คิว)
                </h3>
                <div className="space-y-2">
                  {cardReservations.map((r) => {
                    const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.queued;
                    return (
                      <div key={r.id} className={`p-4 rounded-xl border ${st.bg}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-lg font-black text-indigo-400 shrink-0">#{r.queue_number}</div>
                            <div>
                              <p className="font-bold flex items-center gap-2 text-white">
                                {r.customer_name}
                                {r.facebook_url && (
                                  <a href={r.facebook_url} target="_blank" className="text-blue-400 hover:text-blue-300 transition-all">
                                    <ExternalLink size={14} />
                                  </a>
                                )}
                              </p>
                              <p className="text-sm text-zinc-400 flex items-center gap-1.5">
                                <span>× {r.quantity} = <span className="text-indigo-400 font-bold">฿{(r.quantity * (card?.price || 0)).toLocaleString()}</span></span>
                              </p>
                              {r.ingame_name && (
                                <p className="text-xs text-indigo-400/80 font-bold flex items-center gap-1 mt-0.5">
                                  <Gamepad2 size={12} /> {r.ingame_name}
                                </p>
                              )}
                              {r.notes && <p className="text-xs text-zinc-500 mt-1 italic">📝 {r.notes}</p>}
                              <p className="text-[10px] text-zinc-600 mt-1">{new Date(r.created_at).toLocaleString("th-TH")}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${st.color} ${st.bg}`}>{st.label}</span>
                        </div>
                        <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-zinc-800/50">
                          {r.proof_url && (
                            <a href={r.proof_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all">
                              <Gamepad2 size={12} /> รูปในเกม
                            </a>
                          )}
                          {r.slip_url && (
                            <a href={r.slip_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs font-bold text-green-400 hover:bg-green-500/20 transition-all">
                              <ImageIcon size={12} /> ดูสลิป
                            </a>
                          )}
                          {r.facebook_url && (
                            <a href={r.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all">
                              <MessageCircle size={12} /> ทัก Facebook
                            </a>
                          )}
                          {r.status === "queued" && (
                            <button onClick={() => updateStatus(r.id, "paid")} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all">💰 ชำระแล้ว</button>
                          )}
                          {r.status === "paid" && (
                            <button onClick={() => updateStatus(r.id, "confirmed")} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all">✅ ยืนยัน</button>
                          )}
                          {r.status === "confirmed" && (
                            <button onClick={() => updateStatus(r.id, "delivered")} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs font-bold text-green-400 hover:bg-green-500/20 transition-all">📦 ส่งแล้ว</button>
                          )}
                          {r.status !== "cancelled" && r.status !== "delivered" && (
                            <button onClick={() => updateStatus(r.id, "cancelled")} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all">❌ ยกเลิก</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
