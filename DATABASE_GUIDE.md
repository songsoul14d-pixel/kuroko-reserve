# 🗄️ Kuroko Reserve - Database Guide

คู่มืออธิบายโครงสร้างฐานข้อมูลและระบบการทำงาน สำหรับนำไปใช้เป็นต้นแบบในการสร้างระบบใหม่ที่มีรูปแบบการทำงานเดิม

---

## 🏗️ 1. โครงสร้างตาราง (Tables Schema)

### 1.1 ตาราง `cards` (ข้อมูลการ์ด/ตัวละคร)
เก็บข้อมูลตัวละครที่เปิดให้จอง
- `id`: (text, PK) - ไอดีตัวละคร (เช่น aomine_sp)
- `label`: (text) - ชื่อที่แสดงผล (เช่น อาโอมิเนะ Zone)
- `category`: (text) - หมวดหมู่ (standard, SP, LG)
- `price`: (integer) - ราคาการ์ด
- `image_url`: (text) - ลิงก์รูปภาพตัวละคร
- `sort_order`: (integer) - ลำดับการแสดงผลบนหน้าเว็บ
- `active`: (boolean) - สถานะเปิด/ปิดการจองของการ์ดใบนี้

### 1.2 ตาราง `reservations` (ข้อมูลการจอง)
เก็บข้อมูลการจองคิวของลูกค้าทั้งหมด
- `id`: (uuid, PK) - ไอดีการจอง
- `user_id`: (uuid, FK) - เชื่อมกับ auth.users ของ Supabase
- `card_id`: (text, FK) - เชื่อมกับ cards.id
- `status`: (text) - สถานะการจอง (`pending`, `paid`, `confirmed`, `cancelled`)
- `slip_url`: (text) - ลิงก์รูปภาพสลิปที่ลูกค้าอัปโหลด
- `queue_number`: (integer) - เลขคิวที่ระบบรันให้
- `delivery_date`: (date) - วันที่นัดรับ/ส่งของ
- `delivery_round`: (text) - รอบเวลาที่นัด (เช่น 10:30, 14:00)
- `created_at`: (timestamp) - วันเวลาที่กดจอง
- `updated_at`: (timestamp) - วันเวลาที่มีการอัปเดตสถานะล่าสุด

### 1.3 ตาราง `system_settings` (การตั้งค่าระบบ)
เก็บค่าคอนฟิกต่างๆ ที่แอดมินเปลี่ยนได้เอง
- `key`: (text, PK) - ชื่อค่าตั้งค่า (เช่น `promptpay_qr_url`)
- `value`: (text) - ค่าข้อมูล (เช่น ลิงก์รูป QR Code)
- `description`: (text) - คำอธิบาย

---

## 🔄 2. ขั้นตอนการทำงานของข้อมูล (Data Flow)

1.  **การจอง (Reservation):** เมื่อลูกค้ากดจอง ระบบจะสร้าง Row ใหม่ใน `reservations` โดยมีสถานะเริ่มต้นเป็น `pending`
2.  **การอัปโหลดสลิป:** เมื่อลูกค้าโอนเงินและอัปโหลดรูป ระบบจะอัปเดต `slip_url` และเปลี่ยนสถานะเป็น `paid` (รอตรวจสอบ)
3.  **การยืนยันโดยแอดมิน:** แอดมินตรวจสอบสลิปในหลังบ้าน หากถูกต้องจะเปลี่ยนสถานะเป็น `confirmed`
4.  **การดึงข้อมูล QR Code:** หน้าบ้านจะดึงค่าจาก `system_settings` ที่คีย์ `promptpay_qr_url` มาแสดงผล เพื่อให้แอดมินเปลี่ยนรูป QR ได้โดยไม่ต้องแก้โค้ด

---

## 🛡️ 3. การรักษาความปลอดภัย (RLS Policies)

ระบบนี้ใช้ **Row Level Security (RLS)** ของ Supabase เพื่อความปลอดภัย:
- **Users:** ดูได้เฉพาะการจองของตัวเอง (`auth.uid() = user_id`)
- **Admins:** สามารถเข้าถึงและแก้ไขได้ทุกตาราง (จัดการผ่าน Admin API โดยใช้ Service Role หรือ Admin Check)
- **Public:** สามารถอ่านตาราง `cards` และ `system_settings` ได้เพื่อแสดงผลหน้าเว็บ

---

## 📜 4. SQL สำหรับเริ่มต้นระบบ (Initial SQL)

คุณสามารถนำ SQL นี้ไปรันใน Supabase SQL Editor เพื่อสร้างตารางพื้นฐานได้ทันที:

```sql
-- สร้างตารางตัวละคร
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  category TEXT DEFAULT 'standard',
  price INTEGER DEFAULT 15,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- สร้างตารางการจอง
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  card_id TEXT REFERENCES cards(id),
  status TEXT DEFAULT 'pending',
  slip_url TEXT,
  queue_number SERIAL,
  delivery_date DATE,
  delivery_round VARCHAR(5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- สร้างตารางตั้งค่าระบบ
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📁 4. การตั้งค่า Storage Bucket

ใน Supabase Storage คุณต้องสร้าง Bucket 2 อัน ดังนี้:

### 4.1 Bucket: `slips`
ใช้สำหรับเก็บรูปภาพสลิปการโอนเงินของลูกค้า
- **Public:** เปิด (เพื่อให้แอดมินและระบบดึงรูปไปแสดงผลได้)
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- **File size limit:** 5 MB

### 4.2 Bucket: `cards`
ใช้สำหรับเก็บรูปภาพตัวละครหรือสินค้า
- **Public:** เปิด (เพื่อให้ลูกค้าทุกคนเห็นรูปการ์ดบนหน้าเว็บ)
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- **File size limit:** 5 MB

---

## 🛡️ 5. การรักษาความปลอดภัย (RLS Policies)

ระบบนี้ใช้ **Row Level Security (RLS)** ของ Supabase เพื่อความปลอดภัย:
- **Users:** ดูได้เฉพาะการจองของตัวเอง (`auth.uid() = user_id`)
- **Admins:** สามารถเข้าถึงและแก้ไขได้ทุกตาราง (จัดการผ่าน Admin API โดยใช้ Service Role หรือ Admin Check)
- **Public:** สามารถอ่านตาราง `cards` และ `system_settings` ได้เพื่อแสดงผลหน้าเว็บ

---

## 💡 คำแนะนำสำหรับการสร้างโปรเจกต์ใหม่
- หากต้องการเปลี่ยนจากขายการ์ดเป็นอย่างอื่น แค่เปลี่ยนข้อมูลในตาราง `cards` เป็นสินค้าชนิดอื่น
- ระบบคิว (`queue_number`) ใช้ประเภท `SERIAL` เพื่อให้เลขรันอัตโนมัติจาก 1 ไปเรื่อยๆ
- ตรวจสอบว่า **Bucket** ทั้งหมดต้องตั้งค่าเป็น **Public** เพื่อให้รูปแสดงผลได้ทั่วถึง
