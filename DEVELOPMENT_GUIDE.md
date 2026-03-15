# Development Workflow Guide — CoreInventory

Complete guide for setting up, developing, testing, and deploying CoreInventory.

---

## 📋 Quick Start

### 1. Prerequisites

- **Node.js:** 18.17.0+ ([download](https://nodejs.org/))
- **npm:** 9.0.0+ (comes with Node.js)
- **Git:** 2.37.0+ ([download](https://git-scm.com/))
- **PostgreSQL:** Local or cloud account (Neon recommended)
- **Code Editor:** VS Code recommended

### 2. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd CoreInventory

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 3. Configure Database

Get PostgreSQL connection string:

**Option A: Neon (Recommended)**
1. Visit https://neon.tech
2. Create free account
3. Create new project
4. Copy connection string

**Option B: Local PostgreSQL**
```bash
createdb coreinventory
```

Set `DATABASE_URL` in `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host:5432/coreinventory?sslmode=require
```

### 4. Setup Database

```bash
# Run migrations
npm run db:push

# Seed test data
npm run db:seed

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and login with admin account:

| Email                    | Password      | Role         |
| ------------------------ | ------------- | ------------ |
| baluduvamsi2000@gmail.com | Vamsi@08      | SUPER_ADMIN  |

**Note:** Additional Manager and Warehouse Staff accounts can be created via the Users management page after logging in as admin.

---

## 🔧 Development Environment Setup

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "vercel.next-js",
    "prisma.prisma",
    "tailwindlabs.tailwindcss-intellisense",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "graphql.vscode-graphql"
  ]
}
```

### NPM Scripts

| Command                | Purpose                           |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start dev server (port 3000)      |
| `npm run build`        | Create production build           |
| `npm run start`        | Start production server           |
| `npm run lint`         | Run ESLint checks                 |
| `npm run typecheck`    | Run TypeScript compiler           |
| `npm run db:migrate`   | Create new migration              |
| `npm run db:push`      | Apply migrations                  |
| `npm run db:seed`      | Seed test data                    |
| `npm run db:studio`    | Open Prisma Studio               |

---

## 📝 Common Development Tasks

### Task 1: Add a New Page

**1. Create page file:**

```tsx
// src/app/(dashboard)/myfeature/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

export default function MyFeaturePage() {
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/myfeature");
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Header title="My Feature" description="Feature description" />
      
      <div className="p-6">
        {loading && <p>Loading...</p>}
        {/* Your content here */}
      </div>
    </div>
  );
}
```

**2. Add sidebar menu item:**

```tsx
// src/components/layout/AppSidebar.tsx
const navItems = [
  // ... existing items
  { 
    title: "My Feature", 
    url: "/myfeature", 
    icon: MyIcon, 
    group: "features" 
  }
];
```

**3. Add middleware protection (if needed):**

```tsx
// src/middleware.ts
if (pathname.startsWith("/myfeature") && role !== "MANAGER") {
  return NextResponse.redirect(new URL("/inventory", request.url));
}
```

---

### Task 2: Add a New API Endpoint

**1. Create route file:**

```typescript
// src/app/api/myfeature/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.myModel.findMany();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }
    
    // Create record
    const created = await prisma.myModel.create({
      data: body
    });
    
    return NextResponse.json({
      success: true,
      data: created
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create" },
      { status: 500 }
    );
  }
}
```

**2. Test the endpoint:**

```bash
# Test GET
curl http://localhost:3000/api/myfeature

# Test POST
curl -X POST http://localhost:3000/api/myfeature \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

---

### Task 3: Add a New Database Model

**1. Update Prisma schema:**

```prisma
// prisma/schema.prisma
model MyModel {
  id        String   @id @default(cuid())
  name      String
  description String?
  organizationId String
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([name, organizationId])
  @@index([organizationId])
}

// Add to Organization model's relations
model Organization {
  // ... existing fields
  myModels MyModel[]
}
```

**2. Generate Prisma client:**

```bash
npx prisma generate
```

**3. Create migration:**

```bash
npm run db:migrate
# Provide a name like: "add_my_model"
```

**4. Apply migration:**

```bash
npm run db:push
```

---

### Task 4: Add Form Validation

**1. Define Zod schema:**

```typescript
// lib/validations/myfeature.ts
import { z } from "zod";

export const createMyFeatureSchema = z.object({
  name: z.string()
    .min(1, "Name required")
    .max(100, "Name too long"),
  
  description: z.string()
    .max(500, "Description too long")
    .optional(),
  
  categoryId: z.string()
    .cuid("Invalid category")
    .optional(),
});

export type CreateMyFeatureInput = z.infer<typeof createMyFeatureSchema>;
```

**2. Use in form:**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMyFeatureSchema } from "@/lib/validations/myfeature";

export function MyFeatureForm() {
  const form = useForm({
    resolver: zodResolver(createMyFeatureSchema),
  });

  const onSubmit = async (data) => {
    const response = await fetch("/api/myfeature", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      form.reset();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <label>Name</label>
        <input
          {...form.register("name")}
          placeholder="Enter name"
        />
        {form.formState.errors.name && (
          <span className="text-red-600">{form.formState.errors.name.message}</span>
        )}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

### Task 5: Fetch Data in Component

**Pattern 1: Server Component (Recommended)**

```tsx
// src/app/(dashboard)/mypage/page.tsx
import { MyFeatureList } from "@/components/MyFeatureList";

async function fetchFeatures() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/features`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default async function MyPage() {
  const data = await fetchFeatures();
  
  return <MyFeatureList initialData={data} />;
}
```

**Pattern 2: Client Component with useEffect**

```tsx
"use client";

import { useEffect, useState } from "react";

export function MyFeatureList({ initialData }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refetch = async () => {
      setLoading(true);
      const res = await fetch("/api/features");
      const result = await res.json();
      setData(result.data);
      setLoading(false);
    };

    // Refetch on demand
  }, []);

  return <div>{/* Render data */}</div>;
}
```

---

## 🧪 Testing

### Manual Testing Checklist

Before committing changes:

- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] Create/Read/Update/Delete operations work
- [ ] Validation messages show on invalid input
- [ ] Error handling works (network errors, server errors)
- [ ] Toast notifications appear/disappear
- [ ] Responsive on mobile (320px+)
- [ ] No console errors or warnings
- [ ] Loading states show during async operations

### Running Linter

```bash
npm run lint
```

### Type Checking

```bash
npm run typecheck
```

### Database Testing

```bash
# Open Prisma Studio to inspect data
npm run db:studio
```

---

## 🐛 Debugging

### Enable Debug Logging

```typescript
// Add to any file
const debug = (msg: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEBUG] ${msg}`, data);
  }
};
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next dev",
      "console": "integratedTerminal"
    }
  ]
}
```

### Browser DevTools

- **Network Tab:** Check API response times
- **Application Tab:** Inspect cookies, localStorage
- **Console:** Check for errors
- **Performance:** Measure load times

---

## 📦 Dependency Management

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all packages
npm update

# Update specific package
npm install lodash@latest

# Install new package
npm install new-package

# Uninstall package
npm uninstall old-package
```

### Lock File

`package-lock.json` locks all dependency versions. Commit this to Git.

```bash
# Always install from lock file
npm ci
```

---

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No linting errors: `npm run lint`
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Build succeeds: `npm run build`

### Build Locally

```bash
npm run build
npm run start
```

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Set Environment Variables in Vercel dashboard
4. Deploy button

**Environment Variables to Set:**

```env
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-key>
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<strong-random-key>
ORG_ACCESS_KEY=core-inventory-2026
```

### Deploy to Other Platforms

**Railway:**
```bash
npm install -g railway
railway link
railway up
```

**Render:**
1. Connect GitHub repo
2. Select Next.js environment
3. Set environment variables
4. Deploy

---

## 🔀 Git Workflow

### Branch Naming

```
feature/add-product-search      # New feature
bugfix/fix-stock-calculation    # Bug fix
refactor/optimize-queries        # Refactoring
docs/update-readme              # Documentation
```

### Commit Messages

```
feat: add product search functionality
  - Implemented full-text search
  - Added filter by category
  
fix: correct stock calculation for transfers
  - Ensure location stock updates correctly
  - Add validation for negative qty

docs: update API documentation
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Commit with meaningful messages
4. Push to GitHub
5. Create Pull Request with description
6. Request review
7. Address feedback
8. Merge after approval

---

## 📊 Performance Monitoring

### Build Time

```bash
npm run build
# Check output: "Compiled successfully in X seconds"
```

### Bundle Size

```bash
npm install -g nextjs-bundle-analyzer
npm run analyze
```

### Runtime Performance

Use browser DevTools Performance tab:
1. Open DevTools → Performance
2. Click Record
3. Interact with page
4. Stop recording
5. Analyze timeline

---

## 🚨 Troubleshooting

### Issue: "Cannot find module" Error

**Solution:**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Database Connection Failed

**Solution:**

```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
npx prisma db execute --stdin
> SELECT 1

# Reconnect
npm run db:push
```

### Issue: TypeScript Errors After Schema Change

**Solution:**

```bash
# Regenerate Prisma client
npx prisma generate

# Type check
npm run typecheck
```

### Issue: Hot Reload Not Working

**Solution:**

```bash
# Stop dev server
# Clear .next folder
rm -rf .next

# Restart
npm run dev
```

### Issue: Build Fails with "Cannot find module"

**Solution:**

```bash
# Check imports
grep -r "from '/.*'" src/ # Look for absolute paths

# Should use:
import { MyComponent } from "@/components/MyComponent"
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Hooks API](https://react.dev/reference/react/hooks)

---

## 💡 Pro Tips

**1. Use Prisma Studio for Quick Data Viewing**

```bash
npm run db:studio
# Opens http://localhost:5555
```

**2. Generate Type-Safe API Clients**

```typescript
// Use Prisma result types directly
type Product = Prisma.ItemGetPayload<{}>;
```

**3. Optimize Queries with Prisma Select**

```typescript
// Instead of fetching all fields
const items = await prisma.item.findMany({
  select: {
    id: true,
    name: true,
    sku: true,
    // Only fetch needed fields
  }
});
```

**4. Cache Server Actions Results**

```tsx
// In layout or root page
export const revalidate = 3600; // Cache for 1 hour
```

**5. Use Middleware for Cross-Cutting Concerns**

```typescript
// src/middleware.ts handles auth, logging, etc.
```

---

## 🎯 Development Checklist

Before marking a feature as "Done":

- [ ] Feature works locally
- [ ] No console errors/warnings
- [ ] TypeScript passes: `npm run typecheck`
- [ ] Linting passes: `npm run lint`
- [ ] Database schema updated (if needed)
- [ ] API endpoints tested
- [ ] UI responsive on mobile
- [ ] Error cases handled
- [ ] Loading states shown
- [ ] Toast notifications work
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Git commits are clean
- [ ] PR description is clear

---

**Last Updated:** March 15, 2026
