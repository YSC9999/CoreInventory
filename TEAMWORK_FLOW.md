# CoreInventory — Technical Spec & Hackathon Playbook

> 8-hour virtual hackathon · Next.js 14 · PostgreSQL · Prisma · shadcn/ui

---

## What are we building?

An inventory management system that actually makes sense to use. The kind of thing that replaces the "inventory.xlsx (final) (2) (USE THIS ONE).xlsx" that someone at a warehouse is definitely still maintaining.

Users should be able to receive goods, ship them out, move stock between locations, and see a clean history of everything that happened. That's the core loop. Everything else is secondary.

---

## Table of Contents

1. [Goals](#1-goals)
2. [Who's using this](#2-whos-using-this)
3. [Features](#3-features)
4. [Components to build](#4-components-to-build)
5. [Tech stack](#5-tech-stack)
6. [Folder structure](#6-folder-structure)
7. [Database schema](#7-database-schema)
8. [Server actions reference](#8-server-actions-reference)
9. [Auth flow](#9-auth-flow)
10. [State management](#10-state-management)
11. [Who does what](#11-who-does-what)
12. [Hour-by-hour plan](#12-hour-by-hour-plan)
13. [Git rules](#13-git-rules)
14. [Shortcuts that are fine to take](#14-shortcuts-that-are-fine-to-take)
15. [What to cut if we're running late](#15-what-to-cut-if-were-running-late)
16. [Demo prep](#16-demo-prep)

---

## 1. Goals

The non-negotiables — if any of these aren't working at hour 8, we failed:

- Someone can log in
- The dashboard shows real numbers from the DB
- You can create a product
- You can receive goods and the stock goes up
- You can ship goods and the stock goes down
- You can see a history of every movement

Nice-to-haves that we'll attempt after the core is stable:

- Internal transfers between locations
- Stock adjustments for physical count mismatches
- Low stock alerts on the dashboard
- OTP password reset (or we just `console.log` the code and call it done)

---

## 2. Who's using this

**Inventory Manager** — the main user. Creates receipts when shipments arrive, raises delivery orders when stock needs to go out, checks the dashboard every morning to see what needs attention.

**Warehouse Staff** — handles the physical side. Picks items, confirms transfers, does stock counts. Doesn't need to see everything, just their queue of things to do.

**Admin** — sets up warehouses, locations, manages users. Basically the person who configured the system once and rarely logs in again.

---

## 3. Features

### Authentication

Standard stuff. Email + password signup and login. JWT sessions via NextAuth. The whole dashboard is behind a middleware guard — if you're not logged in, you're going to `/login`.

Password reset: the spec says OTP-based. In practice for the hackathon, we'll generate the code and `console.log` it. The flow is there, just not wired to an email provider. That's an honest explanation in the demo.

### Dashboard

First page you see after logging in. Shows:

- Total products in stock
- How many items are low stock or out (threshold: qty < 10)
- Pending receipts waiting for action
- Pending deliveries waiting to go out
- Internal transfers scheduled

Plus two quick-view tables: last 5 receipts and last 5 deliveries. Clicking them takes you to the full list.

Filters at the top let you slice by document type (Receipt / Delivery / Transfer / Adjustment), by status (Draft, Waiting, Ready, Done, Canceled), by warehouse, and by category.

### Products

A table of everything in your inventory. Columns: name, SKU, category, current stock, unit, location.

Creating a product: name (required), SKU (can be auto-generated), category, unit of measure, initial stock, and which location it lives in.

Actions per row: Edit, Archive (soft delete). Clicking into a product shows its full transaction history.

### Receipts (incoming goods)

When a shipment arrives from a vendor, someone creates a receipt. The flow:

```
Draft → Waiting → Ready → Done
                       ↘ Canceled
```

They fill in the supplier name, scheduled date, and add line items (product + expected quantity). Once the goods are physically there, they validate it — which bumps each product's stock by the received quantity and logs the transactions. Reference format: `REC/2025/00001`.

### Delivery Orders (outgoing goods)

Opposite of receipts. Someone raises a delivery when stock needs to leave.

```
Draft → Waiting → Ready → Done
                       ↘ Canceled
```

Add a destination, add the products and quantities. Pick → Pack → Validate. On validation, stock goes down and transactions are logged. Reference format: `DEL/2025/00001`.

### Move History

Read-only ledger. Every single stock movement ever. Who did it, when, what moved, from where to where, how much. This is the audit trail.

Filters: by product, date range, operation type, location, user. Paginated.

### Locations & Warehouses

A warehouse (e.g. "Main Warehouse") contains one or more locations (e.g. "Shelf B2", "Production Floor"). Products live in locations.

The Settings page handles creating and editing both. It's not glamorous but it's important for multi-location support.

### Internal Transfers *(if time allows)*

Move stock from one location to another without it leaving the company. Total quantity unchanged, just the `locationId` on the item updates. Still logs a Transaction so the ledger stays accurate.

### Stock Adjustments *(if time allows)*

Physical count didn't match the system? Create an adjustment. Select product, enter what you actually counted, system calculates the diff and logs it as an ADJUSTMENT transaction.

---

## 4. Components to build

Organised by where they live. **Don't build what shadcn gives you for free** — Button, Input, Select, Dialog, Table, Badge, Toast, Card, Skeleton, DropdownMenu are all `npx shadcn-ui add <n>` commands.

### Layout

**`AppShell`** (`components/layout/AppShell.tsx`)  
The outer wrapper for every dashboard page. Renders the sidebar on the left, topbar on top, and slots in the page content. This is the `(dashboard)/layout.tsx`. RSC is fine here since there's no interactivity at this level.

**`Sidebar`** (`components/layout/Sidebar.tsx`)  
Left-side nav. Links: Dashboard, Receipts, Deliveries, Move History, Products, Settings. Highlights the active route with `usePathname`. Collapses to icon-only on smaller screens. Client component.

**`TopNavBar`** (`components/layout/TopNavBar.tsx`)  
Page title + breadcrumb, global search input, notification bell with low-stock count badge, and the user avatar that opens the profile dropdown. Client component.

**`ProfileDropdown`** (`components/layout/ProfileDropdown.tsx`)  
Tiny dropdown from the user avatar — "My Profile" and "Logout". Logout calls `signOut()` from NextAuth. That's it.

---

### Dashboard

**`KpiCard`** (`components/features/dashboard/KpiCard.tsx`)  
Shows one metric. Icon, label, number, optional trend arrow, optional link to drill down. Server component — data is passed in as props from the page.

Props: `{ icon, label, value, trend?, href? }`

**`RecentOperationsTable`** (`components/features/dashboard/RecentOperationsTable.tsx`)  
Compact table showing the last N receipts or deliveries. Fetches its own data (RSC). Takes a `type` prop so we can reuse it for both.

Props: `{ type: 'receipt' | 'delivery', limit?: number }`

---

### Products

**`ProductsTable`** (`components/features/products/ProductsTable.tsx`)  
The main products list. Sortable, searchable (by name/SKU), filterable by category. Pagination via URL params (`?page=`, `?search=`). Client component. Takes initial data from the parent RSC page so there's no loading flash.

Props: `{ initialData: Product[] }`

**`ProductFormModal`** (`components/features/products/ProductFormModal.tsx`)  
A Dialog wrapping the create/edit form. Uses `react-hook-form` + Zod. Submit calls the relevant server action. Works for both create and edit — controlled by the `mode` prop.

Props: `{ mode: 'create' | 'edit', product?: Product, trigger: ReactNode }`

---

### Receipts

**`ReceiptsTable`** (`components/features/receipts/ReceiptsTable.tsx`)  
Same pattern as ProductsTable. Columns: Reference, Supplier, Date, Status badge, row actions. Search + status filter via URL params. Client component.

Props: `{ initialData: Receipt[] }`

**`ReceiptDetailView`** (`components/features/receipts/ReceiptDetailView.tsx`)  
The full detail page for a single receipt. Header info (supplier, date, status), editable line items table, and the action buttons: Validate, Cancel. Each button calls a server action. Client component.

Props: `{ receipt: ReceiptWithLines }`

---

### Deliveries

**`DeliveriesTable`** — same structure as ReceiptsTable, columns adjusted for deliveries (destination instead of supplier).

**`DeliveryDetailView`** — same structure as ReceiptDetailView, but the status buttons are Pick / Pack / Validate / Cancel matching the delivery workflow.

---

### Move History

**`MoveHistoryTable`** (`components/features/history/MoveHistoryTable.tsx`)  
Paginated, read-only. Columns: Date, Reference (linked), Product, From, To, Qty, Type. All filters via URL params. Client component.

Props: `{ initialData: Transaction[], totalCount: number }`

---

### Shared utilities

**`StatusBadge`** — maps a status string to a coloured Badge. DRAFT=grey, WAITING=yellow, READY=blue, DONE=green, CANCELED=red. Pure component, no state.

**`SearchBar`** — debounced input that writes to `?search=` in the URL using `router.replace`. Works with any RSC table.

**`FilterBar`** — row of Select dropdowns, each mapped to a URL param. Config-driven so we can drop it into any page.

**`DataTablePaginator`** — Prev/Next buttons that update `?page=`. Dead simple.

---

### Settings

**`WarehouseForm`** — Create/Edit form for warehouses. Name, short code, address. Submits via server action.

**`LocationForm`** — Create/Edit form for locations. Name, short code, parent warehouse (dropdown). Submits via server action.

---

## 5. Tech stack

| What | Choice | Why |
|------|--------|-----|
| Framework | Next.js 14 App Router | RSC + Server Actions = no separate API layer needed |
| Language | TypeScript | Non-negotiable for a team working in parallel |
| Styling | Tailwind CSS v3 | Fast, no context switching, everyone knows it |
| Components | shadcn/ui | Accessible out of the box, we own the code, Radix under the hood |
| Database | PostgreSQL (Supabase or Neon free tier) | Relational, ACID, free, familiar |
| ORM | Prisma | Type-safe, migration CLI is fast, studio is useful for debugging |
| Validation | Zod | Write the schema once, get types and runtime validation |
| Auth | NextAuth.js v5 | JWT sessions, credentials provider, works with App Router |
| Deployment | Vercel | Literally just connect the repo and it works |

Packages to install at the start:

```bash
npm install next-auth@beta @prisma/client prisma zod react-hook-form @hookform/resolvers lucide-react
npx prisma init
npx shadcn-ui init
```

---

## 6. Folder structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← AppShell goes here
│   │   ├── page.tsx                ← Dashboard
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── receipts/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── deliveries/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── history/page.tsx
│   │   └── settings/
│   │       └── warehouse/page.tsx
│   └── api/auth/[...nextauth]/route.ts
│
├── actions/                        ← all server actions live here
│   ├── product.actions.ts
│   ├── receipt.actions.ts
│   ├── delivery.actions.ts
│   └── warehouse.actions.ts
│
├── components/
│   ├── layout/
│   ├── ui/                         ← shadcn components (don't touch these)
│   └── features/
│       ├── dashboard/
│       ├── products/
│       ├── receipts/
│       ├── deliveries/
│       ├── history/
│       ├── settings/
│       └── shared/                 ← SearchBar, FilterBar, StatusBadge, etc.
│
├── lib/
│   ├── db.ts                       ← Prisma singleton
│   ├── auth.ts                     ← NextAuth config
│   └── utils.ts                    ← cn(), formatDate(), generateRef()
│
├── types/index.ts
├── middleware.ts
│
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

One thing to note: Server Actions go in `actions/`, not inside component files. Keeps things findable when you're debugging at hour 6.

---

## 7. Database schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- Enums: Operational Constants ---
enum Role              { ADMIN; USER }
enum TransactionType   { IN; OUT; TRANSFER; ADJUSTMENT }
enum OperationStatus   { DRAFT; WAITING; READY; DONE; CANCELED }
enum UnitOfMeasure     { UNIT; KG; LITRE; BOX; METRE }

// --- 1. Multitenancy & User Management ---
model Organization {
  id         String      @id @default(cuid())
  name       String
  inviteCode String      @unique
  users      User[]
  warehouses Warehouse[]
  items      Item[]
  categories Category[]
  createdAt  DateTime    @default(now())
}

model User {
  id             String       @id @default(cuid())
  email          String       @unique
  name           String?
  password       String
  role           Role         @default(USER)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  verified       Boolean      @default(false)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  receipts       Receipt[]
  deliveries     Delivery[]
}

// --- 2. Warehouse & Structural Infrastructure ---
model Warehouse {
  id             String       @id @default(cuid())
  name           String
  shortCode      String
  address        String?
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  locations      Location[]
  createdAt      DateTime     @default(now())

  @@unique([shortCode, organizationId])
}

model Location {
  id          String   @id @default(cuid())
  name        String
  shortCode   String
  warehouseId String
  warehouse   Warehouse @relation(fields: [warehouseId], references: [id])
  stocks      Stock[]   // Actual quantities of items on this specific shelf/rack
  
  fromTxns    Transaction[] @relation("FromLocation")
  toTxns      Transaction[] @relation("ToLocation")

  @@unique([shortCode, warehouseId])
}

// --- 3. Product & Inventory Engine ---
model Category {
  id             String       @id @default(cuid())
  name           String
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  items          Item[]

  @@unique([name, organizationId])
}

model Item {
  id             String        @id @default(cuid())
  sku            String        @unique
  name           String
  description    String?
  uom            UnitOfMeasure @default(UNIT)
  minStock       Int           @default(0) // For Low Stock alerts
  categoryId     String?
  category       Category?     @relation(fields: [categoryId], references: [id])
  organizationId String
  organization   Organization  @relation(fields: [organizationId], references: [id])
  
  stocks         Stock[]       // Relation to track quantities across multiple locations
  receiptLines   ReceiptLine[]
  deliveryLines  DeliveryLine[]
  transactions   Transaction[]
  
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model Stock {
  id         String   @id @default(cuid())
  itemId     String
  item       Item     @relation(fields: [itemId], references: [id])
  locationId String
  location   Location @relation(fields: [locationId], references: [id])
  quantity   Int      @default(0)

  @@unique([itemId, locationId]) // Ensures one quantity record per item per location
}

// --- 4. Incoming Goods (Receipts) ---
model Receipt {
  id          String          @id @default(cuid())
  reference   String          @unique // e.g., "REC/2026/0001"
  supplier    String
  scheduledAt DateTime?
  status      OperationStatus @default(DRAFT)
  notes       String?
  createdById String
  createdBy   User            @relation(fields: [createdById], references: [id])
  lines       ReceiptLine[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model ReceiptLine {
  id               String  @id @default(cuid())
  receiptId        String
  receipt          Receipt @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  itemId           String
  item             Item    @relation(fields: [itemId], references: [id])
  expectedQuantity Int
  receivedQuantity Int     @default(0)
}

// --- 5. Outgoing Goods (Deliveries) ---
model Delivery {
  id          String          @id @default(cuid())
  reference   String          @unique // e.g., "DEL/2026/0001"
  destination String
  scheduledAt DateTime?
  status      OperationStatus @default(DRAFT)
  notes       String?
  createdById String
  createdBy   User            @relation(fields: [createdById], references: [id])
  lines       DeliveryLine[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model DeliveryLine {
  id         String   @id @default(cuid())
  deliveryId String
  delivery   Delivery @relation(fields: [deliveryId], references: [id], onDelete: Cascade)
  itemId     String
  item       Item     @relation(fields: [itemId], references: [id])
  quantity   Int
}

// --- 6. The Audit Trail (Stock Ledger) ---
model Transaction {
  id             String          @id @default(cuid())
  reference      String          // Links to the source Receipt/Delivery Reference
  itemId         String
  item           Item            @relation(fields: [itemId], references: [id])
  type           TransactionType
  quantity       Int             // Positive = stock in, Negative = stock out
  fromLocationId String?
  fromLocation   Location?       @relation("FromLocation", fields: [fromLocationId], references: [id])
  toLocationId   String?
  toLocation     Location?       @relation("ToLocation", fields: [toLocationId], references: [id])
  notes          String?
  createdAt      DateTime        @default(now())
}

The Transaction model is the most important one — it's the source of truth for the Move History page and for auditing. Every action that changes stock **must** create a Transaction record. Don't skip this even when rushing.

---

## 8. Server actions reference

All in `src/actions/`. These are called from Client Components on form submit. Always run Zod validation first, then Prisma, then `revalidatePath`. Always return `{ success: true }` or `{ error: string }` so the UI can show a toast.

**Products**
- `createProduct(data)` — inserts Item, returns new item
- `updateProduct(id, data)` — updates fields
- `archiveProduct(id)` — soft delete (add an `archived` boolean to the schema if we have time)

**Receipts**
- `createReceipt(data)` — inserts Receipt + ReceiptLines, status = DRAFT
- `updateReceiptStatus(id, status)` — transitions the status
- `validateReceipt(id)` — the important one: for each line, `item.quantity += receivedQuantity`, insert a Transaction, set status = DONE
- `cancelReceipt(id)` — sets CANCELED, no stock changes

**Deliveries**
- `createDelivery(data)` — inserts Delivery + DeliveryLines
- `validateDelivery(id)` — for each line, `item.quantity -= quantity`, insert a Transaction, set status = DONE
- `cancelDelivery(id)` — sets CANCELED

**Warehouses / Locations**
- `createWarehouse(data)`, `updateWarehouse(id, data)`
- `createLocation(data)`, `updateLocation(id, data)`

A helper to add to `lib/utils.ts` early — you'll need it everywhere:

```typescript
export const generateRef = (prefix: string, count: number) =>
  `${prefix}/${new Date().getFullYear()}/${String(count + 1).padStart(5, '0')}`;
// e.g. generateRef('REC', 3) → "REC/2025/00004"
```

---

## 9. Auth flow

```
Visit /dashboard/*
    → middleware.ts checks session token
    → no token → redirect to /login

/login
    → submit email + password
    → NextAuth CredentialsProvider runs bcrypt.compare()
    → match → JWT session in httpOnly cookie → redirect to /dashboard

Logout
    → signOut() from profile dropdown → clears cookie → back to /login
```

Middleware is three lines:

```typescript
// src/middleware.ts
export { auth as middleware } from "@/lib/auth"
export const config = { matcher: ["/dashboard/:path*"] }
```

For the hackathon: seed `admin@core.dev` / `admin123` at startup. Skip the email provider. If someone asks about OTP reset, show the console output and explain it's not wired to SendGrid yet — that's an honest answer.

---

## 10. State management

Short answer: we barely need any.

- **DB/server state** — RSC fetches it on render, Server Actions mutate it, `revalidatePath()` refreshes it. No loading spinners, no stale state, no sync bugs.
- **UI toggles** — `useState`. Modal open/close, tab selection.
- **Forms** — `react-hook-form`. Don't manage form state manually.
- **Filters and search** — URL params. `?search=steel&status=READY&page=2`. Makes everything linkable and keeps RSC aware of what the user wants.

If you find yourself reaching for Zustand, stop and ask whether a URL param or a `revalidatePath` call would solve it. It usually does.

---

## 11. Who does what

Assuming 3 people. These tracks can run in parallel after the initial setup hour.

**Person A — Frontend**  
Owns all the visual layer. Pages, layouts, components. Can work with mock data until the backend is ready. Never blocked.

**Person B — Backend**  
Owns the database schema, migrations, seed data, and all server actions. Probably the most context-heavy role — try to keep one person on this the whole time rather than splitting it.

**Person C — Integration + DevOps**  
Wires the frontend to the backend. Also owns the Vercel setup, env variables, middleware, and the README. Acts as the QA person in the last hour.

**Sync points:** quick check-in at hours 1, 3, 5.5, and 7. Stay on a voice call the whole time. Announce before running `prisma migrate dev` or pushing to main.

---

## 12. Hour-by-hour plan

### Hour 0–1 · Setup

Get the foundation in place so nobody is blocked.

- [ ] `npx create-next-app coreinventory --typescript --tailwind --app` (A)
- [ ] `npx shadcn-ui init`, install core components (A)
- [ ] Provision Postgres on Supabase or Neon, grab the `DATABASE_URL` (B)
- [ ] `npx prisma init`, paste schema, `prisma migrate dev --name init` (B)
- [ ] Connect GitHub repo to Vercel, add all env vars, confirm auto-deploy works (C)
- [ ] Configure NextAuth in `lib/auth.ts`, install `next-auth@beta` (C)
- [ ] Build AppShell, Sidebar, TopNavBar shells — static, no real data yet (A)

### Hour 1–3 · Foundation

- [ ] Login + register pages, wired to NextAuth credentials (A + C)
- [ ] Seed script: 1 admin user, 10 products, 2 warehouses, 3 locations, some sample transactions (B)
- [ ] Dashboard page with KPI cards pulling from DB (A + B)
- [ ] Products page: table + create/edit modal + server actions (A + B)
- [ ] Middleware protecting all dashboard routes (C)

### Hour 3–5:30 · Features

This is where most of the work happens. Integrate as you go — don't leave it all for Phase 4.

- [ ] Receipts: list page, detail page, create flow, line items, validate action → stock++ (A + B)
- [ ] Deliveries: list page, detail page, validate action → stock-- (A + C)
- [ ] Move History: ledger table, basic filters, pagination (A)
- [ ] Transaction insert logic in receipt + delivery validate actions (B)
- [ ] Settings: warehouse and location CRUD pages (C)

### Hour 5:30–7 · Integration & Polish

- [ ] Audit every button — does it actually hit the DB? Fix anything that doesn't. (C)
- [ ] Add toast notifications for every server action response (A)
- [ ] Empty states for tables with no data (A)
- [ ] Loading skeletons for the main tables (A)
- [ ] Zod error messages surfacing properly in forms (B)
- [ ] Check for any obvious performance issues — unnecessary client fetches, etc. (B + C)

### Hour 7–8 · Freeze & Demo Prep

🔴 **No new features from this point.**

- [ ] End-to-end walkthrough of the app, log any critical bugs (C)
- [ ] Fix critical bugs only — broken validate, login failures, blank pages (B + C)
- [ ] Write the README (A)
- [ ] Pre-load demo data so the app looks populated (whoever finishes first)
- [ ] Rehearse the demo script twice

---

## 13. Git rules

- `main` is the deployment branch. Vercel auto-deploys on push.
- Short feature branches for anything that might conflict: `feat/receipts-ui`, `fix/validate-stock`, etc.
- **No branch lives longer than 45 minutes.** Merge or abandon.
- Direct push to `main` is fine for isolated, small, non-conflicting changes.
- Quick commit message convention — just be clear: `feat: receipt validate action`, `fix: stock not decrementing on delivery`, `chore: seed products`.

`.env.local` — never committed. Add it to `.gitignore` on day one:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="any-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
```

All production env vars go into the Vercel dashboard **before hour 1 ends**.

---

## 14. Shortcuts that are fine to take

These are conscious tradeoffs, not corners cut by mistake.

**Hardcode the admin user.** Seed `admin@core.dev` / `admin123` and use that for the demo. It saves 20-30 minutes and demonstrates the exact same auth flow.

**`console.log` the OTP.** Wire the password reset flow structurally but don't spend time on an email provider. During the demo just say "this prints to the server in dev; production would send via SendGrid or Resend."

**Mock first, real data second.** If the backend isn't ready when the UI is, use `const mockData = [...]` in the page component. The UI person should never be blocked waiting for an API.

**Simplify the status machine.** If the full Draft → Waiting → Ready → Done flow feels like overkill, collapse it. A receipt can just be PENDING or DONE. The important thing is the stock update and the transaction log.

**Prisma Studio beats building an admin panel.** For any debugging or data setup during development, `npx prisma studio` is right there. Don't waste time building tools you already have.

---

## 15. What to cut if we're running late

Check this table honestly at hours 3, 5, and 6. Cutting a feature at hour 3 is a decision. Cutting it at hour 7 is a crisis.

| Feature | Keep? | If cutting... |
|---------|-------|---------------|
| Login / auth | Always | – |
| Dashboard KPIs | Always | – |
| Product CRUD | Always | – |
| Receipt create + validate | Always | – |
| Delivery create + validate | Always | – |
| Move history | Keep if possible | Show a basic list with no filters |
| Warehouse settings | Probably | Hardcode 1 default warehouse in seed |
| Location settings | Maybe | Same — hardcode 1 location |
| Internal transfers | Cut if < 90 min left | Mock the UI state only |
| Stock adjustments | Cut if < 60 min left | Not worth the risk |
| OTP password reset | Cut freely | console.log is fine |
| Low stock alerts | Cut freely | Just filter the dashboard KPI query |
| Product category filter | Cut if schema change feels risky | Drop the field entirely |

---

## 16. Demo prep

**The 2-minute script:**

Start at `/dashboard` already logged in. Don't demo the login screen unless asked — it wastes 20 seconds and nobody's impressed by a login form.

> *"CoreInventory centralizes everything — let me show you the core loop."*

Go to Receipts → create a new one → add Steel Rods, 50 units → validate.
> *"Shipment arrived. 50 units of Steel Rods received. Stock jumps from 100 to 150. Automatic."*

Go to Deliveries → create one → 20 units → validate.
> *"Customer order out the door. Stock drops to 130. Every movement logged."*

Go to Move History → show the two rows just created.
> *"Full audit trail. Who did it, when, what changed. This is the ledger."*

Go back to Dashboard → point to the KPI cards.
> *"Everything's live. If stock falls below threshold, it shows here."*

That's it. Clean, concrete, real data.

**Pre-demo checklist:**

- [ ] App is live on Vercel, no build errors
- [ ] Login works with the demo credentials
- [ ] At least 10 products seeded, some with low stock
- [ ] 2 receipts in the DB already (1 Done, 1 Waiting) so the list isn't empty
- [ ] 1 delivery in Ready state — validate it live during the demo
- [ ] Move History has 10+ rows so the table looks real
- [ ] Browser tab open to `/dashboard` before screen sharing starts
- [ ] Screen share resolution checked

---

*CoreInventory v1.0 — built in 8 hours, not a moment more.*