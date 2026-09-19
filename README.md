# Serverless Nutrition & Wellness Platform
## Vercel + Next.js + Supabase Architecture (Master Prompt 1 of 3)

A production-ready serverless nutrition and wellness management platform for **Sri Nutrition & Wellness Centre**, founded by **Sangem Srivijayalaxmi**.

* **Business Owner**: Sangem Srivijayalaxmi
* **Business Mobile**: +91 7993367929
* **Business UPI**: `7660990052-2@ybl`
* **Centre Location**: Warangal, Telangana, India (17.9784° N, 79.5941° E)

---

## 1. Architecture Overview

The entire platform follows a **100% Serverless Architecture** deployed on **Vercel** with managed backend infrastructure in **Supabase**:

```
[ Browser / Mobile Client ]
            │
            ▼
[ Vercel Edge / Serverless Functions / Server Actions ]
            │
            ├── Supabase Auth (User sessions, credentials, tokens)
            ├── Supabase PostgreSQL (15 tables with Row Level Security)
            ├── Supabase Storage (Private customer biometrics, public product images)
            ├── Razorpay (Server-verified payments & webhooks)
            ├── Google Maps Platform (Domain-restricted client embed)
            └── Gemini API (Serverless non-diagnostic metabolic summaries)
```

**No long-running backend server, VPS, Docker container, or self-hosted database is permitted.**

---

## 2. Technology Stack

* **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, Recharts
* **Serverless Backend**: Next.js Server Actions, Next.js Route Handlers, Vercel Serverless Functions
* **Database**: Supabase PostgreSQL with strict Row Level Security (RLS)
* **Authentication**: Supabase Auth (Email/Password, session persistence)
* **Storage**: Supabase Storage (3 dedicated buckets: `customer-profiles`, `product-images`, `reports`)
* **Validation**: Zod (Enforcing strict physiological boundaries)
* **Payments**: Razorpay & Unified Payments Interface (UPI)
* **Maps**: Google Maps Platform JavaScript API
* **AI Assistance**: Google Gemini API via serverless route handler (strictly non-diagnostic)
* **Deployment**: Vercel

---

## 3. Repository Structure

```
├── .env.example                       # Declared environment variables template
├── .gitignore                         # Securely ignores .env.local, .next, node_modules
├── package.json                       # Dependencies & build scripts
├── README.md                          # Full architectural documentation
│
├── supabase/
│   └── migrations/
│       └── 00001_initial_schema.sql  # 15 tables, indexes, RLS policies, storage rules
│
├── types/
│   ├── database.ts                    # Generated strict TypeScript schema types
│   └── index.ts                       # Domain types & session interfaces
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Browser Supabase client (respects RLS)
│   │   ├── server.ts                  # Server-side Supabase client for Server Actions
│   │   └── admin.ts                   # Admin client with SUPABASE_SERVICE_ROLE_KEY (server-only)
│   ├── auth/
│   │   └── session.ts                 # Server session authentication & admin authorization guards
│   ├── validations/
│   │   └── index.ts                   # Zod schemas (measurement, customer, order, etc.)
│   ├── calculations/
│   │   └── bmi.ts                     # Reusable server-side BMI calculation engine
│   └── actions/
│       ├── types.ts                   # Standard ActionResult<T> interface
│       ├── measurements.ts            # Server action for recording body biometrics
│       └── customers.ts               # Server action for customer profile management
│
├── app/
│   └── api/
│       ├── payment/
│       │   ├── create-order/route.ts  # Initiates Razorpay / UPI order server-side
│       │   ├── verify/route.ts        # Verifies cryptographic payment signature
│       │   └── webhook/route.ts       # Idempotent webhook handler
│       └── ai/
│           └── customer-summary/route.ts # Gemini AI biometric progression summarizer
│
└── src/
    ├── components/
    │   ├── ui/                        # Reusable primitives (Button, Card, Input, Badge)
    │   ├── Navbar.tsx                 # Global responsive navigation & role switcher
    │   ├── PublicViews.tsx            # Home, About, Services, Products, Centre, Contact, Auth
    │   ├── AdminShell.tsx             # Sangem Srivijayalaxmi Admin portal & metrics
    │   ├── CustomerShell.tsx          # Member biometrics dashboard & progress chart
    │   └── SchemaInspector.tsx        # In-app interactive architecture & migration viewer
    ├── App.tsx                        # Main client application shell
    └── main.tsx                       # Entry point
```

---

## 4. Database Schema (15 Tables)

1. **`profiles`**: Linked to `auth.users`, manages roles (`ADMIN`, `CUSTOMER`), names, and mobile numbers.
2. **`business_settings`**: Stores owner details (*Sangem Srivijayalaxmi*), mobile (*7993367929*), and UPI (*7660990052-2@ybl*).
3. **`customer_profiles`**: Detailed member demographics, dietary preferences, and emergency contacts.
4. **`customer_measurements`**: 8-point biometric measurements (height, weight, age, calculated BMI, body fat %, visceral fat, muscle %, subcutaneous fat, BMR calories).
5. **`health_notes`**: Customer-reported remarks or consultation notes (strictly non-diagnostic).
6. **`camps`**: Community health and screening camps with dates, times, and venue locations.
7. **`camp_customers`**: Camp registrations and digital token numbers.
8. **`product_categories`**: Supplement and nutrition product taxonomy.
9. **`products`**: Clean nutrition inventory, pricing, SKUs, and stock quantities.
10. **`addresses`**: Customer shipping and residential addresses.
11. **`orders`**: Order tracking, subtotal, shipping fee, and delivery statuses.
12. **`order_items`**: Line items linked to products and orders.
13. **`payments`**: Payment transaction logs, UPI references, and Razorpay IDs.
14. **`reports`**: Generated biometric PDF progress summaries.
15. **`audit_logs`**: Mutation logs tracking administrative actions without storing secrets.

---

## 5. Security & Authorization Guarantees

* **Row Level Security (RLS)**: Enforced on all 15 tables. Customers can only read and mutate their own records.
* **Derived Identities**: Server actions and route handlers derive the user identity from `auth.uid()` rather than trusting client-supplied parameters.
* **Server-Only Secrets**: `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `GEMINI_API_KEY` are never bundled into client JavaScript.
* **Safe Error Handling**: Server actions return standard `{ success: boolean, data?: T, error?: string }` without leaking SQL stack traces.
* **No Medical Diagnosis**: AI and validation layers are constrained to wellness metric summarization without issuing disease diagnoses.

---

## 6. Local Setup Instructions

1. **Prerequisites**:
   * Node.js 18+ LTS
   * Free Supabase account ([supabase.com](https://supabase.com))

2. **Clone & Install**:
   ```bash
   git clone <repo-url>
   cd nutrition-platform
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

4. **Run Database Migrations**:
   In the Supabase Dashboard, open the **SQL Editor**, paste the contents of `supabase/migrations/00001_initial_schema.sql`, and execute it.

5. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to interact with the application.

---

## 7. Vercel Deployment Instructions

1. Push your repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set the **Framework Preset** to Next.js (or Vite for the client build).
5. In **Environment Variables**, add:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   * `RAZORPAY_KEY_ID`
   * `RAZORPAY_KEY_SECRET`
   * `RAZORPAY_WEBHOOK_SECRET`
   * `GEMINI_API_KEY`
   * `APP_URL`
6. Click **Deploy**. Vercel will automatically provision your serverless functions and CDN edge assets.

---

## 8. Definition of Done Status

* [x] Serverless architecture established
* [x] Supabase connection and client separation (`client.ts`, `server.ts`, `admin.ts`)
* [x] Authentication & User Roles (`ADMIN`, `CUSTOMER`)
* [x] 15 Database tables with Foreign Keys and Indexes
* [x] Granular Row Level Security (RLS) policies
* [x] Storage buckets configured (`customer-profiles`, `product-images`, `reports`)
* [x] Admin UI Foundation Shell
* [x] Customer UI Foundation Shell
* [x] Public Website Foundation (Home, About, Services, Products, Centre, Contact, Login, Register)
* [x] Server Actions with Zod validation
* [x] Server-side BMI calculation formula
* [x] Route Handlers for Payments, Webhooks, and AI
* [x] Security checklist verified (Section 41)
* [x] Vercel deployment readiness verified

**MASTER PROMPT 1 COMPLETE — READY FOR MASTER PROMPT 2**
