# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER / MOBILE                         │
│            Next.js 14 App (http://localhost:3000)               │
│   ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌───────────────┐   │
│   │  Home /  │ │ Cruise   │ │  Booking   │ │    Admin      │   │
│   │  Search  │ │  Detail  │ │   Wizard   │ │  Dashboard    │   │
│   └──────────┘ └──────────┘ └────────────┘ └───────────────┘   │
│            MUI Components + AuthContext (React)                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │  HTTP/REST + Session Cookie (cruise.sid)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              NestJS REST API (http://localhost:3001)             │
│  ┌──────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐  │
│  │  /auth   │ │/cruise │ │ /rooms  │ │/bookings │ │/admin  │  │
│  └──────────┘ └────────┘ └─────────┘ └──────────┘ └────────┘  │
│  ValidationPipe │ AuthGuard │ RolesGuard │ HttpExceptionFilter   │
│  Helmet │ CORS │ express-session │ Swagger UI                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │  TypeORM (pg driver)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL 16 Database                        │
│                                                                  │
│  users          ships           ports                            │
│  cruises        rooms           restaurants                      │
│  restaurant_slots shows         casino_events                    │
│  bookings       booking_items   user_sessions                    │
└─────────────────────────────────────────────────────────────────┘
```

## Database Entity Relationships

```
ports (6)
  └── cruises.departure_port_id
  └── cruises.destination_port_id

ships (3)
  └── cruises.ship_id
  └── rooms.ship_id
  └── restaurants.ship_id
  └── shows.ship_id
  └── casino_events.ship_id

cruises (4)
  └── bookings.cruise_id
  └── restaurant_slots.cruise_id
  └── shows.cruise_id
  └── casino_events.cruise_id

rooms
  └── bookings.room_id

users
  └── bookings.user_id

bookings
  └── booking_items.booking_id
      └── item_id → restaurant_slots | shows | casino_events
```

## Conflict Prevention Logic

**Application layer** (BookingsService.addActivity):
1. Load existing BookingItems for the booking
2. Filter items on the same date as the requested activity
3. Check if any existing item's [startTime, endTime] overlaps with the new item's times
4. If overlap → throw `ConflictException` with descriptive message
5. Otherwise → save item and increment `booked_count` on the activity

**Database layer** (capacity enforcement):
- Each activity has `capacity` and `booked_count` columns
- Before booking, verify `booked_count < capacity`
- On add, atomically increment `booked_count` via `Repository.increment()`

## Security Architecture

```
Request Flow:
Client → Helmet (headers) → CORS → express-session → NestJS
  → ValidationPipe (whitelist/sanitize)
  → AuthGuard (session check)
  → RolesGuard (role check)
  → Controller → Service → TypeORM → PostgreSQL
  → HttpExceptionFilter (no stack traces in response)
  → Logger (security events)
```

## Phase 6 – AI Integration (Future)

```
User Query
    ↓
/api/ai/itinerary (NestJS endpoint)
    ↓
Embed query text → voyage-3 embeddings (Voyage AI or Anthropic)
    ↓
pgvector similarity search → top-k matching cruise/activity docs
    ↓
Anthropic Claude API (claude-sonnet-4-5)
  system: "You are a helpful cruise planner. Use only the provided context."
  context: retrieved chunks
  user: original query
    ↓
Streaming response → frontend chat panel
```

## Deployment Architecture (March 29)

```
GitHub repo
    ├── main branch → Production
    └── dev branch  → Staging

Frontend (Vercel):
  - Auto-deploy on push to main
  - Environment variables: NEXT_PUBLIC_API_URL

Backend (Railway.app):
  - Docker container from Dockerfile
  - Environment variables: DB_*, SESSION_SECRET, NODE_ENV=production
  - Connects to Railway PostgreSQL addon

Database (Railway PostgreSQL):
  - Managed PostgreSQL 16
  - Auto-backups enabled
  - Run seed via Railway CLI: railway run npm run seed
```
