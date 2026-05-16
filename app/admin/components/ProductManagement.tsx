import { Plus, Search, Pencil, Trash2, Image as ImageIcon, X, Loader2, ToggleRight, ToggleLeft } from "lucide-react";
import { Card } from "@/lib/types";

interface Props {
  cards: Card[];
  productSearch: string;
  setProductSearch: (s: string) => void;
  onEdit: (c: Card) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export default function ProductManagement({
  cards,
  productSearch,
  setProductSearch,
  onEdit,
  onDelete,
  onAddNew
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">จัดการสินค้า</h2>
          <p className="text-zinc-500 text-sm">เพิ่ม แก้ไข หรือปิดการใช้งานการ์ดตัวละคร</p>
        </div>
        <button 
          onClick={onAddNew}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  onClick={() => onEdit(c)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-black transition-all active:scale-95"
                >
                  <Pencil size={14} /> แก้ไข
                </button>
                <button 
                  onClick={() => onDelete(c.id)}
                  className="p-3 bg-red-500/5 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 rounded-xl transition-all border border-red-500/10 active:scale-95"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
