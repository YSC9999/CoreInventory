# 📚 CoreInventory Documentation Index

Complete documentation map for the CoreInventory project. Start here to navigate all available resources.

---

## 🎯 Quick Navigation

### 👤 For Different Roles

**I'm New to the Project**
1. Read: [README.md](README.md) — Project overview
2. Read: [TEAMWORK_FLOW.md](TEAMWORK_FLOW.md) — Feature specifications
3. Read: [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) — Setup instructions

**I'm a Developer**
1. Read: [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) — Quick start
2. Read: [API_REFERENCE.md](API_REFERENCE.md) — API endpoints
3. Read: [SCHEMA_REFERENCE.md](SCHEMA_REFERENCE.md) — Database schema
4. Read: [COMPONENT_ARCHITECTURE.md](COMPONENT_ARCHITECTURE.md) — UI components

**I'm a DevOps/Deployment**
1. Read: [DATABASE_SETUP.md](DATABASE_SETUP.md) — Database configuration
2. Read: [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md#-deployment) — Deployment section
3. Check: [.env.local](.env.local) — Configuration template

**I'm a Manager/Stakeholder**
1. Read: [README.md](README.md) — Project overview and features
2. Check: [Project Statistics](README.md#-project-statistics) — Metrics

---

## 📄 Documentation Files

### Core Documentation

| File                      | Purpose                                      | Audience          | Read Time |
| ------------------------- | -------------------------------------------- | ----------------- | --------- |
| **README.md**             | Project overview, features, architecture     | Everyone          | 10 min    |
| **TEAMWORK_FLOW.md**      | Feature specifications, user stories, design | Developers        | 15 min    |
| **DATABASE_SETUP.md**     | Database installation and configuration      | DevOps, Developers| 5 min     |

### Reference Documentation

| File                           | Purpose                                    | Audience          | Read Time |
| ------------------------------ | ------------------------------------------ | ----------------- | --------- |
| **API_REFERENCE.md**           | All API endpoints with examples            | Backend Dev       | 20 min    |
| **SCHEMA_REFERENCE.md**        | Database schema and data models            | Backend Dev       | 25 min    |
| **COMPONENT_ARCHITECTURE.md**  | React components and UI patterns           | Frontend Dev      | 20 min    |
| **DEVELOPMENT_GUIDE.md**       | Setup, development, testing, deployment    | All Developers    | 15 min    |

---

## 🗂️ Repository Structure

```
CoreInventory/
├── 📖 Documentation Files
│   ├── README.md                    ← Start here
│   ├── TEAMWORK_FLOW.md            ← Project specs
│   ├── DATABASE_SETUP.md           ← Database config
│   ├── API_REFERENCE.md            ← API docs
│   ├── SCHEMA_REFERENCE.md         ← Database schema
│   ├── COMPONENT_ARCHITECTURE.md   ← UI & components
│   ├── DEVELOPMENT_GUIDE.md        ← Development workflow
│   └── DOCS_INDEX.md               ← This file
│
├── 🔧 Configuration
│   ├── .env.local                  ← Environment variables
│   ├── package.json                ← Dependencies
│   ├── tsconfig.json               ← TypeScript config
│   ├── next.config.js              ← Next.js config
│   ├── tailwind.config.ts          ← Tailwind config
│   ├── postcss.config.js           ← PostCSS config
│   └── components.json             ← shadcn/ui config
│
├── 📂 Source Code (src/)
│   ├── app/                        ← Pages and API routes
│   ├── components/                 ← React components
│   ├── actions/                    ← Server actions
│   ├── lib/                        ← Utilities and helpers
│   ├── hooks/                      ← Custom React hooks
│   ├── types/                      ← TypeScript types
│   └── middleware.ts               ← Auth middleware
│
├── 🗄️ Database (prisma/)
│   ├── schema.prisma               ← Data model
│   ├── seed.js                     ← Initial seed data
│   ├── README.md                   ← Database info
│   └── migrations/                 ← SQL migrations
│
├── 📦 Public Assets
│   └── public/                     ← Static files
│
└── 📋 Project Files
    ├── package.json                ← NPM dependencies
    ├── package-lock.json           ← Dependency lock
    ├── .gitignore                  ← Git ignore rules
    └── .github/                    ← GitHub config (workflows, templates)
```

---

## 🔍 What to Read When

### Scenario 1: "I want to set up CoreInventory locally"

```
1. README.md → Quick Overview (5 min)
   ↓
2. DEVELOPMENT_GUIDE.md → Quick Start section (5 min)
   ↓
3. DATABASE_SETUP.md → Complete guide (10 min)
   ↓
4. Follow the setup steps
```

### Scenario 2: "I need to add a new API endpoint"

```
1. DEVELOPMENT_GUIDE.md → Task 2: Add API Endpoint (10 min)
   ↓
2. API_REFERENCE.md → Understand format (10 min)
   ↓
3. SCHEMA_REFERENCE.md → Check models (5 min)
   ↓
4. Code and test
```

### Scenario 3: "I need to add a new database model"

```
1. SCHEMA_REFERENCE.md → Understand current schema (10 min)
   ↓
2. DEVELOPMENT_GUIDE.md → Task 3: Add DB Model (10 min)
   ↓
3. DATABASE_SETUP.md → Migration reference (5 min)
   ↓
4. Add model and migrate
```

### Scenario 4: "I need to create a new page component"

```
1. DEVELOPMENT_GUIDE.md → Task 1: Add Page (10 min)
   ↓
2. COMPONENT_ARCHITECTURE.md → Page patterns (10 min)
   ↓
3. API_REFERENCE.md → Find relevant endpoints (10 min)
   ↓
4. Create and test component
```

### Scenario 5: "Code is broken, I need to debug"

```
1. DEVELOPMENT_GUIDE.md → Debugging section (5 min)
   ↓
2. Check error type (TypeScript, Runtime, API, etc.)
   ↓
3. Reference relevant doc (Schema? API? Component?)
   ↓
4. DEVELOPMENT_GUIDE.md → Troubleshooting section (5 min)
```

### Scenario 6: "I need to deploy to production"

```
1. DEVELOPMENT_GUIDE.md → Deployment section (15 min)
   ↓
2. DATABASE_SETUP.md → Production DB setup (10 min)
   ↓
3. Test build locally: npm run build
   ↓
4. Deploy to chosen platform
```

---

## 📊 Architecture Overview

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│ 🖥️  User Browser (Client)                                   │
│    ├── React Components                                     │
│    ├── Form State (react-hook-form)                         │
│    └── Client-side Routing (Next.js App Router)            │
└─────────────────────────────────────────────────────────────┘
                            ↕
              (HTTP/JSON, JWT Cookies)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ 🔧 Next.js App Server (Backend)                            │
│    ├── Server Components (RSC)                              │
│    ├── API Routes (/api/*)                                  │
│    ├── Server Actions                                       │
│    ├── Authentication Middleware                            │
│    └── Business Logic                                       │
└─────────────────────────────────────────────────────────────┘
                            ↕
              (Prisma ORM, SQL Queries)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ 🗄️  PostgreSQL Database (Neon Cloud)                        │
│    ├── Organization (Multi-tenancy root)                    │
│    ├── Users, Warehouses, Locations                         │
│    ├── Items, Stock, Categories                             │
│    ├── Receipts, Deliveries                                 │
│    └── Transactions (Audit Trail)                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (Button Click)
    ↓
Client Component (React)
    ↓
Server Action or API Fetch
    ↓
Next.js Server (Middleware → Auth Check)
    ↓
Business Logic (Validation, Calculation)
    ↓
Prisma ORM
    ↓
PostgreSQL Query
    ↓
Response JSON
    ↓
Client State Update
    ↓
UI Re-render
```

---

## 🔑 Key Concepts

### 🔐 Authentication
- **Mechanism:** JWT tokens in HttpOnly cookies
- **Reference:** [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) → State Management
- **Details:** [SCHEMA_REFERENCE.md](SCHEMA_REFERENCE.md) → User Model

### 📦 Inventory Movements
- **Types:** IN (Receipt), OUT (Delivery), TRANSFER, ADJUSTMENT
- **Reference:** [README.md](README.md) → Stock Ledger
- **Details:** [SCHEMA_REFERENCE.md](SCHEMA_REFERENCE.md) → Transaction Model

### 🏢 Multi-Warehousing
- **Structure:** Organization → Warehouse → Location → Stock
- **Reference:** [README.md](README.md) → Warehouse & Location Management
- **Details:** [SCHEMA_REFERENCE.md](SCHEMA_REFERENCE.md) → Warehouse & Location Models

### 📝 Server Actions
- **Purpose:** Direct server logic from client
- **Location:** `src/actions/`
- **Reference:** [COMPONENT_ARCHITECTURE.md](COMPONENT_ARCHITECTURE.md) → State Management

### 🎨 UI Components
- **Library:** shadcn/ui (Radix UI based)
- **Styling:** Tailwind CSS
- **Reference:** [COMPONENT_ARCHITECTURE.md](COMPONENT_ARCHITECTURE.md) → UI Components

---

## 🚀 Quick Commands

### Development

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run typecheck    # Type check
```

### Database

```bash
npm run db:push      # Apply migrations
npm run db:migrate   # Create new migration
npm run db:seed      # Seed test data
npm run db:studio    # Open Prisma Studio (http://localhost:5555)
```

### Utilities

```bash
npm install <pkg>    # Install new package
npm update           # Update all packages
npm uninstall <pkg>  # Remove package
```

---

## 📈 Feature Roadmap

### ✅ Implemented

- [x] User authentication (Email/Password + OTP)
- [x] Role-based access control
- [x] Product management (CRUD)
- [x] Receipt management (Inbound)
- [x] Delivery management (Outbound)
- [x] Stock tracking
- [x] Transaction audit trail
- [x] Dashboard KPIs
- [x] Multi-warehouse support
- [x] 3D visualization

### 🔮 Planned

- [ ] Advanced reporting (Excel export)
- [ ] Barcode/QR code scanning
- [ ] Mobile app (React Native)
- [ ] Real-time WebSocket updates
- [ ] Inventory forecasting (ML)
- [ ] Multi-language support
- [ ] API webhook integrations
- [ ] Two-factor authentication
- [ ] Advanced permissions system
- [ ] Supplier management

---

## 🤝 Contributing Guidelines

### Code Style

```typescript
// Use meaningful names
const userRole = "MANAGER";  // ✓ Good
const ur = "MANAGER";        // ✗ Avoid

// Use TypeScript types
function processItem(item: Item): Stock {  // ✓ Good
  // implementation
}

// Avoid any
const data: any = fetchData();  // ✗ Avoid
const data: FetchResult = fetchData();  // ✓ Good
```

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

Example:
```
feat: add low stock alerts

- Implement threshold checking
- Show badge on dashboard
- Send email notifications

Closes #123
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation

## Testing
How did you test this?

## Screenshots (if UI)
Before/After

## Checklist
- [ ] TypeScript passes
- [ ] No linting errors
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
```

---

## 📞 Support & Contact

- **Issues:** Open an issue on GitHub
- **Discussions:** GitHub Discussions
- **Email:** [support@coreinventory.dev](mailto:support@coreinventory.dev)
- **Documentation:** This file and linked documents

---

## 🔗 External Resources

### Technology Docs

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Deployment Platforms

- [Vercel](https://vercel.com/docs) (Recommended)
- [Railway](https://docs.railway.app/)
- [Render](https://render.com/docs)
- [AWS Amplify](https://docs.amplify.aws/)

### Database

- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [Neon Documentation](https://neon.tech/docs/)
- [Prisma Data Platform](https://www.prisma.io/data-platform/)

---

## 📊 Project Metrics

| Metric                | Value  |
| -------------------- | ------ |
| Database Models      | 13     |
| API Routes           | 12     |
| Pages                | 15+    |
| Components           | 40+    |
| Server Actions       | 20+    |
| TypeScript Files     | 80+    |
| Total LOC (TS/TSX)   | 15K+   |
| Dependencies         | 35     |
| TypeScript Version   | 5.x    |
| Node Version         | 18.17+ |
| React Version        | 19.2   |
| Next.js Version      | 16.1   |

---

## 📅 Version History

| Version | Date       | Notes                          |
| ------- | ---------- | ------------------------------ |
| 1.0.0   | 2026-03-15 | Initial release                |

---

## 🏆 Acknowledgments

Built with ❤️ using:
- Next.js & React
- Prisma & PostgreSQL
- Tailwind CSS
- shadcn/ui
- TypeScript
- GSAP & Three.js

---

## 📝 License

MIT License — See LICENSE file for details

---

**Last Updated:** March 15, 2026

**Next Steps:**
1. [Read the README](README.md)
2. [Follow the Development Guide](DEVELOPMENT_GUIDE.md)
3. [Set up your environment](DATABASE_SETUP.md)
4. Start coding! 🚀
