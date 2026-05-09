"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Package,
  Users,
  Clock,
  DollarSign,
  RefreshCw,
  Check,
  X,
  ChevronDown,
  ExternalLink,
  Gamepad2,
  Image as ImageIcon,
  Eye,
  Settings,
  Upload,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
  AlertCircle,
} from "lucide-react";


interface Reservation {
  id: string;
  card_id: string;
  customer_name: string;
  facebook_url: string | null;
  quantity: number;
  status: string;
  week_start: string;
  queue_number: number;
  slip_url: string | null;
  notes: string | null;
  created_at: string;
  ingame_name?: string;
  delivery_slot: string | null;
  proof_url: string | null;
}

interface Card {
  id: string;
  label: string;
  category: string;
  price: number;
  image_url: string | null;
  active: boolean;
  sort_order: number;
}

interface Props {
  weekStart: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  queued: { label: "รอคิว", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  paid: { label: "ชำระแล้ว", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  confirmed: { label: "ยืนยันแล้ว", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  delivered: { label: "ส่งแล้ว", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  cancelled: { label: "ยกเลิก", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

export default function AdminClient({ weekStart }: Props) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeTab, setActiveTab] = useState<"reservations" | "settings" | "rounds" | "products">("reservations");
  const [settings, setSettings] = useState<any>({});
  const [updatingSetting, setUpdatingSetting] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [cardFilter, setCardFilter] = useState<string>("all");
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(weekStart);
  const [loading, setLoading] = useState(true);

  // Product Management State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Card> | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const shiftWeek = (dir: number) => {
    const d = new Date(selectedWeek);
    d.setDate(d.getDate() + 7 * dir);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    setSelectedWeek(d.toISOString().split("T")[0]);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resRes, cardsRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/reservations?week_start=${selectedWeek}`),
        fetch("/api/admin/cards"),
        fetch("/api/admin/settings"),
      ]);
      const resData = await resRes.json();
      const cardsData = await cardsRes.json();
      const settingsData = await settingsRes.json();
      setReservations(resData);
      setCards(cardsData);
      setSettings(settingsData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedWeek]);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/admin/reservations?week_start=${selectedWeek}`);
    setReservations(await res.json());
  }, [selectedWeek]);

  const handleUpdateSetting = async (key: string, value: string) => {
    setUpdatingSetting(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSettings({ ...settings, [key]: value });
      }
    } finally {
      setUpdatingSetting(false);
    }
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdatingSetting(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `qr-${Date.now()}.${fileExt}`;
      const filePath = `qr/${fileName}`;

      const { error: uploadError } = await (await import("@/lib/supabase")).supabase.storage
        .from('slips')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = (await import("@/lib/supabase")).supabase.storage
        .from('slips')
        .getPublicUrl(filePath);

      await handleUpdateSetting("promptpay_qr_url", publicUrl);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUpdatingSetting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await refresh();
  };

  const handleSaveProduct = async (product: Partial<Card>) => {
    const isNew = !cards.find(c => c.id === product.id);
    const method = isNew ? "POST" : "PATCH";
    
    // Auto-generate ID if missing
    if (isNew && !product.id && product.label) {
      product.id = product.label.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4);
    }

    try {
      const res = await fetch("/api/admin/cards", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        setIsEditingProduct(false);
        setEditingProduct(null);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "บันทึกไม่สำเร็จ");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?")) return;
    try {
      const res = await fetch(`/api/admin/cards?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "ลบไม่สำเร็จ");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `card-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await (await import("@/lib/supabase")).supabase.storage
        .from('cards')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = (await import("@/lib/supabase")).supabase.storage
        .from('cards')
        .getPublicUrl(filePath);

      setEditingProduct({ ...editingProduct, image_url: publicUrl });
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };


  const cardMap = Object.fromEntries(cards.map((c) => [c.id, c]));

  const filtered = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);
  const cardFiltered = cardFilter === "all" ? filtered : filtered.filter((r) => r.card_id === cardFilter);

  const stats = {
    total: reservations.length,
    queued: reservations.filter((r) => r.status === "queued").length,
    paid: reservations.filter((r) => r.status === "paid").length,
    delivered: reservations.filter((r) => r.status === "delivered").length,
    revenue: reservations
      .filter((r) => r.status === "delivered" || r.status === "paid" || r.status === "confirmed")
      .reduce((s, r) => s + r.quantity * (cardMap[r.card_id]?.price || 0), 0),
  };

  // Group by card
  const groupedByCard: Record<string, Reservation[]> = {};
  for (const r of cardFiltered) {
    if (!groupedByCard[r.card_id]) groupedByCard[r.card_id] = [];
    groupedByCard[r.card_id].push(r);
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black">🛡️ <span className="text-indigo-400">Admin</span> Panel</h1>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => shiftWeek(-1)} className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all">
                <ChevronLeft size={14} />
              </button>
              <span className="text-zinc-500 text-sm font-bold">
                {selectedWeek === weekStart ? "📌 " : ""}{formatDate(selectedWeek)}
              </span>
              <button onClick={() => shiftWeek(1)} className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all">
                <ChevronRight size={14} />
              </button>
              {selectedWeek !== weekStart && (
                <button onClick={() => setSelectedWeek(weekStart)} className="text-[10px] px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg font-bold hover:bg-indigo-600/30 transition-all">
                  กลับสัปดาห์นี้
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refresh} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all">
              <RefreshCw size={16} />
            </button>
            <Link href="/" className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all">
              <ArrowLeft size={14} /> หน้าลูกค้า
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("reservations")}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === "reservations" ? "text-indigo-400 border-indigo-400" : "text-zinc-500 border-transparent"
            }`}
          >
            รายการจอง
          </button>
          <button
            onClick={() => setActiveTab("rounds")}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === "rounds" ? "text-indigo-400 border-indigo-400" : "text-zinc-500 border-transparent"
            }`}
          >
            รอบส่งของวันนี้
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === "settings" ? "text-indigo-400 border-indigo-400" : "text-zinc-500 border-transparent"
            }`}
          >
            ตั้งค่าระบบ
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === "products" ? "text-indigo-400 border-indigo-400" : "text-zinc-500 border-transparent"
            }`}
          >
            จัดการสินค้า
          </button>
        </div>

        {activeTab === "reservations" && (
          <div className="space-y-6">
            {/* Stats and existing reservations list logic... */}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: <Users size={16} />, label: "ทั้งหมด", value: stats.total, color: "text-indigo-400" },
            { icon: <Clock size={16} />, label: "รอคิว", value: stats.queued, color: "text-yellow-400" },
            { icon: <DollarSign size={16} />, label: "ชำระแล้ว", value: stats.paid, color: "text-blue-400" },
            { icon: <Package size={16} />, label: "ส่งแล้ว", value: stats.delivered, color: "text-green-400" },
            { icon: <DollarSign size={16} />, label: "รายได้", value: `฿${stats.revenue.toLocaleString()}`, color: "text-indigo-400" },
          ].map((s, i) => (
            <div key={i} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
              <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-zinc-500 font-bold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter by status */}
        <div className="flex gap-2 flex-wrap">
          {["all", "queued", "paid", "confirmed", "delivered", "cancelled"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? "bg-indigo-600 text-white" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"}`}>
              {f === "all" ? "ทั้งหมด" : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>

        {/* Card filter button */}
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

        {/* Card Picker Modal */}
        {showCardPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowCardPicker(false)}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg">เลือกตัวละคร</h3>
                <button onClick={() => setShowCardPicker(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                  <X size={18} className="text-zinc-500" />
                </button>
              </div>

              {/* All button */}
              <button
                onClick={() => { setCardFilter("all"); setShowCardPicker(false); }}
                className={`w-full p-3 mb-3 rounded-xl border transition-all flex items-center gap-3 ${cardFilter === "all" ? "bg-indigo-600/10 border-indigo-500/30" : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"}`}
              >
                <div className="w-10 h-10 bg-zinc-700 rounded-xl flex items-center justify-center text-lg">🏀</div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-sm">ทุกตัวละคร</p>
                  <p className="text-xs text-zinc-500">แสดงคิวทั้งหมด</p>
                </div>
                {cardFilter === "all" && <Check size={16} className="text-indigo-400" />}
              </button>

              {/* Grouped by category */}
              {["standard", "SP", "LG"].map((cat) => {
                const catCards = cards.filter((c) => c.category === cat);
                if (catCards.length === 0) return null;
                return (
                  <div key={cat} className="mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2 px-1">
                      {cat === "SP" ? "SP" : cat === "LG" ? "Last Game" : "Standard"}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
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
                          <span className="text-[11px] font-bold truncate w-full text-center">{card.label}</span>
                          <span className="text-[9px] text-indigo-400 font-bold">฿{card.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List grouped by card */}
        <div className="space-y-6">
          {Object.entries(groupedByCard).length === 0 ? (
            <p className="text-center text-zinc-500 py-12">ไม่มีรายการ</p>
          ) : (
            Object.entries(groupedByCard).map(([cardId, cardReservations]) => {
              const card = cardMap[cardId];
              return (
                <div key={cardId}>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
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
                                <p className="font-bold flex items-center gap-2">
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
                              <button onClick={() => updateStatus(r.id, "confirmed")} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs font-bold text-purple-400 hover:bg-purple-500/20 transition-all">✅ ยืนยัน</button>
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
    )}

    {activeTab === "rounds" && (
          <div className="space-y-8">
            <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-4 flex items-center gap-3">
              <Clock size={20} className="text-indigo-400" />
              <p className="text-sm text-zinc-400">รายการจะปรากฏที่นี่เฉพาะคิวที่ **ส่งสลิปแล้ว** เท่านั้น เพื่อให้คุณเช็คยอดและส่งของในเกมตามรอบเวลา</p>
            </div>
            
            {["10:30", "12:30", "15:30", "18:30", "21:30"].map(roundTime => {
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
        )}

        {activeTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-white">
                <DollarSign size={20} className="text-indigo-400" />
                ตั้งค่าการชำระเงิน
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 block">QR Code พร้อมเพย์</label>
                  <div className="flex flex-col items-center gap-4 p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
                    <div className="relative group">
                      <div className="w-48 h-48 bg-white rounded-xl overflow-hidden shadow-lg border border-zinc-800 flex items-center justify-center">
                        {settings.promptpay_qr_url ? (
                          <img src={settings.promptpay_qr_url} alt="QR" className="max-w-full max-h-full object-contain" />
                        ) : (
                          <div className="text-zinc-300 text-xs text-center p-4">ยังไม่มีรูป QR Code</div>
                        )}
                      </div>
                      
                      {updatingSetting && (
                        <div className="absolute inset-0 bg-zinc-950/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <Loader2 size={24} className="text-indigo-400 animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    <div className="relative w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQRUpload}
                        disabled={updatingSetting}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                      />
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-bold transition-all border border-zinc-700">
                        <Upload size={16} /> อัปโหลดรูปใหม่
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-zinc-600 leading-relaxed">
                    * รูปนี้จะแสดงในหน้าจองหลังจากลูกค้ากดยืนยัน แนะนำให้ใช้รูปจัตุรัสที่มีความคมชัด
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 block">ชื่อบัญชี / ผู้รับเงิน</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="เช่น วชิรวิทย์ ดวงดี"
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                      defaultValue={settings?.payment_receiver_name || ""}
                      id="receiver_name_input"
                    />
                    <button 
                      onClick={async () => {
                        const val = (document.getElementById("receiver_name_input") as HTMLInputElement).value;
                        setUpdatingSetting(true);
                        try {
                          await fetch("/api/admin/settings", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ key: "payment_receiver_name", value: val }),
                          });
                          refresh();
                        } finally {
                          setUpdatingSetting(false);
                        }
                      }}
                      disabled={updatingSetting}
                      className="px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 rounded-xl text-sm font-bold transition-all"
                    >
                      {updatingSetting ? "..." : "บันทึก"}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/50">
                  <div className="p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-2xl">
                    <p className="text-xs text-indigo-400 font-bold mb-1">💡 เคล็ดลับ</p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      ข้อมูลที่ตั้งค่าตรงนี้จะไปปรากฏที่หน้าจองของลูกค้าทันที เพื่อช่วยลดความผิดพลาดในการโอนเงิน
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <Settings size={24} className="text-zinc-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-500">การตั้งค่าอื่นๆ</h3>
              <p className="text-sm text-zinc-600 mt-2 max-w-xs mx-auto">
                ฟีเจอร์อื่นๆ เช่น ปิด-เปิดการจองชั่วคราว หรือเปลี่ยนข้อความประกาศ กำลังอยู่ในช่วงพัฒนา
              </p>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">📦 จัดการสินค้า</h2>
                <p className="text-zinc-500 text-sm">เพิ่ม แก้ไข หรือปิดการใช้งานการ์ดตัวละคร</p>
              </div>
              <button 
                onClick={() => {
                  setEditingProduct({ active: true, price: 15, category: 'standard', sort_order: cards.length + 1 });
                  setIsEditingProduct(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
              >
                <Plus size={18} /> เพิ่มสินค้าใหม่
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text"
                placeholder="ค้นหาสินค้าจากชื่อหรือ ID..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards
                .filter(c => 
                  c.label.toLowerCase().includes(productSearch.toLowerCase()) || 
                  c.id.toLowerCase().includes(productSearch.toLowerCase())
                )
                .map((c) => (
                <div key={c.id} className={`bg-zinc-900 border ${c.active ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60'} rounded-2xl overflow-hidden group hover:border-indigo-500/30 transition-all`}>
                  <div className="aspect-[4/3] relative overflow-hidden bg-zinc-950">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-zinc-800" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${c.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-black text-white">{c.label}</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{c.category}</p>
                      </div>
                      <p className="text-indigo-400 font-black">{c.price}฿</p>
                    </div>
                    <p className="text-[10px] text-zinc-600 mb-4 font-mono">ID: {c.id}</p>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(c);
                          setIsEditingProduct(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all"
                      >
                        <Pencil size={14} /> แก้ไข
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(c.id)}
                        className="p-2 bg-red-500/5 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 rounded-lg transition-all border border-red-500/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {isEditingProduct && editingProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setIsEditingProduct(false)} />
            <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-black text-white">
                  {cards.find(c => c.id === editingProduct.id) ? '📝 แก้ไขสินค้า' : '✨ เพิ่มสินค้าใหม่'}
                </h3>
                <button onClick={() => setIsEditingProduct(false)} className="p-2 hover:bg-zinc-800 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                {/* Image Upload Area */}
                <div className="relative aspect-video bg-zinc-950 rounded-2xl border-2 border-dashed border-zinc-800 overflow-hidden group">
                  {editingProduct.image_url ? (
                    <>
                      <img src={editingProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl font-bold text-xs">
                          {uploadingImage ? 'Uploading...' : 'เปลี่ยนรูปภาพ'}
                          <input type="file" className="hidden" accept="image/*" onChange={handleProductImageUpload} disabled={uploadingImage} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900/50 transition-all">
                      <ImageIcon size={32} className="text-zinc-700 mb-2" />
                      <span className="text-xs font-bold text-zinc-500">คลิกเพื่ออัปโหลดรูปภาพ</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleProductImageUpload} disabled={uploadingImage} />
                    </label>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center">
                      <Loader2 className="animate-spin text-indigo-400" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">ชื่อสินค้า</label>
                    <input 
                      type="text"
                      value={editingProduct.label || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, label: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-sm"
                      placeholder="เช่น คิเสะ ZONE"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">ราคา (บาท)</label>
                    <input 
                      type="number"
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">หมวดหมู่</label>
                    <select 
                      value={editingProduct.category || "standard"}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-sm"
                    >
                      <option value="standard">Standard (15฿)</option>
                      <option value="SP">SP (30฿)</option>
                      <option value="LG">Last Game (30฿)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">ลำดับการแสดงผล</label>
                    <input 
                      type="number"
                      value={editingProduct.sort_order || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sort_order: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">สถานะ</label>
                  <button 
                    onClick={() => setEditingProduct({ ...editingProduct, active: !editingProduct.active })}
                    className={`flex items-center gap-3 w-full p-4 rounded-xl border transition-all ${
                      editingProduct.active 
                        ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {editingProduct.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    <span className="text-xs font-bold">{editingProduct.active ? 'เปิดใช้งาน (ปรากฏที่หน้าเว็บ)' : 'ปิดใช้งาน (ซ่อนจากหน้าเว็บ)'}</span>
                  </button>
                </div>

                {!cards.find(c => c.id === editingProduct.id) && (
                  <p className="text-[10px] text-zinc-500 italic">* ID จะถูกสร้างให้อัตโนมัติจากชื่อสินค้า</p>
                )}
              </div>

              <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex gap-3">
                <button 
                  onClick={() => setIsEditingProduct(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={() => handleSaveProduct(editingProduct)}
                  disabled={!editingProduct.label || !editingProduct.price || uploadingImage}
                  className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-black transition-all shadow-lg shadow-indigo-600/20"
                >
                  {uploadingImage ? 'กำลังอัปโหลด...' : 'บันทึกข้อมูลสินค้า'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
