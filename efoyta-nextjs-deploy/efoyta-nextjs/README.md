# efoyta.com — Hotel SaaS Platform

A complete multi-tenant hotel SaaS platform built with **Next.js 14**, **TypeScript**, **Prisma ORM**, and **Supabase PostgreSQL**. Ready to deploy on Vercel.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | JWT (jose) + HttpOnly cookies |
| Styling | CSS Variables (extracted from original design) |
| Deployment | Vercel |

---

## 🚀 Deploy to Vercel (Step by Step)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial efoyta commit"
git remote add origin https://github.com/YOUR_USERNAME/efoyta.git
git push -u origin main
```

### 2. Import to Vercel
- Go to https://vercel.com/new
- Import your GitHub repo
- Set Framework: **Next.js**

### 3. Add Environment Variables in Vercel Dashboard

Go to **Project → Settings → Environment Variables** and add:

```
DATABASE_URL=postgresql://postgres.hkxpgsuirbwzaxqniblv:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres.hkxpgsuirbwzaxqniblv:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

NEXT_PUBLIC_SUPABASE_URL=https://hkxpgsuirbwzaxqniblv.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1IlZVnitevqkpgONQbFCqw_lGjB-i8D

JWT_SECRET=efoyta-supabase-jwt-secret-2025-xK9mNpQrStUvWxYz

NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

> **Note:** Get your actual database password from Supabase Dashboard → Settings → Database → Connection string

### 4. Get Supabase Password
1. Go to https://supabase.com/dashboard
2. Select your project (`hkxpgsuirbwzaxqniblv`)
3. Navigate to **Settings → Database**
4. Copy the **Connection string** (it includes your password)
5. Replace `[YOUR-PASSWORD]` in the env vars above

### 5. Deploy
Click **Deploy** in Vercel. The `vercel.json` build command will:
1. Run `prisma generate`
2. Run `prisma db push` (creates all tables)
3. Build Next.js

### 6. Seed Data (one-time)
After first deployment, run seed locally:
```bash
npm install
npx ts-node prisma/seed.ts
```

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@efoyta.com | admin123 |
| Hotel Admin | hotel@efoyta.com | hotel123 |

---

## 📁 Project Structure

```
efoyta/
├── prisma/
│   ├── schema.prisma          # Database schema (5 models)
│   └── seed.ts                # Seed data (8 hotels, rooms, menu)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Auth page
│   │   ├── hotels/            # Explore all hotels
│   │   ├── hotel/[slug]/      # Individual hotel public site
│   │   ├── admin/             # Hotel admin dashboard
│   │   ├── superadmin/        # Platform super admin
│   │   └── api/
│   │       ├── auth/          # login, logout, me
│   │       ├── hotels/        # public hotel list + cities
│   │       ├── hotel/[slug]/  # hotel info, rooms, menu, booking
│   │       ├── admin/         # dashboard, rooms, bookings, menu, hotel
│   │       └── superadmin/    # stats, hotels, subscription
│   ├── lib/
│   │   ├── prisma.ts          # Prisma singleton
│   │   ├── auth.ts            # JWT sign/verify, session helpers
│   │   └── utils.ts           # Helper functions
│   ├── components/
│   │   └── shared/Navbar.tsx  # Global navigation
│   └── types/index.ts         # Shared TypeScript types
├── .env.local                 # Local env (do not commit)
├── .env.example               # Template for env vars
├── vercel.json                # Vercel deployment config
└── next.config.js
```

---

## 🔌 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotels` | List hotels (filter by `?city=` or `?q=`) |
| GET | `/api/hotels/cities` | All unique cities |
| GET | `/api/hotel/[slug]` | Hotel details |
| GET | `/api/hotel/[slug]/rooms` | Hotel rooms |
| GET | `/api/hotel/[slug]/menu` | Hotel menu |
| POST | `/api/hotel/[slug]/booking` | Create booking |

### Hotel Admin (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats + recent bookings |
| GET/POST | `/api/admin/rooms` | List / add rooms |
| PUT/DELETE | `/api/admin/rooms/[id]` | Update / delete room |
| GET | `/api/admin/bookings` | List bookings |
| PATCH | `/api/admin/bookings/[id]` | Confirm / reject booking |
| GET/POST | `/api/admin/menu` | List / add menu items |
| DELETE | `/api/admin/menu/[id]` | Delete menu item |
| GET/PUT | `/api/admin/hotel` | Get / update hotel info |

### Super Admin (JWT required, super_admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superadmin/stats` | Platform-wide stats |
| GET/POST | `/api/superadmin/hotels` | List all / create hotel |
| PATCH | `/api/superadmin/hotels/[id]/subscription` | Update subscription |

---

## 🔒 Security

- **JWT** stored in HttpOnly cookies (not accessible to JS)
- **Tenant isolation** enforced in every API route via `hotelId` from JWT
- **Role-based access**: `super_admin`, `hotel_admin`, `staff`
- **Subscription gate**: expired hotels blocked from admin features
- **Zod validation** on all POST/PUT endpoints
- **bcrypt** password hashing (12 rounds)

---

## 🏨 Features

- ✅ Multi-tenant architecture (each hotel isolated)
- ✅ Auto-generated hotel website (Home, About, Rooms, Menu, Contact)
- ✅ Online booking system with confirmation flow
- ✅ Digital menu management (real-time updates)
- ✅ Hotel admin dashboard
- ✅ Super admin platform overview
- ✅ Subscription management (active/trial/expired)
- ✅ City-based hotel discovery
- ✅ SEO-optimised pages with proper metadata
- ✅ Mobile responsive
- ✅ TypeScript throughout
- ✅ Vercel + Supabase ready
