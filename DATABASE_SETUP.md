# Database Setup Guide

## Prerequisites

- PostgreSQL installed locally or access to hosted PostgreSQL (Supabase, Neon, Railway, etc.)
- Node.js and npm installed

## Setup Steps

### 1. Create Database

Choose one:

**Option A: Local PostgreSQL**

```bash
createdb coreinventory
```

**Option B: Hosted (Supabase/Neon/Railway)**

- Create account and database
- Copy connection string

---

### 2. Configure Environment

Create `.env.local` from template:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your database URL:

```
DATABASE_URL=postgresql://user:password@host:5432/coreinventory
```

---

### 3. Run Migrations

```bash
npm run db:push
```

This creates all tables based on `prisma/schema.prisma`

---

### 4. Seed Demo Data (Optional)

```bash
npm run db:seed
```

Creates:

- Default organization (code: `core-inventory-2026`)
- Admin user (email: `admin@core.dev`, password: `admin123`)
- Warehouse & locations
- Electronics category

---

### 5. Verify Setup

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555` to browse your database.

---

## Database Schema Overview

**12 Models covering:**

- Organizations (multi-tenant root)
- Users (with roles: ADMIN, USER)
- Warehouses & Locations
- Categories & Items
- Stock tracking
- Receipts (incoming)
- Deliveries (outgoing)
- Transactions (audit trail)

**Key Features:**

- Multi-tenant: All data scoped to `organizationId`
- Unique constraints: `@@unique([field, organizationId])` prevents cross-org conflicts
- Relationships: Full FK integrity

---

## Common Commands

```bash
npm run db:migrate        # Create new migration interactively
npm run db:push          # Sync schema directly (for dev)
npm run db:seed          # Populate demo data
npm run db:studio        # Open visual database browser
```

---

## Team Development

**Person A (Database):**

1. Set up PostgreSQL
2. Run `npm run db:push`
3. Run `npm run db:seed` (optional)
4. Share DATABASE_URL with team

**Persons B,C,D (Development):**

1. Create `.env.local` with DATABASE_URL
2. Run `npm run dev`
3. Build server actions in `src/actions/`
4. Test with seed data

---

## Production Deployment

For production:

1. Use managed PostgreSQL (Vercel Postgres, AWS RDS, etc.)
2. Run migrations before deploying:
   ```bash
   npm run db:push
   ```
3. Keep `.env.local` out of version control (use `.env.local.example` as template)

---

## Schema Documentation

See `prisma/schema.prisma` for detailed model definitions, relationships, and constraints.
