import { X, Loader2, ImageIcon, ToggleRight, ToggleLeft } from "lucide-react";
import { Card } from "@/lib/types";

interface Props {
  isOpen: boolean;
  editingProduct: Partial<Card> | null;
  setEditingProduct: (p: any) => void;
  onClose: () => void;
  onSave: (p: Partial<Card>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingImage: boolean;
  isNew: boolean;
}

export default function ProductEditModal({
  isOpen,
  editingProduct,
  setEditingProduct,
  onClose,
  onSave,
  onImageUpload,
  uploadingImage,
  isNew
}: Props) {
  if (!isOpen || !editingProduct) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xl font-black text-white">
            {isNew ? '✨ เพิ่มสินค้าใหม่' : '📝 แก้ไขสินค้า'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="relative aspect-video bg-zinc-950 rounded-2xl border-2 border-dashed border-zinc-800 overflow-hidden group">
            {editingProduct.image_url ? (
              <>
                <img src={editingProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl font-bold text-xs">
                    {uploadingImage ? 'Uploading...' : 'เปลี่ยนรูปภาพ'}
                    <input type="file" className="hidden" accept="image/*" onChange={onImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
              </>
            ) : (
              <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900/50 transition-all">
                <ImageIcon size={32} className="text-zinc-700 mb-2" />
                <span className="text-xs font-bold text-zinc-500">คลิกเพื่ออัปโหลดรูปภาพ</span>
                <input type="file" className="hidden" accept="image/*" onChange={onImageUpload} disabled={uploadingImage} />
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
              <label htmlFor="prod_label" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">ชื่อสินค้า</label>
              <input 
                id="prod_label"
                type="text"
                value={editingProduct.label || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, label: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-sm"
                placeholder="เช่น คิเสะ ZONE"
              />
            </div>
            <div>
              <label htmlFor="prod_price" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">ราคา (บาท)</label>
              <input 
                id="prod_price"
                type="number"
                value={editingProduct.price || 0}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="prod_cat" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">หมวดหมู่</label>
              <select 
                id="prod_cat"
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
              <label htmlFor="prod_sort" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">ลำดับการแสดงผล</label>
              <input 
                id="prod_sort"
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

          {isNew && (
            <p className="text-[10px] text-zinc-500 italic">* ID จะถูกสร้างให้อัตโนมัติจากชื่อสินค้า</p>
          )}
        </div>

        <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition-all"
          >
            ยกเลิก
          </button>
          <button 
            onClick={() => onSave(editingProduct)}
            disabled={!editingProduct.label || !editingProduct.price || uploadingImage}
            className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-black transition-all shadow-lg shadow-indigo-600/20"
          >
            {uploadingImage ? 'กำลังอัปโหลด...' : 'บันทึกข้อมูลสินค้า'}
          </button>
        </div>
      </div>
    </div>
  );
}
