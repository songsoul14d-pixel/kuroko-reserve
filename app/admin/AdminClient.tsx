"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Package, Clock, Settings, LogOut, Loader2, DollarSign, Users, ChevronDown, Check, X, Search, Pencil, Trash2, Plus, Image as ImageIcon, ToggleRight, ToggleLeft, ExternalLink, Gamepad2, MessageCircle, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, Reservation, STATUS_CONFIG, getWeekStart } from "@/lib/types";

// Sub-components
import ReservationsTab from "./components/ReservationsTab";
import RoundsTab from "./components/RoundsTab";
import SystemSettingsTab from "./components/SystemSettingsTab";
import ProductManagement from "./components/ProductManagement";
import ProductEditModal from "./components/ProductEditModal";

interface Props {
  initialCards: Card[];
  initialReservations: Reservation[];
  initialSettings: any;
}

export default function AdminClient({ initialCards, initialReservations, initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<"reservations" | "rounds" | "products" | "settings">("reservations");
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [cardFilter, setCardFilter] = useState("all");
  const [weekFilter, setWeekFilter] = useState(getWeekStart());
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Product Editing
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Card> | null>(null);

  const cardMap = cards.reduce((acc, card) => ({ ...acc, [card.id]: card }), {} as Record<string, Card>);

  // Stats
  const stats = {
    totalReservations: reservations.length,
    activeReservations: reservations.filter(r => r.status !== 'delivered' && r.status !== 'cancelled').length,
    totalRevenue: reservations.filter(r => r.status !== 'cancelled').reduce((acc, r) => acc + (r.quantity * (cardMap[r.card_id]?.price || 0)), 0),
    deliveredToday: reservations.filter(r => r.status === 'delivered' && new Date(r.updated_at).toDateString() === new Date().toDateString()).length
  };

  // Handlers
  const refreshData = async () => {
    setLoading(true);
    const { data: resData } = await supabase.from("reservations").select("*").order("created_at", { ascending: false });
    const { data: cardData } = await supabase.from("cards").select("*").order("sort_order", { ascending: true });
    const { data: settsData } = await supabase.from("settings").select("*").single();
    
    if (resData) setReservations(resData);
    if (cardData) setCards(cardData);
    if (settsData) setSettings(settsData);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reservations").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (!error) refreshData();
  };

  const updateSettings = async (newSettings: any) => {
    const { error } = await supabase.from("settings").update(newSettings).eq("id", settings.id);
    if (!error) alert("บันทึกการตั้งค่าแล้ว");
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `qr-code.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('system-assets').upload(fileName, file, { upsert: true });
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('system-assets').getPublicUrl(fileName);
      await updateSettings({ ...settings, qr_code_url: publicUrl });
      setSettings({ ...settings, qr_code_url: publicUrl });
    }
    setUploadingImage(false);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `card-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('cards').upload(fileName, file);
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('cards').getPublicUrl(fileName);
      setEditingProduct({ ...editingProduct, image_url: publicUrl });
    }
    setUploadingImage(false);
  };

  const handleSaveProduct = async (p: Partial<Card>) => {
    if (!p.label || !p.price) return;
    const productData = {
      label: p.label,
      price: p.price,
      category: p.category || 'standard',
      image_url: p.image_url || null,
      active: p.active !== undefined ? p.active : true,
      sort_order: p.sort_order || 0
    };

    if (p.id) {
      await supabase.from("cards").update(productData).eq("id", p.id);
    } else {
      const newId = p.label.toLowerCase().replace(/\s+/g, '-');
      await supabase.from("cards").insert({ ...productData, id: newId });
    }
    setIsEditingProduct(false);
    refreshData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("ยืนยันการลบสินค้า?")) {
      await supabase.from("cards").delete().eq("id", id);
      refreshData();
    }
  };

  const currentWeek = getWeekStart();
  const allWeeks = Array.from(new Set([currentWeek, ...reservations.map(r => r.week_start)]))
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));

  // Grouped Data for View
  const filteredReservations = reservations.filter(r => {
    const sMatch = statusFilter === "all" || r.status === statusFilter;
    const cMatch = cardFilter === "all" || r.card_id === cardFilter;
    const wMatch = r.week_start === weekFilter;
    return sMatch && cMatch && wMatch;
  });

  const groupedByCard = filteredReservations.reduce((acc, r) => {
    if (!acc[r.card_id]) acc[r.card_id] = [];
    acc[r.card_id].push(r);
    return acc;
  }, {} as Record<string, Reservation[]>);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans pb-32">
      {/* Sidebar Navigation */}
      {/* Sidebar Navigation - Desktop */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-zinc-900 border-r border-zinc-800 flex-col items-center py-8 gap-8 z-50">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
          <LayoutDashboard size={24} />
        </div>
        
        <nav className="flex flex-col gap-4">
          <button onClick={() => setActiveTab("reservations")} className={`p-4 rounded-2xl transition-all ${activeTab === "reservations" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-zinc-800 text-zinc-500"}`}>
            <Users size={20} />
          </button>
          <button onClick={() => setActiveTab("rounds")} className={`p-4 rounded-2xl transition-all ${activeTab === "rounds" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-zinc-800 text-zinc-500"}`}>
            <Clock size={20} />
          </button>
          <button onClick={() => setActiveTab("products")} className={`p-4 rounded-2xl transition-all ${activeTab === "products" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-zinc-800 text-zinc-500"}`}>
            <Package size={20} />
          </button>
          <button onClick={() => setActiveTab("settings")} className={`p-4 rounded-2xl transition-all ${activeTab === "settings" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-zinc-800 text-zinc-500"}`}>
            <Settings size={20} />
          </button>
        </nav>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 flex items-center justify-around py-4 z-[100] px-4 safe-area-bottom">
        <button onClick={() => setActiveTab("reservations")} className={`p-3 rounded-2xl transition-all ${activeTab === "reservations" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-500"}`}>
          <Users size={20} />
        </button>
        <button onClick={() => setActiveTab("rounds")} className={`p-3 rounded-2xl transition-all ${activeTab === "rounds" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-500"}`}>
          <Clock size={20} />
        </button>
        <button onClick={() => setActiveTab("products")} className={`p-3 rounded-2xl transition-all ${activeTab === "products" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-500"}`}>
          <Package size={20} />
        </button>
        <button onClick={() => setActiveTab("settings")} className={`p-3 rounded-2xl transition-all ${activeTab === "settings" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-500"}`}>
          <Settings size={20} />
        </button>
      </div>

      <div className="px-4 md:pl-28 md:pr-8 pt-6 md:pt-12 max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase">Admin <span className="text-indigo-500 italic">Panel</span></h1>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">ระบบจัดการ Kuroko Reserve</p>
          </div>
          <div className="flex items-center gap-4">
            {loading && <Loader2 className="animate-spin text-indigo-500" size={20} />}
            <button onClick={() => window.location.href = "/"} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all font-bold text-sm">
              <LogOut size={16} /> ออกจากระบบ
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={80} /></div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">คิวทั้งหมด</p>
            <p className="text-3xl font-black text-white">{stats.totalReservations}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Clock size={80} /></div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">คิวค้างส่ง</p>
            <p className="text-3xl font-black text-indigo-400">{stats.activeReservations}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={80} /></div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">รายได้รวม</p>
            <p className="text-3xl font-black text-emerald-400">฿{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Package size={80} /></div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">ส่งวันนี้</p>
            <p className="text-3xl font-black text-amber-400">{stats.deliveredToday}</p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl md:rounded-[3rem] p-4 md:p-10 shadow-2xl relative overflow-hidden min-h-[500px] mb-20 md:mb-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
          
          {activeTab === "reservations" && (
            <ReservationsTab 
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              cardFilter={cardFilter}
              setCardFilter={setCardFilter}
              weekFilter={weekFilter}
              setWeekFilter={setWeekFilter}
              allWeeks={allWeeks}
              showCardPicker={showCardPicker}
              setShowCardPicker={setShowCardPicker}
              cards={cards}
              cardMap={cardMap}
              groupedByCard={groupedByCard}
              updateStatus={updateStatus}
            />
          )}

          {activeTab === "rounds" && (
            <RoundsTab reservations={reservations} updateStatus={updateStatus} />
          )}

          {activeTab === "products" && (
            <ProductManagement 
              cards={cards}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              onEdit={(c) => { setEditingProduct(c); setIsEditingProduct(true); }}
              onDelete={handleDeleteProduct}
              onAddNew={() => { setEditingProduct({ active: true, price: 15, category: 'standard', sort_order: cards.length + 1 }); setIsEditingProduct(true); }}
            />
          )}

          {activeTab === "settings" && (
            <SystemSettingsTab 
              settings={settings}
              setSettings={setSettings}
              updateSettings={updateSettings}
              uploadingImage={uploadingImage}
              handleQRUpload={handleQRUpload}
            />
          )}
        </div>
      </div>

      <ProductEditModal 
        isOpen={isEditingProduct}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        onClose={() => setIsEditingProduct(false)}
        onSave={handleSaveProduct}
        onImageUpload={handleProductImageUpload}
        uploadingImage={uploadingImage}
        isNew={!cards.find(c => c.id === editingProduct?.id)}
      />
    </div>
  );
}
