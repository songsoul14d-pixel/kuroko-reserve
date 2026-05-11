import { DollarSign, Upload, Image as ImageIcon, Loader2 } from "lucide-react";

interface Props {
  settings: any;
  setSettings: (s: any) => void;
  updateSettings: (s: any) => void;
  uploadingImage: boolean;
  handleQRUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SystemSettingsTab({
  settings,
  setSettings,
  updateSettings,
  uploadingImage,
  handleQRUpload
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-white">
          <DollarSign size={20} className="text-indigo-400" />
          ตั้งค่าการชำระเงิน
        </h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">ชื่อบัญชี</label>
            <input 
              type="text"
              value={settings.bank_account_name || ""}
              onChange={(e) => setSettings({ ...settings, bank_account_name: e.target.value })}
              className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
              placeholder="ชื่อ-นามสกุล"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">เลขบัญชี / เบอร์ PromptPay</label>
            <input 
              type="text"
              value={settings.bank_account_number || ""}
              onChange={(e) => setSettings({ ...settings, bank_account_number: e.target.value })}
              className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
              placeholder="000-0-00000-0"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">QR Code รับเงิน</label>
            <div className="relative aspect-square max-w-[240px] mx-auto bg-zinc-950 rounded-3xl border-2 border-dashed border-zinc-800 overflow-hidden group">
              {settings.qr_code_url ? (
                <>
                  <img src={settings.qr_code_url} alt="Payment QR" className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl font-bold text-xs shadow-xl">
                      {uploadingImage ? 'Uploading...' : 'เปลี่ยนรูปภาพ'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleQRUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900/50 transition-all p-6 text-center">
                  <Upload size={32} className="text-zinc-700 mb-2" />
                  <span className="text-xs font-bold text-zinc-500">คลิกเพื่ออัปโหลด QR Code</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleQRUpload} disabled={uploadingImage} />
                </label>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center">
                  <Loader2 className="animate-spin text-indigo-400" />
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => updateSettings(settings)}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-white">
          <ImageIcon size={20} className="text-indigo-400" />
          ภาพรวมระบบ
        </h3>
        <div className="space-y-4">
          <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">สถานะเซิร์ฟเวอร์</p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-sm font-bold text-white uppercase tracking-widest">Online & Ready</span>
            </div>
          </div>
          <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">ข้อมูลเบื้องต้น</p>
             <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-zinc-500">API Latency</span>
                   <span className="text-green-400 font-mono">24ms</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-zinc-500">DB Connections</span>
                   <span className="text-indigo-400 font-mono">3 Active</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
