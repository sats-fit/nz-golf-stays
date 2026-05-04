# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Is

NZ Golf Stays — a discovery platform for NZ golf courses that welcome motorhome overnight stays. Users filter courses by region, amenities (dogs, power), pricing type, and booking requirements. Authenticated users can save wishlists and submit new courses for admin approval.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

No test suite is configured.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY   # Client-side Maps JS API
GOOGLE_MAPS_API_KEY               # Server-side Geocoding API
```

## Architecture

**Stack**: Next.js 16 App Router, React 19, Supabase (Postgres + Auth + Storage), Tailwind CSS 4, Google Maps JS API.

### Data Flow

Courses are fetched **server-side** in `app/page.tsx` via `getCourses()` from `lib/supabase/queries.ts`, then passed down to client components. Filters live in **URL search params** (not React state) — `useFilters()` in `hooks/useFilters.ts` reads/writes them, enabling shareable URLs.

### Supabase Clients

Three clients with distinct roles — always pick the right one:
- `lib/supabase/client.ts` — browser singleton (user session, wishlist)
- `lib/supabase/server.ts` — SSR server component client (cookie-based session)
- `lib/supabase/admin.ts` — service role, bypasses RLS (admin approval only)

### Database Schema

Main table: `courses` with enums `pricing_type` (`free | free_with_green_fees | per_vehicle | per_person | donation`), `booking` (`walk_in | ask_first | must_book`), `dogs` (`yes | no | unknown`). Unapproved courses are hidden from public queries (`approved = false`). Supporting table: `wishlists` (user_id, course_id) with RLS.

Migrations live in `supabase/migrations/`. Run them directly against Supabase — there's no local Supabase instance.

### API Routes

| Route | Purpose |
|---|---|
| `GET /api/courses` | Filtered course listing (query params mirror `FilterState`) |
| `POST /api/courses` | Submit new course (Zod-validated, stored unapproved) |
| `PATCH /api/admin/approve` | Approve/reject course (requires admin session) |
| `GET /api/places/photo` | Proxy Google Place photos by `place_id` + `index` |
| `GET /auth/callback` | OAuth callback |
| `POST /auth/signout` | Sign out |

### Key Types

Defined in `lib/types.ts`: `Course`, `CourseInsert`, `FilterState`. Enum types `PricingType`, `BookingOption`, `DogsOption` match the Postgres enums.

Formatting helpers in `lib/utils.ts`: `pricingTypeLabel()`, `bookingLabel()`, `dogsLabel()`, `formatPhone()`, and `cn()` (clsx + tailwind-merge).

### Component Layout

The homepage has three view modes toggled by `ViewToggle`: split (list + map), map-only, list-only. `HomePage` detects mobile/tablet and renders `MobileLayout` vs the desktop split. `CourseDetailModal` overlays course details with a Google Map marker.

Photos are stored as Google Place photo references (`photo_references` column) and proxied through `/api/places/photo` — never fetched directly from the client to avoid exposing the API key.

### Scripts

`scripts/` contains one-off data import/backfill scripts (run with `npx ts-node --esm scripts/<file>.ts`). These use the service role key and write directly to Supabase.
