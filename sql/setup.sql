# Kuroko Card Reserve — Supabase SQL
# รันใน Supabase SQL Editor ของ account ใหม่

-- ============================================================
-- 1. ตารางการ์ด (card catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'standard',
  image_url TEXT,
  price INTEGER NOT NULL DEFAULT 15,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

-- Seed ข้อมูลการ์ด
INSERT INTO cards (id, label, category, price, sort_order) VALUES
('kise', 'คิเสะ', 'standard', 15, 1),
('midorima', 'มิโดริมะ', 'standard', 15, 2),
('aomine', 'อาโอมิเนะ', 'standard', 15, 3),
('murasakibara', 'มุราซากิบาระ', 'standard', 15, 4),
('akashi', 'อาคาชิ', 'standard', 15, 5),
('kagamiSP', 'คากามิ SP', 'SP', 30, 6),
('kiseSP', 'คิเสะ SP', 'SP', 30, 7),
('midorimaSP', 'มิโดริมะ SP', 'SP', 30, 8),
('aomineSP', 'อาโอมิเนะ SP', 'SP', 30, 9),
('murasakibaraSP', 'มุราซากิบาระ SP', 'SP', 30, 10),
('akashiSP', 'อาคาชิ SP', 'SP', 30, 11),
('kagamiLastgame', 'คากามิ Last Game', 'LG', 30, 12),
('kiseLastgame', 'คิเสะ Last Game', 'LG', 30, 13),
('midorimakiseLastgame', 'มิโดริมะ Last Game', 'LG', 30, 14),
('aominekiseLastgame', 'อาโอมิเนะ Last Game', 'LG', 30, 15),
('murasakibarakiseLastgame', 'มุราซากิบาระ Last Game', 'LG', 30, 16),
('akashikiseLastgame', 'อาคาชิ Last Game', 'LG', 30, 17)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. ตารางลูกค้า (profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facebook_id TEXT,
  facebook_name TEXT NOT NULL,
  facebook_url TEXT,
  facebook_avatar TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ตารางการจอง (reservations)
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id TEXT REFERENCES cards(id),
  customer_name TEXT NOT NULL,
  facebook_url TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'queued',
  -- queued = รอคิว, paid = ชำระแล้ว, confirmed = แอดมินยืนยัน, delivered = ส่งแล้ว, cancelled = ยกเลิก
  week_start DATE NOT NULL,
  queue_number INTEGER,
  slip_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_card ON reservations (card_id);
CREATE INDEX IF NOT EXISTS idx_reservations_profile ON reservations (profile_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations (status);
CREATE INDEX IF NOT EXISTS idx_reservations_week ON reservations (week_start);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reservations_updated_at ON reservations;
CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_reservations_updated_at();

-- ============================================================
-- 4. ตารางสลิป (payment slips)
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id),
  slip_url TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  -- pending = รอตรวจ, approved = ผ่าน, rejected = ไม่ผ่าน
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. Disable RLS (ใช้ anon key ตรงๆ เหมือนโปรเจคเดิม)
-- ============================================================
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_slips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cards_read" ON cards FOR SELECT USING (true);
CREATE POLICY "cards_all" ON cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "profiles_all" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "reservations_all" ON reservations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "slips_all" ON payment_slips FOR ALL USING (true) WITH CHECK (true);
