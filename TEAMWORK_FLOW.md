# CoreInventory: 8-Hour Hackathon Strategy & Architecture

This document outlines the architecture, teamwork flow, and hour-by-hour development phases for the "CoreInventory" project during an 8-hour virtual hackathon selection round.

## 🎯 Project Goals
- Build a functional MVP of an inventory management system within the strict 8-hour timeframe.
- Implement core workflows: Authentication, Dashboard, Stock Management, Locations, History, and Deliveries.
- Adhere strictly to the wireframe mapping and functional requirements provided in the PDF specifications.
- Demonstrate clean standard architecture, smooth user experience, and effective team collaboration.

## 🏛 Detailed Standard Architecture (Next.js + Postgres)

To ensure rapid development and maintainable code under time pressure, we will adopt a standard, opinionated architecture for our Next.js App Router application:

```text
src/
├── app/                  # App Router Pages & API Routes
│   ├── (auth)/           # Route group for auth pages (login/register)
│   ├── (dashboard)/      # Route group for internal app pages
│   │   ├── inventory/    # Page: Stock/Inventory View
│   │   ├── locations/    # Page: Locations & Deliveries
│   │   ├── history/      # Page: Transaction History
│   │   └── layout.tsx    # Shared Sidebar/Nav Layout
│   ├── api/              # Standard Next.js Route Handlers (RESTful)
│   └── globals.css       # Tailwind entrypoint
├── components/           # Reusable UI & Feature Components
│   ├── ui/               # Base UI components (Buttons, Inputs, Modals - via shadcn)
│   └── features/         # Complex compositions (e.g., InventoryTable, AddStockForm)
├── lib/                  # Utilities and Integrations
│   ├── db.ts             # Prisma/Drizzle DB Client singleton
│   ├── auth.ts           # NextAuth/Supabase auth configuration
│   └── utils.ts          # Helper functions (date formatting, class merging)
├── types/                # Shared TypeScript Interfaces/Types
└── prisma/               # Database Schema (if using Prisma)
    └── schema.prisma     # Postgres schema definition
```

### Flow of Data & Execution Model
1. **React Server Components (RSC)**: Used by default in the `app/` directory for pages and layouts. RSCs directly query the database (via Prisma) to fetch initial data (e.g., `inventory/page.tsx` fetches the items list). This avoids loading states and client-side waterfalls.
2. **Client Components (`"use client"`)**: Used strictly for interactive UI elements (e.g., Modals, Search bars, Data Tables with sorting/filtering, Forms).
3. **Server Actions**: Used for mutations (Create, Update, Delete). Forms in Client Components submit to Server Actions, which validate data using Zod, interact with Prisma, and call `revalidatePath()` to instantly update the UI without full page reloads.

### Deep Dive: Database Schema (Prisma)
To support the core functionality within the timeline, the relational model must be tight and normalized.
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER) // ADMIN, USER
  createdAt DateTime @default(now())
}

model Item {
  id          String        @id @default(cuid())
  sku         String        @unique
  name        String
  description String?
  quantity    Int           @default(0)
  locationId  String?
  location    Location?     @relation(fields: [locationId], references: [id])
  history     Transaction[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Location {
  id        String   @id @default(cuid())
  name      String   @unique // e.g., "Warehouse A", "Shelf B2"
  address   String?
  items     Item[]
}

model Transaction {
  id        String           @id @default(cuid())
  itemId    String
  item      Item             @relation(fields: [itemId], references: [id])
  type      TransactionType  // IN, OUT, ADJUSTMENT
  quantity  Int              // Positive for IN, Negative for OUT
  notes     String?
  createdAt DateTime         @default(now())
  createdBy String           // User ID of the person who made the change
}

enum Role { ADMIN, USER }
enum TransactionType { IN, OUT, ADJUSTMENT }
```

### State Management & URL Strategy
Given the 8-hour constraint, avoid complex global state managers like Redux or Zustand unless absolutely necessary.
- **Server State**: Managed entirely by Next.js Server Components and revalidated via Server Actions.
- **UI/Local State**: `useState` for simple toggles (e.g., modal visibility).
- **URL State**: Use query parameters (`?search=foo&page=2`) for data table filtering and pagination. This allows users to share links and keeps the Server Components aware of the current view state.

### Authentication Flow (NextAuth.js v5)
- **Strategy**: JWT-based session management.
- **Implementation**: Protect the `(dashboard)` route group at the middleware level (`middleware.ts`) to ensure unauthorized users cannot access any internal pages or API routes.
- **Hackathon speed trick**: Use simple credentials provider with a hardcoded admin backdoor, or a zero-config provider like GitHub OAuth to save time.

## 🛠 Tech Stack & Tools
- **Frontend**: Next.js (App Router) + React + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes / Server Actions
- **Database**: PostgreSQL (Supabase/Neon)
- **ORM**: Prisma (for rapid schema prototyping and type-safety)
- **Validation**: Zod (for strictly validating form inputs and API payloads)
- **State/Fetching**: Server Components for reads, Server Actions + `revalidatePath` for mutations.

## 👥 Team Roles & Workflow
To maximize output in 8 hours, the team should divide into parallel tracks. Assuming a standard 3-4 person team:

*   **Role 1: Frontend/UI Lead**
    *   Builds layouts, routing, and UI components based on wireframes.
    *   Mocks data initially to unblock UI work.
*   **Role 2: Backend & Database Lead**
    *   Designs DB schema, sets up Postgres & ORM.
    *   Builds CRUD API routes (Items, Locations, History).
*   **Role 3: Full-Stack / Integration Ninja**
    *   Connects Frontend to Backend APIs.
    *   Handles Authentication (NextAuth / Supabase Auth).
    *   Manages deployment pipeline.

### Git Flow for 8 Hours
- `main` branch used for deploying to Vercel (auto-deploy on push).
- **Trunk-Based Development**: Push directly to `main` for tiny isolated changes, or use short-lived branches (`feat/dashboard`, `fix/login`) with rapid pull requests. No branch should live longer than 45 minutes.

---

## ⏱ 8-Hour Development Timeline

### Phase 1: Planning & Setup (Hour 0:00 - 1:00)
- **0:00 - 0:20**: Finalize wireframe scope. Agree on the absolute minimal viable product (Must-haves vs. Nice-to-haves).
- **0:20 - 1:00**:
  - Initialize Next.js project and push to GitHub.
  - Setup UI library (Tailwind/shadcn).
  - Provision Postgres DB (Supabase/Neon).
  - Setup ORM (Prisma) and define the initial schema (User, Item, Location, Transaction).
  - Deploy initial empty app to Vercel to ensure CI/CD is working.

### Phase 2: Core Foundation & Boilerplate (Hour 1:00 - 3:00)
- **Frontend**:
  - Build Auth screens (Login).
  - Construct the main persistent layout (Sidebar/Navigation).
  - Build structural pages (Dashboard/Home empty states).
- **Backend**:
  - Setup Authentication (NextAuth.js credentials or OAuth).
  - Write standard CRUD API endpoints for Inventory Items and Stock.
  - Seed database with mock data for the frontend to test against.

### Phase 3: Feature Implementation (Hour 3:00 - 5:30)
*This is the heaviest coding phase. Integrate as you go.*
- **Stock/Inventory View**: Displaying the table of items, quantities, and status.
- **Manage Operations**: Modals/Pages to Add, Edit, or Delete stock items. Include forms with basic validation.
- **Locations & Delivery**: Simple mapping of items to locations. Delivery view to track incoming/outgoing goods.
- **History Tracking**: Whenever an item is updated, log an entry to the `Transactions/History` table.

### Phase 4: Integration & Polish (Hour 5:30 - 7:00)
- **Integration Check**: Ensure all UI buttons actually hit the database and reflect real data.
- **Error Handling**: Add toast notifications for success/failure on API calls.
- **UI Polish**: Align components with the wireframes. Fix spacing, typography, and empty states.
- **Performance**: Ensure no glaring performance issues (e.g., repeating client-side fetches unnecessarilly).

### Phase 5: Freeze, Test & Pitch Prep (Hour 7:00 - 8:00)
- **Feature Freeze**: STRICTLY NO NEW FEATURES.
- **Testing**: End-to-end walkthrough of the app. Fix critical bugs only.
- **Documentation**: Write a stellar `README.md` containing:
  - Project name & one-liner.
  - Setup instructions.
  - Tech stack used.
  - Screenshots of the working app.
- **Pitch/Demo Prep**: Script the 2-3 minute demo. Pre-load data so the demo looks active and populated.

---

## 🚦 Key Considerations & Hacks for Speed
1. **Skip Complex Auth First**: Run a hardcoded login bypass or use a dead-simple provider like GitHub OAuth if NextAuth takes too long.
2. **Mock the Unknown**: If complex queries take too long, mock the data or simplify the calculation on the client side.
3. **Communication**: Stay in a continuous voice call (Discord/Zoom/Teams). Announce when migrating the database or deploying to prevent stepping on toes.
4. **Scope Creep is the Enemy**: If the "Delivery" or "History" features are threatening the completion of the core "Inventory" feature, drop them and mock their UI.
