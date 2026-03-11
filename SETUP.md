# Book Platform Setup Guide

## Talab qilinadigan dasturlar:
- Node.js (v18+)
- PostgreSQL (mahalliy yoki masofadan)
- npm yoki pnpm yoki yarn

## 1. Backend ni sozlash
Backend Node.js, Express va Prisma orqali qurilgan. Baza bilan ulanish qismi `backend` papkasida joylashgan.

1. **Backend papkasiga kiramiz:**
   ```bash
   cd backend
   ```
2. **Kutubxonalarni o'rnatamiz:**
   ```bash
   npm install
   ```
3. **Mavjud bo'lgan `.env` faylini sozlang:**
   `backend/` papkasida `.env` faylini yarating (yoki oching) va quyidagi ma'lumotlarni kiriting:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/bookplatform"
   JWT_SECRET="juda_maxfiy_kalit"
   ```
4. **Ma'lumotlar bazasini yangilang (Schema push):**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. **Dastlabki (Seed) ma'lumotlarni yozing:**
   ```bash
   npx prisma db seed
   ```
   *Bu orqali sizga `admin@book.com` va oddiy test foydalanuvchilar (test userlar) hamda ba'zi kitoblar yaratib beriladi.*
6. **Backend serverni ishga tushiring:**
   ```bash
   npm run dev
   ```

---

## 2. Frontend ni sozlash
Frontend Next.js, Tailwind CSS va qo'shimcha premium UI kutubxonalari orqali ishlangan.

1. **Frontend papkasiga kiramiz:**
   ```bash
   cd ../frontend
   ```
2. **Kutubxonalarni o'rnatamiz:**
   ```bash
   npm install
   ```
3. **Mavjud bo'lgan `.env` faylini sozlang (agar kerak bo'lsa):**
   `frontend/` papkasida fayl oching:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   NEXTAUTH_SECRET="frotend_juda_maxfiy_kalit"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. **Frontend loyihasini ishga tushiring:**
   ```bash
   npm run dev
   ```
5. Platforma brauzerda **http://localhost:3000** manzilida ochiladi.

## Default Test foydalanuvchilar:
- **Admin:** Email: `admin@books.com`, Password: `password123`
- **User:** Email: `user@books.com`, Password: `password123`

## Loyiha Strukturasi va Gamification:
- Audio/PDF/Store sahifalari mavjud.
- `/api/quiz` hamda `/api/store` controllerlari kiritildi (Points, Score tizimi uchun).
- User Profile sahifasida to'plagan ballar (gamification) aks etadi.

---

## 3. Vercel'da Deploy qilish (Production)
Dastur **Vercel** tarmog'iga moslashtirilgan. 

### Backend (Express API)
1. Vercel hisobingizga kiring va Yangi Loyiha yaratib `backend` papkasini ko'rsating.
2. Vercel **Build Command** sozlamasini o'zgartirmang (o'zi avtomat `tsc` va `prisma generate` postinstall ishlatadi).
3. **Environment Variables**:
   ```env
   DATABASE_URL="postgresql://... (Supabase yoki Neon DB url)"
   JWT_SECRET="..."
   ```
4. Deploy tugmasini bosing! Vercel `vercel.json` faylini o'qiydi va API mantiqlarini **Serverless function** sifatida ishga tushiradi. (Endpoint manzili: `https://[your-app]/api/...`)

### Frontend (Next.js)
1. Yana birinchi Vercel proyektini yaratib `frontend` papkasini tanlang.
2. Next.js nol sozlama (Zero-config) orqali ishlaydi. Vercel o'zi hamma narsani aniqlaydi.
3. **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL="https://[sizning-backend-vercel-app-domen].vercel.app"
   NEXTAUTH_SECRET="..."
   NEXTAUTH_URL="https://[domen-nomi].vercel.app"
   ```
4. Deploy bosing!

Endi butun loyihangiz Vercel ustida bemalol va ishonchli ishlay oladi.
