# Kuroko Reserve

ระบบจองการ์ดตัวละครจากเกม Kuroko's Basketball Rivals — ระบบจัดคิว, ชำระเงิน PromptPay, และจัดส่งตามรอบ

## Features

### ลูกค้า
- เรียกดูการ์ดตัวละครแบบ Grid (Standard / SP / Last Game)
- จองล่วงหน้าได้สูงสุด 4 สัปดาห์, สูงสุด 50 ใบ/การ์ด/สัปดาห์
- จองหลายการ์ดพร้อมกันได้ (สูงสุด 3 การ์ด/ครั้ง)
- ชำระเงินผ่าน PromptPay QR + อัปโหลดสลิป
- ติดตามสถานะคิว (queued → paid → confirmed → delivered)
- ดูตารางรอบจัดส่งประจำวัน (5 รอบ: 10:30, 12:30, 15:30, 18:30, 21:30)
- สมัครสมาชิก / ล็อกอิน / จัดการโปรไฟล์

### แอดมิน
- จัดการจองทั้งหมด (กรองตามสถานะ, การ์ด, สัปดาห์)
- CRUD การ์ดสินค้าพร้อมอัปโหลดรูปภาพ
- จัดการรอบจัดส่ง
- ตั้งค่าระบบ (PromptPay QR, ชื่อผู้รับเงิน)
- สถิติภาพรวม (จำนวนจอง, รายได้, จัดส่งวันนี้)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Custom JWT (jose) + bcryptjs |
| Icons | Lucide React |
| Fonts | Chakra Petch + Russo One |

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (URL + Anon Key)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/songsoul14d-pixel/kuroko-reserve.git
cd kuroko-reserve

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials and secrets

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/public key |
| `JWT_SECRET` | Yes | JWT signing secret (generate a random 32+ char string) |
| `ADMIN_PIN` | Yes | PIN for admin panel access |

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Project Structure

```
kuroko-reserve/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage (card grid + hero)
│   ├── layout.tsx                # Root layout (auth, nav, fonts)
│   ├── globals.css               # Tailwind v4 theme
│   ├── login/                    # Login page
│   ├── signup/                   # Registration page
│   ├── queue/                    # Queue status + slip upload
│   ├── profile/                  # Profile management
│   ├── admin/                    # Admin panel (4 tabs)
│   │   ├── AdminClient.tsx       # Admin dashboard
│   │   └── components/           # Admin tab components
│   ├── components/               # Shared UI components
│   │   ├── reserve/              # Reservation flow components
│   │   ├── BottomNav.tsx         # Mobile navigation
│   │   └── DeliveryDashboard.tsx # Today's delivery schedule
│   └── api/                      # API routes
│       ├── auth/                 # Login, register, logout, profile
│       ├── reserve/              # Create reservation, upload slip
│       ├── admin/                # Admin-only endpoints
│       ├── cards/                # Card listing
│       └── delivery-schedule/    # Today's schedule
├── lib/                          # Core utilities
│   ├── auth.ts                   # JWT session management
│   ├── supabase.ts               # Supabase client
│   ├── types.ts                  # TypeScript types + constants
│   └── utils.ts                  # Helper functions
├── utils/supabase/               # Supabase client factories
├── sql/                          # Database migrations + seed data
├── __tests__/                    # Test files
└── .github/workflows/            # CI/CD (GitHub Actions)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Database

ใช้ Supabase (PostgreSQL) ประกอบด้วย:

- **cards** — แคตตาล็อกการ์ดตัวละคร
- **reservations** — ข้อมูลการจอง (สถานะ, คิว, สลิป, รอบจัดส่ง)
- **profiles** — ข้อมูลผู้ใช้ (username, password hash, โปรไฟล์)
- **system_settings** — ตั้งค่าระบบแบบ key-value

ดูรายละเอียดเพิ่มเติมได้ที่ [DATABASE_GUIDE.md](./DATABASE_GUIDE.md)

## Deployment

โปรเจคนี้ออกแบบสำหรับ deploy บน Vercel หรือ Node.js server ที่รองรับ Next.js:

1. ตั้งค่า environment variables ทั้งหมดใน hosting platform
2. ตรวจสอบว่า `JWT_SECRET` และ `ADMIN_PIN` ถูกตั้งเป็นค่าที่ปลอดภัย
3. Deploy ผ่าน `git push` (Vercel auto-deploy) หรือ `npm run build && npm run start`

## License

Private project — All rights reserved.
