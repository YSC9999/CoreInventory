# 📦 CoreInventory — Advanced Inventory Management System

Welcome to **CoreInventory**, a modern, enterprise-grade inventory management platform built with Next.js 16, TypeScript, PostgreSQL, and Prisma. Designed for warehouses, logistics operations, and multi-location inventory tracking with real-time stock synchronization and comprehensive audit trails.

---

## 🚀 Quick Overview

- **Tech Stack:** Next.js 16.1 (App Router), TypeScript, PostgreSQL (Neon), Prisma ORM, Tailwind CSS, React Three Fiber (3D), GSAP animations
- **Features:** Inventory tracking, receipt/delivery management, warehouse operations, stock transfers, real-time dashboard, audit ledger, role-based access control
- **Audience:** Warehouse managers, inventory staff, logistics coordinators, administrators
- **Status:** ✅ Production-Ready (Complete with all core features implemented)

---

## 📊 System Architecture

```mermaid
graph TB
    Client["🖥️ Next.js Frontend<br/>(React 19 + TypeScript)"]
    
    Server["🔧 API Layer<br/>(Server Actions + API Routes)"]
    
    DB["🗄️ PostgreSQL<br/>(Neon Cloud)"]
    
    Auth["🔐 JWT Auth<br/>(Role-Based Access)"]
    
    External["🌐 External Services<br/>(Email, Notifications)"]
    
    Client -->|fetch/POST| Server
    Client -->|Auth Token| Auth
    Auth -->|Verify| Server
    Server -->|Prisma ORM| DB
    Server -->|Events| External
    
    style Client fill:#3b82f6,stroke:#1e40af,color:#fff
    style Server fill:#10b981,stroke:#047857,color:#fff
    style DB fill:#f59e0b,stroke:#d97706,color:#fff
    style Auth fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style External fill:#ef4444,stroke:#991b1b,color:#fff
```

---

## 📦 Project Structure (What's Inside)

The codebase is organized for scalability and maintainability:

```
CoreInventory/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── layout.tsx     # Main layout with sidebar
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── products/      # Product management
│   │   │   ├── receipts/      # Inbound shipments
│   │   │   ├── deliveries/    # Outbound shipments
│   │   │   ├── inventory/     # Stock levels by warehouse
│   │   │   ├── stock-ledger/  # Transaction history
│   │   │   ├── transfers/     # Internal transfers
│   │   │   ├── adjustments/   # Stock adjustments
│   │   │   ├── warehouses/    # Facility management
│   │   │   ├── users/         # User management (SUPER_ADMIN)
│   │   │   ├── profile/       # User profile
│   │   │   ├── settings/      # Configuration
│   │   │   ├── move-history/  # Detailed audit log
│   │   │   └── history/       # Historical reports
│   │   │
│   │   └── api/               # 12 API route groups
│   │       ├── auth/          # Authentication endpoints
│   │       ├── categories/    # Product categories
│   │       ├── dashboard/     # Dashboard stats
│   │       ├── deliveries/    # Delivery management
│   │       ├── health/        # Health check
│   │       ├── items/         # Product CRUD
│   │       ├── me/            # Current user info
│   │       ├── products/      # Product endpoints
│   │       ├── receipts/      # Receipt endpoints
│   │       ├── stock/         # Stock queries
│   │       ├── transactions/  # Movement history
│   │       ├── transfers/     # Transfer operations
│   │       └── warehouses/    # Warehouse management
│   │
│   ├── actions/               # Server Actions
│   │   ├── auth.actions.ts    # Auth logic (signup/login/logout)
│   │   └── users.actions.ts   # User management
│   │
│   ├── components/            # React components
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx      # Navigation sidebar
│   │   │   └── Header.tsx          # Top bar
│   │   ├── dashboard/
│   │   │   ├── Overview.tsx        # Main dashboard
│   │   │   ├── KPICard.tsx         # Metric cards
│   │   │   ├── Charts.tsx          # Analytics graphs
│   │   │   ├── ActivityTable.tsx   # Recent activities
│   │   │   └── Hero3D.tsx          # 3D visualization
│   │   └── ui/                     # shadcn/ui components
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── use-gsap-stagger.ts
│   │
│   ├── lib/                   # Utility modules
│   │   ├── db.ts              # Prisma singleton
│   │   ├── auth.ts            # Auth utilities
│   │   ├── email.ts           # Email service + OTP
│   │   ├── receipt-records.ts # Receipt operations
│   │   ├── gsap-setup.ts      # Animation library
│   │   ├── mock-data.ts       # Test data generator
│   │   └── utils.ts           # Common utilities
│   │
│   ├── types/                 # TypeScript definitions
│   │   └── index.ts           # Shared types
│   │
│   ├── middleware.ts          # Authentication middleware
│   └── index.css              # Global styles
│
├── prisma/
│   ├── schema.prisma          # Database schema (13 models)
│   ├── seed.js                # Initial data seeding
│   ├── seed-receipts.js       # Test data generator
│   └── migrations/            # Database migrations
│
├── public/                    # Static assets
│   └── images/
│
├── .env.local                 # Environment variables
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── next.config.js             # Next.js config
├── tailwind.config.ts         # Tailwind styling
├── postcss.config.js          # PostCSS config
├── DATABASE_SETUP.md          # Database setup guide
└── README.md                  # This file
```

---

## 🛠️ Technology Stack

| Layer              | Technology          | Purpose                      |
| ------------------ | ------------------- | ---------------------------- |
| **Framework**      | Next.js 16.1        | Full-stack React framework   |
| **Language**       | TypeScript          | Type-safe development        |
| **Database**       | PostgreSQL (Neon)   | Cloud-hosted relational DB   |
| **ORM**            | Prisma 5.22         | Database abstraction layer   |
| **Styling**        | Tailwind CSS 3.4    | Utility-first CSS            |
| **UI Components**  | shadcn/ui + Radix   | Headless component library   |
| **Auth**           | JWT + bcryptjs      | Secure authentication        |
| **Validation**     | Zod                 | TypeScript-first validation  |
| **3D Graphics**    | Three.js + R3F      | 3D data visualization        |
| **Animations**     | GSAP 3.14           | Advanced animations          |
| **Forms**          | React Hook Form     | Efficient form handling      |
| **Notifications**  | Sonner              | Toast notifications          |
| **Date Handling**  | date-fns            | Date utilities               |
| **Icons**          | Lucide React        | Icon library                 |
| **Email**          | Nodemailer          | Email service (OTP, alerts)  |

---

## 💾 Database Schema (13 Models)

### Entity Relationship Diagram

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER : has
    ORGANIZATION ||--o{ WAREHOUSE : manages
    ORGANIZATION ||--o{ ITEM : contains
    ORGANIZATION ||--o{ CATEGORY : defines
    ORGANIZATION ||--o{ RECEIPT : has
    ORGANIZATION ||--o{ DELIVERY : has
    ORGANIZATION ||--o{ TRANSACTION : logs

    WAREHOUSE ||--o{ LOCATION : contains
    LOCATION ||--o{ STOCK : holds
    
    ITEM ||--o{ STOCK : stored_in
    ITEM ||--o{ RECEIPT_LINE : in_receipt
    ITEM ||--o{ DELIVERY_LINE : in_delivery
    ITEM ||--o{ TRANSACTION : tracked
    ITEM }o--|| CATEGORY : categorized_by

    RECEIPT ||--o{ RECEIPT_LINE : contains
    RECEIPT }o--|| WAREHOUSE : received_at
    RECEIPT }o--|| USER : created_by

    DELIVERY ||--o{ DELIVERY_LINE : contains
    DELIVERY }o--|| WAREHOUSE : shipped_from
    DELIVERY }o--|| USER : created_by

    LOCATION ||--o{ TRANSACTION : has_transactions

    TRANSACTION }o--|| ITEM : moves
    TRANSACTION }o--|| USER : recorded_by

    USER }o--|| ORGANIZATION : belongs_to
```

### Complete Data Model

```mermaid
graph TB
    subgraph "Core Models"
        ORG["📊 Organization<br/>Multi-tenancy root<br/>id, name, inviteCode"]
        
        USER["👤 User<br/>email, name, password<br/>role, verified, organizationId"]
        
        CATEGORY["🏷️ Category<br/>name, organizationId<br/>for grouping items"]
        
        ITEM["📦 Item<br/>sku, name, description<br/>uom, minStock, categoryId"]
    end

    subgraph "Warehouse Infrastructure"
        WAREHOUSE["🏭 Warehouse<br/>name, shortCode, address<br/>organizationId"]
        
        LOCATION["📍 Location<br/>name, shortCode<br/>warehouseId"]
        
        STOCK["📊 Stock<br/>quantity (current level)<br/>itemId, locationId"]
    end

    subgraph "Inbound Operations"
        RECEIPT["📥 Receipt<br/>reference, supplierName<br/>status, warehouseId<br/>createdBy, organizationId"]
        
        RECEIPT_LINE["↳ ReceiptLine<br/>itemId, quantity<br/>receiptId"]
    end

    subgraph "Outbound Operations"
        DELIVERY["📤 Delivery<br/>reference, destination<br/>status, warehouseId<br/>createdBy, organizationId"]
        
        DELIVERY_LINE["↳ DeliveryLine<br/>itemId, quantity<br/>deliveryId"]
    end

    subgraph "Transaction Audit"
        TRANSACTION["📋 Transaction<br/>reference, type<br/>quantity, notes<br/>fromLocationId, toLocationId<br/>createdBy, organizationId"]
    end

    ORG --> USER
    CATEGORY --> ITEM
    ITEM --> STOCK
    WAREHOUSE --> LOCATION
    LOCATION --> STOCK
    
    RECEIPT --> RECEIPT_LINE
    RECEIPT_LINE --> ITEM
    RECEIPT --> WAREHOUSE
    RECEIPT --> USER
    
    DELIVERY --> DELIVERY_LINE
    DELIVERY_LINE --> ITEM
    DELIVERY --> WAREHOUSE
    DELIVERY --> USER
    
    ITEM --> TRANSACTION
    LOCATION --> TRANSACTION
    USER --> TRANSACTION
    TRANSACTION --> ITEM
    
    style ORG fill:#22c55e,color:#fff
    style USER fill:#3b82f6,color:#fff
    style WAREHOUSE fill:#f59e0b,color:#fff
    style RECEIPT fill:#10b981,color:#fff
    style DELIVERY fill:#ef4444,color:#fff
    style TRANSACTION fill:#8b5cf6,color:#fff
```

### Model Details Table

| Model              | Purpose                   | Key Fields                                                        | Relations              |
| ------------------ | ------------------------- | ----------------------------------------------------------------- | ---------------------- |
| **Organization**   | Multi-tenancy root        | id, name, inviteCode (unique)                                     | → Users, Warehouses    |
| **User**           | Auth + permissions        | email, name, password, role (SUPER_ADMIN/MANAGER/WAREHOUSE_STAFF) | → Organization         |
| **Warehouse**      | Physical facility         | name, shortCode, address, organizationId                          | → Locations, Receipts  |
| **Location**       | Storage shelf/zone        | name, shortCode, warehouseId                                      | → Stocks, Transactions |
| **Category**       | Item classification       | name, organizationId                                              | → Items                |
| **Item**           | Inventory product         | sku (unique), name, description, uom, minStock, categoryId        | → Stocks, Receipts     |
| **Stock**          | Real-time quantity        | itemId, locationId, quantity (auto-calculated)                    | ← Item, Location       |
| **Receipt**        | Inbound shipment record   | reference, supplierName, status (DRAFT→READY→DONE), warehouseId   | → ReceiptLines         |
| **ReceiptLine**    | Receipt line item         | itemId, receiptId, quantity                                       | ← Receipt, Item        |
| **Delivery**       | Outbound shipment record  | reference, destination, status (DRAFT→READY→DONE), warehouseId    | → DeliveryLines        |
| **DeliveryLine**   | Delivery line item        | itemId, deliveryId, quantity                                      | ← Delivery, Item       |
| **Transaction**    | Movement audit log        | reference, type (IN/OUT/TRANSFER/ADJUSTMENT), itemId, quantity    | ← Item, Locations      |

---

## 🌐 API Architecture

### API Route Structure

```mermaid
graph TB
    subgraph "Authentication"
        A1["/api/auth/signup"]
        A2["/api/auth/login"]
        A3["/api/auth/me"]
        A4["/api/auth/verify"]
    end

    subgraph "Products & Categories"
        P1["/api/products"]
        P2["/api/products/[id]"]
        P3["/api/products/meta"]
        P4["/api/categories"]
        P5["/api/items"]
    end

    subgraph "Warehouse Operations"
        W1["/api/warehouses"]
        W2["/api/warehouses/[id]"]
        W3["/api/stock"]
        W4["/api/stock/[id]"]
    end

    subgraph "Receipts & Deliveries"
        RD1["/api/receipts"]
        RD2["/api/receipts/[id]"]
        RD3["/api/deliveries"]
        RD4["/api/deliveries/[id]"]
    end

    subgraph "Transactions & Transfers"
        T1["/api/transactions"]
        T2["/api/transactions/[id]"]
        T3["/api/transfers"]
        T4["/api/transfers/[id]"]
    end

    subgraph "System"
        S1["/api/health"]
        S2["/api/dashboard"]
        S3["/api/me"]
    end

    style A1 fill:#3b82f6,color:#fff
    style P1 fill:#10b981,color:#fff
    style W1 fill:#f59e0b,color:#fff
    style RD1 fill:#ef4444,color:#fff
    style T1 fill:#8b5cf6,color:#fff
    style S1 fill:#6b7280,color:#fff
```

### API Endpoints Summary

| Category       | Routes      | Purpose                                                  |
| -------------- | ----------- | -------------------------------------------------------- |
| **Health**     | 1 route     | `/api/health` — System status check                      |
| **Auth**       | 4 routes    | Login, signup, verify, current user                      |
| **Products**   | 5 routes    | Product CRUD, search, filters, metadata                  |
| **Categories** | 2 routes    | Category management                                      |
| **Warehouses** | 2 routes    | Warehouse CRUD, location management                      |
| **Stock**      | 4 routes    | Real-time stock levels, adjustments, warnings            |
| **Receipts**   | 2 routes    | Inbound shipment tracking (create, validate, list)       |
| **Deliveries** | 2 routes    | Outbound shipment tracking (create, validate, list)      |
| **Transfers**  | 2 routes    | Internal stock movements between locations               |
| **Transactions** | 2 routes  | Complete audit trail, filtered by type                   |
| **Dashboard**  | 1 route     | Real-time KPIs and statistics                            |
| **Users**      | 1 route     | User management endpoints                                |

---

## 🏗️ Key Features & Modules

### 🔐 Authentication & Authorization

```mermaid
flowchart TD
    Signup["📝 Signup"]
    Login["🔑 Login"]
    OTP["📨 OTP Verification"]
    JWT["🎫 JWT Token<br/>HttpOnly Cookie"]
    Role["👤 Role-Based Access<br/>SUPER_ADMIN<br/>MANAGER<br/>WAREHOUSE_STAFF"]
    
    Signup -->|Email + Password| OTP
    OTP -->|Verified| JWT
    
    Login -->|Email + Password| JWT
    
    JWT -->|Decode & Verify| Role
    Role -->|Route Protection| Dashboard["✅ Dashboard Access"]
    
    style Signup fill:#3b82f6,color:#fff
    style Login fill:#3b82f6,color:#fff
    style OTP fill:#10b981,color:#fff
    style JWT fill:#8b5cf6,color:#fff
    style Role fill:#f59e0b,color:#fff
```

**Authentication Methods:**
- Email + Password with bcryptjs hashing
- OTP-based email verification
- JWT tokens via HttpOnly cookies
- Role-based middleware protection

**User Roles:**
- **SUPER_ADMIN** — Full system access, manage users
- **MANAGER** — Create receipts/deliveries, manage inventory
- **WAREHOUSE_STAFF** — View-only access, confirm operations

### 📊 Dashboard

Real-time metrics and analytics:

- **Total Products** — Count of all items in catalog
- **Low Stock Alert** — Items below minimum threshold
- **Pending Receipts** — Awaiting validation
- **Pending Deliveries** — Ready to ship
- **Stock Value** — Total inventory value
- **Recent Transactions** — Last 10 movements
- **Category Breakdown** — Items per category
- **Movement Charts** — IN/OUT trends

### 📦 Product Management

Full CRUD operations with:

- **SKU Management** — Unique identifier per product
- **Category Tagging** — Organize by type
- **Unit of Measure** — UNIT, KG, LITRE, BOX, METRE
- **Min Stock Alerts** — Reorder point configuration
- **Bulk Operations** — Import/export capabilities
- **Stock Status Badges** — IN_STOCK / LOW_STOCK / OUT_OF_STOCK

### 📥 Receipt Management (Inbound)

Track incoming shipments:

```
DRAFT → WAITING → READY → DONE
  ↓         ↓        ↓      ↓
[New]    [Qty]   [Confirm] [Complete]
```

- **Auto-increment References** — REC/YYYY/00001 format
- **Line Items** — Flexible product quantities
- **Supplier Tracking** — Supplier metadata
- **Status Pipeline** — Standard workflow
- **Stock Sync** — Automatic on validation

### 📤 Delivery Management (Outbound)

Track outgoing shipments:

```
DRAFT → WAITING → READY → DONE
  ↓         ↓        ↓      ↓
[New]    [Qty]   [Confirm] [Complete]
```

- **Auto-increment References** — DEL/YYYY/00001 format
- **Destination Tracking** — Shipping address
- **Stock Deduction** — Automatic on validation
- **Status Pipeline** — Standard workflow
- **Transaction Logging** — Audit trail

### 📋 Stock Ledger & Audit Trail

Complete movement history:

- **Transaction Types** — IN / OUT / TRANSFER / ADJUSTMENT
- **Full Audit** — Who, What, When, Where
- **Searchable** — By item, warehouse, date range
- **Time-Stamped** — Exact timestamp on each move
- **Reference Tracking** — Link to originating document

### 🏭 Warehouse & Location Management

Multi-warehouse support:

- **Warehouse Creation** — Multiple facilities
- **Location Definition** — Racks, shelves, zones
- **Address Tracking** — Physical location info
- **Stock Levels** — Per warehouse visibility
- **Transfer Between Locations** — Within warehouse

### 🔄 Internal Transfers

Move stock without leaving company:

- **Location to Location** — Within warehouse
- **Warehouse to Warehouse** — Between facilities
- **Audit Logged** — Full transaction record
- **Auto-quantity Update** — Automatic calculation

### 📈 Stock Adjustments

Physical count reconciliation:

- **Manual Reconciliation** — Count vs. System
- **Variance Tracking** — Damage, expiry, loss
- **Reason Code** — Document why
- **Notes Field** — Additional details
- **Transaction Creation** — Audit trail

### 👥 User Management (SUPER_ADMIN)

Manage team members:

- **User List** — All team members
- **Role Assignment** — SUPER_ADMIN / MANAGER / WAREHOUSE_STAFF
- **Email Verification** — Verify access
- **Activity Logging** — Track actions
- **User Deactivation** — Soft delete

---

## 🔄 Core Workflows

### Receipt Validation Flow

```mermaid
sequenceDiagram
    participant M as Manager
    participant APP as CoreInventory
    participant DB as PostgreSQL
    participant STOCK as Stock Table
    
    M->>APP: Create Receipt (Draft)
    APP->>DB: Save Receipt Record
    
    M->>APP: Add Line Items
    APP->>DB: Save ReceiptLines
    
    M->>APP: Move to READY
    APP->>DB: Update Receipt Status
    
    M->>APP: Validate Receipt
    APP->>APP: Calculate Total Qty per Item
    
    loop For Each Line Item
        APP->>STOCK: Check Location Exists
        APP->>STOCK: Increment Stock by Qty
        APP->>DB: Create IN Transaction
    end
    
    APP->>DB: Mark Receipt as DONE
    APP-->>M: Confirmation Toast
```

### Delivery Fulfillment Flow

```mermaid
sequenceDiagram
    participant M as Manager
    participant APP as CoreInventory
    participant DB as PostgreSQL
    participant STOCK as Stock Table
    
    M->>APP: Create Delivery (Draft)
    APP->>DB: Save Delivery Record
    
    M->>APP: Add Line Items
    APP->>DB: Check Stock Available
    
    M->>APP: Move to READY
    APP->>DB: Update Delivery Status
    
    M->>APP: Validate Delivery
    
    loop For Each Line Item
        APP->>STOCK: Check Stock >= Qty
        APP->>STOCK: Decrement Stock by Qty
        APP->>DB: Create OUT Transaction
    end
    
    opt Stock Insufficient
        APP-->>M: Error: Insufficient Stock
    end
    
    APP->>DB: Mark Delivery as DONE
    APP-->>M: Confirmation Toast
```

### Stock Adjustment Flow

```mermaid
sequenceDiagram
    participant M as Manager
    participant APP as CoreInventory
    participant DB as PostgreSQL
    
    M->>APP: Open Adjustment Form
    M->>APP: Select Item & Location
    M->>APP: Enter Counted Quantity
    
    APP->>DB: Get Current System Qty
    APP->>APP: Calculate Variance = System - Count
    
    M->>APP: Enter Reason (Damage/Expiry/Loss)
    M->>APP: Add Notes
    
    M->>APP: Submit Adjustment
    APP->>DB: Create ADJUSTMENT Transaction
    APP->>DB: Sync Stock to Counted Qty
    
    APP-->>M: Adjustment Complete Toast
```

---

## 🎨 Client-Side State Management

### Authentication Flow

```mermaid
flowchart TB
    subgraph "Auth State"
        AM["Auth Middleware<br/>Checks JWT Token"]
        PC["Parse Payload<br/>Extract userId, role"]
        STORE["Store in Context<br/>Available to all pages"]
    end
    
    subgraph "Protected Routes"
        DASH["📊 Dashboard"]
        PRODUCTS["📦 Products"]
        RECEIPTS["📥 Receipts"]
        DELIVERY["📤 Delivery"]
    end
    
    subgraph "Public Routes"
        LOGIN["🔑 Login"]
        SIGNUP["📝 Signup"]
    end
    
    AM -->|Valid Token| PC
    PC -->|Success| STORE
    STORE -->|Access| DASH
    STORE -->|Access| PRODUCTS
    STORE -->|Access| RECEIPTS
    STORE -->|Access| DELIVERY
    
    AM -->|No Token| REDIRECT["Redirect to Login"]
    REDIRECT -->|User goes to| LOGIN
    LOGIN -->|Authenticate| SIGNUP
    
    style AM fill:#8b5cf6,color:#fff
    style STORE fill:#10b981,color:#fff
    style REDIRECT fill:#ef4444,color:#fff
```

### Component Data Fetching Pattern

```mermaid
flowchart TD
    PAGE["📄 Page Component<br/>Server Component"]
    
    FETCH["🔄 Fetch Data<br/>Server Action or API"]
    
    PASS["📦 Pass to Client<br/>As Props"]
    
    CLIENT["⚛️ Client Component<br/>Interactive"]
    
    MUTATION["🔧 Mutation<br/>Update via Server Action"]
    
    INVALIDATE["♻️ Revalidate<br/>Refetch Data"]
    
    PAGE -->|Async| FETCH
    FETCH -->|Initial Data| PASS
    PASS -->|Render| CLIENT
    
    CLIENT -->|User Action| MUTATION
    MUTATION -->|Update DB| INVALIDATE
    INVALIDATE -->|Refresh| FETCH
    
    style PAGE fill:#3b82f6,color:#fff
    style FETCH fill:#10b981,color:#fff
    style CLIENT fill:#f59e0b,color:#fff
    style MUTATION fill:#ef4444,color:#fff
```

---

## 🔌 External Service Integration

### Email Service

- **Service:** Nodemailer (Gmail)
- **Use Cases:**
  - OTP verification during signup
  - Low stock alerts
  - Receipt/Delivery confirmations
  - User account notifications

### Database Connection

```mermaid
flowchart LR
    APP["Next.js<br/>App"] --> SINGLETON["📌 Prisma<br/>Singleton<br/>Pattern"]
    
    SINGLETON -->|Check Cache| CACHED["✅ Connection<br/>Cached?"]
    
    CACHED -->|Yes| RETURN["Return<br/>Existing"]
    
    CACHED -->|No| DNS["🌐 Google DNS<br/>8.8.8.8"]
    
    DNS -->|Resolve| NEON["🔗 Neon<br/>PostgreSQL"]
    
    NEON -->|Connect| CACHE["💾 Cache<br/>Connection"]
    
    CACHE -->|Return| RETURN
    
    style SINGLETON fill:#8b5cf6,color:#fff
    style NEON fill:#f59e0b,color:#fff
    style CACHE fill:#10b981,color:#fff
```

**Connection Features:**
- Connection pooling via Neon
- Automatic retry with exponential backoff
- DNS fallback (Google 8.8.8.8)
- IPv4 prioritization
- Extended timeout for unstable networks

---

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Layers"
        L1["🌐 Request"]
        L2["🔐 Middleware<br/>JWT Verification"]
        L3["🛡️ Authorization<br/>Role Check"]
        L4["✔️ Validation<br/>Input Zod Schema"]
        L5["💾 Database<br/>Prisma ORM"]
        L6["📊 Response"]
    end
    
    subgraph "Security Features"
        F1["HttpOnly Cookies"]
        F2["Role-Based Access"]
        F3["Input Sanitization"]
        F4["SQL Injection Prevention"]
        F5["CORS Headers"]
    end
    
    L1 --> L2
    L2 --> F1
    L2 --> L3
    L3 --> F2
    L3 --> L4
    L4 --> F3
    L4 --> L5
    L5 --> F4
    L5 --> L6
    L6 --> F5
    
    style L2 fill:#ef4444,color:#fff
    style L3 fill:#ef4444,color:#fff
    style L4 fill:#ef4444,color:#fff
    style F1 fill:#10b981,color:#fff
    style F2 fill:#10b981,color:#fff
```

**Security Measures:**

- **Password Hashing** — bcryptjs with salt rounds
- **JWT Tokens** — HttpOnly, Secure cookies
- **Middleware Protection** — All protected routes verified
- **Role-Based Access** — RBAC on all operations
- **Input Validation** — Zod schemas on all inputs
- **SQL Injection Prevention** — Prisma parameterized queries
- **CORS** — Next.js built-in protection
- **Environment Variables** — Secrets never in code

---

## 📁 Directory Details

### `/src/app` - Pages Structure

| Path                    | Component                | Purpose                     |
| ----------------------- | ------------------------ | --------------------------- |
| **(auth)/login**        | Login page               | Email + password entry      |
| **(auth)/signup**       | Signup page              | New account creation        |
| **(dashboard)**         | Layout + sidebar         | Protected dashboard wrapper |
| **(dashboard)/page**    | Dashboard home           | KPIs + recent activity      |
| **(dashboard)/products** | Products page            | Inventory listing           |
| **(dashboard)/receipts** | Receipts page            | Inbound shipments           |
| **(dashboard)/deliveries** | Deliveries page         | Outbound shipments          |
| **(dashboard)/inventory** | Inventory page          | Stock by warehouse          |
| **(dashboard)/stock-ledger** | Ledger page           | All transactions            |
| **(dashboard)/transfers** | Transfers page          | Internal movements          |
| **(dashboard)/adjustments** | Adjustments page       | Stock reconciliation        |
| **(dashboard)/warehouses** | Warehouses page        | Facility management         |
| **(dashboard)/users**   | Users page (admin)       | Team member management      |

### `/src/actions` - Server Actions

| File                  | Functions              | Purpose                        |
| --------------------- | ---------------------- | ------------------------------ |
| `auth.actions.ts`     | signUp, logIn, logOut  | Authentication logic           |
|                       | getCurrentUser         | Get current user info          |
|                       | verifyOTP              | Email verification             |
| `users.actions.ts`    | getAllUsers            | Fetch user list                |
|                       | updateUserRole         | Change user role               |
|                       | deleteUser             | Remove user from system        |

### `/src/components` - React Components

| File                    | Purpose                      | Type          |
| ----------------------- | ---------------------------- | ------------- |
| `AppSidebar.tsx`        | Main navigation sidebar      | Client        |
| `Header.tsx`            | Top bar with user menu       | Client        |
| `Overview.tsx`          | Dashboard home component     | Client        |
| `KPICard.tsx`           | Metric display cards         | Client        |
| `Charts.tsx`            | Analytics graphs             | Client        |
| `ActivityTable.tsx`     | Recent movements table       | Client        |
| `Hero3D.tsx`            | 3D inventory visualization   | Client        |

### `/src/lib` - Utilities

| File                    | Purpose                      |
| ----------------------- | ---------------------------- |
| `db.ts`                 | Prisma singleton connection  |
| `auth.ts`               | Authentication middlewares   |
| `email.ts`              | OTP + email utilities        |
| `receipt-records.ts`    | Receipt CRUD operations      |
| `gsap-setup.ts`         | GSAP animation configuration |
| `mock-data.ts`          | Seeding data generator       |
| `utils.ts`              | Common helper functions      |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Git

### Installation Steps

**1. Clone Repository**

```bash
git clone <repository-url>
cd CoreInventory
```

**2. Install Dependencies**

```bash
npm install
```

**3. Set Up Environment**

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure the following in `.env.local`:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production-123456

# Application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Organization
ORG_ACCESS_KEY=core-inventory-2026

# Email Service (Optional - for OTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**4. Set Up Database**

```bash
# Run migrations
npm run db:push

# Seed initial data
npm run db:seed
```

**5. Start Development Server**

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Test Credentials

**Admin Account (Pre-seeded):**

| Email                     | Password      | Role        |
| ------------------------- | ------------- | ----------- |
| baluduvamsi2000@gmail.com | Vamsi@08      | SUPER_ADMIN |

**Creating Additional Accounts:**

As the SUPER_ADMIN, you can create Manager and Warehouse Staff accounts:

1. Login with admin credentials above
2. Navigate to **Settings** → **Users**
3. Click **Create User**
4. Provide email and temporary password
5. Share invite code (MGR-CORE-2026 for managers, STAFF-INV-2026 for staff)
6. New user signs up with shared credentials and invite code

---

## 📝 Database Setup

### PostgreSQL Configuration

**For Neon (Recommended):**

1. Visit [neon.tech](https://neon.tech)
2. Create free account and project
3. Copy connection string
4. Add to `.env.local`:

```env
DATABASE_URL=postgresql://neondb_owner:npg_xxxxx@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**For Local PostgreSQL:**

1. Create database:

```bash
createdb coreinventory
```

2. Set `.env.local`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/coreinventory
```

### Running Migrations

```bash
# Create new migration
npm run db:migrate

# Apply migrations
npm run db:push

# Open Prisma Studio
npm run db:studio
```

---

## 🎯 Core Features Summary

### ✅ Implemented Features

- [x] User authentication (email/password + OTP)
- [x] Role-based access control (SUPER_ADMIN, MANAGER, WAREHOUSE_STAFF)
- [x] Product management (CRUD, categories, SKU)
- [x] Receipt management (inbound shipments)
- [x] Delivery management (outbound shipments)
- [x] Stock tracking (real-time levels by location)
- [x] Internal transfers (location to location)
- [x] Stock adjustments (reconciliation)
- [x] Transaction audit trail (complete history)
- [x] Dashboard KPIs (real-time metrics)
- [x] Multi-warehouse support
- [x] User management (SUPER_ADMIN only)
- [x] Email notifications (OTP, alerts)
- [x] 3D visualization (Hero component)
- [x] GSAP animations
- [x] TypeScript type safety
- [x] Responsive design (Tailwind CSS)
- [x] shadcn/ui components
- [x] Zod validation

### 🔮 Future Enhancements

- [ ] Advanced reporting (Excel export)
- [ ] Barcode/QR code scanning
- [ ] Mobile app (React Native)
- [ ] Real-time WebSocket updates
- [ ] Inventory forecasting (ML)
- [ ] Multi-language support
- [ ] Webhook integrations
- [ ] Two-factor authentication
- [ ] Advanced permissions system
- [ ] Supplier management

---

## 🔨 Build & Deployment

### Build for Production

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build

# Start production server
npm run start
```

### Environment Variables for Production

Ensure these are set in your production environment:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-key-min-32-chars>
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<another-strong-random-key>
ORG_ACCESS_KEY=<your-org-key>
EMAIL_SERVICE=gmail
EMAIL_USER=<service-account-email>
EMAIL_PASSWORD=<app-password>
NODE_ENV=production
```

### Deployment Options

| Platform      | Guide                                        | Difficulty |
| ------------- | -------------------------------------------- | ---------- |
| **Vercel**    | Connect GitHub repo, auto-deploy             | Easy       |
| **Netlify**   | Connect GitHub, configure build commands     | Easy       |
| **Railway**   | Docker support, PostgreSQL included          | Medium     |
| **Render**    | Similar to Railway, free tier available      | Medium     |
| **AWS**       | EC2 + RDS, more control but complex          | Hard       |
| **DigitalOcean** | Droplets + managed DB, good balance        | Medium     |

---

## 🛠️ Development Guide

### Adding a New Feature

**Step 1: Update Database Schema**

```prisma
// prisma/schema.prisma
model MyNewModel {
  id        String   @id @default(cuid())
  name      String
  // ... fields
}
```

**Step 2: Generate Prisma Client**

```bash
npx prisma generate
```

**Step 3: Create Migration**

```bash
npm run db:migrate
```

**Step 4: Add API Route**

```typescript
// src/app/api/myfeature/route.ts
export async function GET(request: NextRequest) {
  // Implementation
}
```

**Step 5: Create Server Action**

```typescript
// src/actions/myfeature.actions.ts
'use server'
export async function myAction() {
  // Implementation
}
```

**Step 6: Build UI Component**

```tsx
// src/components/features/MyFeature.tsx
export function MyFeature() {
  // Implementation
}
```

**Step 7: Add Page Route**

```tsx
// src/app/(dashboard)/myfeature/page.tsx
export default function MyFeaturePage() {
  return <MyFeature />
}
```

### Testing Checklist

Before deployment:

- [ ] All API endpoints tested (GET, POST, PUT, DELETE)
- [ ] Authentication flow works end-to-end
- [ ] Stock calculations are accurate
- [ ] Transactions logged correctly
- [ ] Audit trail complete
- [ ] Edge cases handled (null values, zero qty)
- [ ] Error messages clear and actionable
- [ ] Performance acceptable (< 2s load time)
- [ ] Mobile responsive on 320px+ screens
- [ ] Security validations passed (OWASP top 10)

---

## 📊 API Response Format

All API routes follow consistent response format:

### Success Response

```json
{
  "success": true,
  "data": { /* Response data */ }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Example: Get Products

**Request:**

```bash
GET /api/products?search=SKU123&category=Category1
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cuid-123",
      "sku": "SKU123",
      "name": "Product Name",
      "category": "Category1",
      "totalStock": 150,
      "minStock": 10,
      "status": "IN_STOCK"
    }
  ]
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open Pull Request

### Code Standards

- Use TypeScript for all `.ts` and `.tsx` files
- Follow existing code style
- Add tests for new features
- Update documentation
- Use meaningful commit messages

---

## 📞 Support & Documentation

- **Issues:** Open an issue on GitHub
- **Documentation:** See [DATABASE_SETUP.md](DATABASE_SETUP.md) and [TEAMWORK_FLOW.md](TEAMWORK_FLOW.md)
- **Email:** [Contact the team](mailto:support@coreinventory.dev)

---

## 📄 License

MIT License — See LICENSE file for details

---

## 🎯 Project Statistics

| Metric                 | Count |
| ---------------------- | ----- |
| **Database Models**    | 13    |
| **API Routes**         | 12    |
| **Pages/Routes**       | 15+   |
| **React Components**   | 40+   |
| **Server Actions**     | 20+   |
| **TypeScript Files**   | 80+   |
| **Total LOC (TS/TSX)** | 15K+  |
| **Dependencies**       | 35    |

---

## 🏆 Tech Stack Highlights

```mermaid
graph TB
    NX["Next.js 16<br/>App Router"]
    TS["TypeScript<br/>Type Safety"]
    PG["PostgreSQL<br/>Neon Cloud"]
    PM["Prisma<br/>ORM"]
    TW["Tailwind<br/>Styling"]
    UI["shadcn/ui<br/>Components"]
    
    NX -->|Powers| TS
    TS -->|Queries| PM
    PM -->|Connects| PG
    TW -->|Styles| UI
    
    AUTH["JWT Auth<br/>Middleware"]
    GSAP["GSAP<br/>Animations"]
    TRY["Three.js<br/>3D Graphics"]
    
    AUTH -->|Secures| NX
    GSAP -->|Enhances| UI
    TRY -->|Visualizes| TS
    
    style NX fill:#22c55e,color:#fff
    style TS fill:#3b82f6,color:#fff
    style PG fill:#f59e0b,color:#fff
    style PM fill:#8b5cf6,color:#fff
```

---

## 📅 Version History

| Version | Date       | Changes                         |
| ------- | ---------- | ------------------------------- |
| 1.0.0   | 2026-03-15 | Initial release with core CRUD  |

---

## 🙏 Acknowledgments

Built with ❤️ by the CoreInventory Team

**Special Thanks To:**
- Next.js & React communities
- Prisma team
- shadcn/ui contributors
- Tailwind CSS
- Open-source contributors

---

**Happy Inventory Management! 📦** 

---

*For the latest version and updates, visit the [GitHub Repository](https://github.com/your-repo/coreinventory)*
