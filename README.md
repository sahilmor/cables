# CableCraft — Production-Ready Custom Cable E-Commerce Platform

A precision Custom Cable E-Commerce & SaaS platform with an interactive **Pin-to-Pin Visual Wiring Configurator** powered by **React Flow**, **Next.js (App Router)**, **NestJS**, **Supabase PostgreSQL & Auth**, **Prisma ORM**, and **Razorpay Payments**.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui tokens, React Flow (`@xyflow/react`), React Hook Form, Zod, Lucide Icons.
* **Backend**: NestJS REST API, TypeScript, class-validator, class-transformer, Swagger OpenAPI, PDFKit.
* **Database & ORM**: Supabase PostgreSQL with Prisma ORM.
* **Authentication**: Supabase Auth with server-side JWT verification in NestJS and role-based access (`CUSTOMER`, `ADMIN`, `MANUFACTURING`).
* **Payments**: Razorpay gateway with server-side order generation and HMAC SHA256 webhook signature verification.
* **Manufacturing Engine**: Automated pinout continuity verification, frozen JSON snapshots, and downloadable PDF fabrication specifications.

---

## 📂 Monorepo Architecture

```
custom-cable-platform/
│
├── apps/
│   ├── web/                     # Next.js 15 App Router Frontend
│   │   ├── app/
│   │   │   ├── (auth)/          # /login, /signup, /forgot-password, /reset-password
│   │   │   ├── custom-cable/    # 5-Step Visual Wiring Configurator (/custom-cable, /custom-cable/[id])
│   │   │   ├── products/        # Catalog (/products, /products/[slug])
│   │   │   ├── cart/            # Cart with custom wiring preview & edit
│   │   │   ├── checkout/        # Address, GST, Razorpay modal
│   │   │   ├── orders/          # Order history & progression (/orders, /orders/[id])
│   │   │   ├── saved-cables/    # Custom design library
│   │   │   ├── account/         # Profile & demo role switcher
│   │   │   └── admin/           # Admin Dashboard & Shop Floor Queue (/admin/manufacturing)
│   │   ├── components/
│   │   │   ├── configurator/    # StepIndicator, ConnectorSelector, CableSpecsForm, WiringCanvas, ReviewStep
│   │   │   ├── layout/          # Navbar, Footer
│   │   │   └── ui/              # shadcn Button, Card, Badge, Input, etc.
│   │   └── lib/
│   │       ├── api.ts           # Type-safe API client for NestJS
│   │       ├── auth-context.tsx # Supabase auth & role simulation
│   │       └── utils.ts
│   │
│   └── api/                     # NestJS Backend API
│       └── src/
│           ├── auth/            # SupabaseAuthGuard, user sync
│           ├── connectors/      # Dynamic connectors & pinouts
│           ├── compatibility/   # Connector compatibility matrix
│           ├── wiring/          # WiringService (authoritative validation)
│           ├── pricing/         # PricingService (server-side price & GST)
│           ├── custom-cables/   # Custom cable lifecycle & snapshots
│           ├── products/        # Standard catalog
│           ├── categories/      # Categories
│           ├── cable-types/     # Bulk conductor configs
│           ├── cart/            # User & guest carts
│           ├── orders/          # Orders & immutable snapshot freezing
│           ├── payments/        # Razorpay SDK & webhook verification
│           └── manufacturing/   # Shop floor queue & PDF spec generation
│
├── packages/
│   └── types/                   # Shared TypeScript interfaces & DTOs
│
├── prisma/
│   ├── schema.prisma            # Relational database schema
│   └── seed.ts                  # Comprehensive real-world seed data
│
├── .env.example
└── package.json                 # npm workspaces root
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file (or copy `.env.example`):
```bash
cp .env.example .env
```

### 3. Generate Prisma Client & Seed Database
```bash
npm run prisma:generate
npm run prisma:seed
```

### 4. Run Development Servers
* Run all workspaces concurrently:
  ```bash
  npm run dev
  ```
* Or run individual apps:
  ```bash
  # Terminal 1: NestJS Backend (Port 4000)
  npm run dev:api

  # Terminal 2: Next.js Frontend (Port 3000)
  npm run dev:web
  ```

---

## 🚀 Key Features

### 1. 5-Step Visual Cable Configurator (`/custom-cable`)
1. **End 1**: Select source connector (HDMI, RJ45, USB-A, USB-C, XLR, 3.5mm, DC Barrel, etc.) loaded dynamically from NestJS.
2. **End 2**: Select target connector with real-time compatibility matrix check.
3. **Cable Specs**: Configure length (0.5m – 100m), bulk conductor type, shielding (UTP, F/UTP, S/FTP), and jacket material (PVC, PUR, Silicone).
4. **Interactive Wiring Canvas**:
   * **React Flow** powered canvas with custom `ConnectorNode` and `WireEdge` components.
   * **Two connection modes**: Drag from pin handle to pin handle, or click source pin then target pin.
   * Automated continuity validation against required pins, short-circuits (e.g. Power to Ground), and duplicate terminations.
   * Presets: Auto-Wire 1:1, Clear All.
5. **Review & Authorize**: Authoritative server-side price breakdown (Base + Length + Per-Pin assembly + 18% GST + Shipping) and direct Add-to-Cart or Save-to-Library.

### 2. Shop Floor Manufacturing Dashboard (`/admin/manufacturing`)
* Real-time fabrication queue for technicians.
* Immutable custom cable snapshots (cut lengths with strip allowances, exact pinout soldering table).
* Advance tickets through stages: `MANUFACTURING` → `QUALITY_CHECK` → `READY_TO_SHIP` → `SHIPPED`.
* **Download / Stream PDF Specification**: Generates an engineering document via PDFKit.

### 3. Standard E-Commerce & Checkout
* Browse standard catalog (`/products`, `/products/[slug]`).
* Cart (`/cart`) supporting both standard products and custom cables with attached wiring previews and edit links.
* Checkout (`/checkout`) with Razorpay payment processing and HMAC signature verification.
* Order tracking (`/orders/[id]`) with live status progression.

---

## 🧪 Testing

Run backend unit tests for wiring rules and pricing engine:
```bash
npm run test --workspace=@cables/api
```
