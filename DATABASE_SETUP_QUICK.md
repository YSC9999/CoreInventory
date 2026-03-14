# Quick Database Setup Guide

## Choose one option:

### 🚀 OPTION 1: Supabase (Easiest - 2 minutes)
1. Go to https://supabase.com
2. Click "New Project"
3. Create project (wait 1-2 min)
4. Go to Settings → Database → Connection String (URI)
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your actual password

Example:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
```

### 🐳 OPTION 2: Docker (Local)
If you have Docker installed:
```bash
docker run --name postgres-coreinv -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:15
```

Then update .env.local:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
```

### 📝 OPTION 3: Local PostgreSQL Installation
1. Download & install PostgreSQL from https://www.postgresql.org/download/windows/
2. During installation, set password (remember it!)
3. Update .env.local:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/coreinventory
```

## After Setting Up Database:

1. **Update .env.local** with your DATABASE_URL
2. **Run migrations:**
   ```bash
   npm run db:push
   ```
3. **Seed demo data:**
   ```bash
   npm run db:seed
   ```
4. **Start dev server:**
   ```bash
   npm run dev
   ```

---

## Quick Test
After setup, test the connection:
```bash
npm run db:studio
```
This opens Prisma Studio at http://localhost:5555 to see your database
