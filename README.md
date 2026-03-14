# CoreInventory

An inventory management system MVP built during an 8-hour hackathon.

## Quick Start

### Prerequisites
- Node.js 20.11+
- npm or yarn
- PostgreSQL database (Supabase/Neon recommended)

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env.local` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/coreinventory"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

3. **Initialize the database:**
```bash
npx prisma migrate dev --name init
```

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── inventory/     # Stock management
│   │   ├── locations/     # Location & delivery tracking
│   │   └── history/       # Transaction history
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Base UI components
│   └── features/          # Feature components
├── lib/                   # Utilities & integrations
├── types/                 # TypeScript definitions
└── prisma/                # Database schema
```

## Tech Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js v5
- **Validation:** Zod
- **Linting:** ESLint

## Features (MVP)

- ✅ User Authentication
- ⏳ Inventory Dashboard
- ⏳ Stock Management (Add/Edit/Delete)
- ⏳ Location Tracking
- ⏳ Transaction History
- ⏳ Delivery Management

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Development Notes

- Server Components (RSC) used by default for data fetching
- Client Components for interactive UI
- Server Actions for mutations with `revalidatePath`
- URL parameters for filtering & pagination

## Repository

[GitHub: CoreInventory](https://github.com/YSC9999/CoreInventory)

## Timeline

This project follows an 8-hour hackathon timeline:
- **Hour 0-1:** Planning & Setup ✅
- **Hour 1-3:** Core Foundation & Boilerplate
- **Hour 3-5:30:** Feature Implementation
- **Hour 5:30-7:** Integration & Polish
- **Hour 7-8:** Testing & Pitch Prep

---

**Created:** March 14, 2026  
**Team:** CoreInventory Hackathon Team
