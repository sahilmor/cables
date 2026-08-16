# Production Deployment & Setup Guide

This guide walks through deploying the **CableCraft Platform** to production with **Next.js 15 (Vercel)**, **NestJS (Render / Railway / AWS ECS)**, **Supabase PostgreSQL & Auth**, and **Razorpay Payments**.

---

## 1. Supabase Setup (Database & Authentication)

1. Create a new Supabase project at [https://supabase.com](https://supabase.com).
2. Go to **Project Settings** → **Database** and copy:
   * **Connection String (URI) - Transaction Mode (Port 6543)** → for `DATABASE_URL`
   * **Connection String (URI) - Direct (Port 5432)** → for `DIRECT_URL`
3. Go to **Project Settings** → **API** and copy:
   * **Project URL** → for `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL`
   * **anon public** key → for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * **service_role secret** key → for `SUPABASE_SERVICE_ROLE_KEY`
4. Run migrations and database seeds:
   ```bash
   npx prisma migrate deploy
   npm run prisma:seed
   ```

---

## 2. Razorpay Payment Gateway Setup

1. Create a Razorpay account at [https://razorpay.com](https://razorpay.com).
2. Go to **Settings** → **API Keys** and generate **Key Id** and **Key Secret**.
3. Go to **Settings** → **Webhooks**:
   * Add endpoint: `https://api.yourdomain.com/api/payments/webhook`
   * Select events: `order.paid`, `payment.captured`, `payment.failed`
   * Set a strong webhook secret and set it in `RAZORPAY_WEBHOOK_SECRET`.

---

## 3. NestJS Backend Deployment (Render / Railway / AWS)

### Environment Variables
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
PORT=4000
FRONTEND_URL=https://yourdomain.com
SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
RAZORPAY_KEY_ID=[YOUR_RAZORPAY_KEY_ID]
RAZORPAY_KEY_SECRET=[YOUR_RAZORPAY_KEY_SECRET]
RAZORPAY_WEBHOOK_SECRET=[YOUR_WEBHOOK_SECRET]
```

### Build & Start Commands
* **Build Command**: `npm install && npm run build --workspace=@cables/types && npx prisma generate && npm run build --workspace=@cables/api`
* **Start Command**: `node apps/api/dist/main`

---

## 4. Next.js Frontend Deployment (Vercel)

1. Import the repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `apps/web` or leave at root with workspace build.
3. Configure environment variables:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
   ```

---

## 5. Docker Deployment

To launch the full stack (API, Web, and PostgreSQL) locally or on a VPS:
```bash
docker compose up --build -d
```
* **Frontend**: `http://localhost:3000`
* **API Server**: `http://localhost:4000/api`
* **Swagger API Docs**: `http://localhost:4000/api/docs`
