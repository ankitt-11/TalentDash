# TalentDash — Full-Stack Engineer Trial

India's compensation intelligence platform. Real salary data, comparable, decision-ready.

**Live URL**: https://talentdash.vercel.app  
**Tech Stack**: Next.js 15 · TypeScript · Tailwind CSS · Prisma · PostgreSQL (Neon) · Vercel

---

## Features

* **Salary Intelligence Dashboard**: Interactive data table with fast, URL-synced filtering.
* **Company Compensation Profiles**: Dedicated, SEO-optimized pages for individual companies displaying aggregate statistical insights.
* **Salary Comparison Tool**: Distinct vertical card layout calculating exact numerical and percentage deltas side-by-side.
* **Salary Submission Workflow**: Comprehensive ingestion API handling data normalization and validation.
* **Advanced Filtering & Sorting**: Filter instantly by company, role, level, location, and currency.
* **Real-Time Compensation Insights**: Dynamic calculation of true statistical median, highest/lowest TC, and level distributions.
* **SEO Optimized Pages**: Pre-generated static pages (SSG) injected with JSON-LD structured data.
* **Company Name Normalization**: Automated resolution of naming variations (e.g., "Google India" → "google").
* **Server-Side Validation**: Zod-enforced schemas ensuring strict data integrity and type safety.
* **Static Generation + ISR Architecture**: Hybrid rendering strategy balancing instantaneous LCP with fresh, dynamic data.

## Trial Requirements Coverage

### Backend
- [x] Prisma Schema (BigInt for INR, Enums for Level/Currency)
- [x] Salary Ingestion API (`POST /api/ingest-salary`)
- [x] Server-Side Validation (Zod schemas, strict type checking)
- [x] Pagination (Page-based with total count metadata)
- [x] Deduplication (Conflict detection via compound logic)
- [x] Company Normalization (Handling trailing spaces, capitalization, suffixes)

### Frontend
- [x] Global Dashboard (`/salaries`) with sticky header & KPI cards
- [x] Dynamic Filters (URL-synced state, debounce)
- [x] Company Profiles (`/companies/[slug]`)
- [x] Side-by-Side Comparison (`/compare` with Delta badges)
- [x] SaaS Design System (Strict typography, interactive hover states)
- [x] Responsive Layout (Mobile and tablet optimized)

### SEO
- [x] Dynamic Metadata (Title, Description, OpenGraph)
- [x] JSON-LD Structured Data (Dataset and Organization schemas)
- [x] Canonical URLs

### Deployment
- [x] Neon PostgreSQL Integration
- [x] Prisma Migrations
- [x] Vercel Hosting
- [x] Edge Caching & ISR configuration

## Application Screenshots

*Screenshots to be added post-deployment.*

### Salary Dashboard
![Salary Dashboard](./docs/salary-dashboard.png)

### Company Profile
![Company Profile](./docs/company-profile.png)

### Compare Tool
![Compare Tool](./docs/compare-tool.png)

### Submit Salary Form
![Submit Salary Form](./docs/submit-salary.png)

---

## Quick Start (Under 5 Minutes)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/talentdash.git
cd talentdash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://username:password@host.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://username:password@host.neon.tech/dbname?sslmode=require"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Get your Neon connection strings at [neon.tech](https://neon.tech).

### 3. Set Up Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed with 65+ records
npx prisma db seed
```

### 4. Start Dev Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout (Inter font, Navbar)
│   ├── page.tsx             # Homepage (ISR revalidate:3600)
│   ├── not-found.tsx        # Global 404
│   ├── salaries/
│   │   └── page.tsx         # Salary table (RSC + client filters)
│   ├── companies/
│   │   └── [slug]/
│   │       ├── page.tsx     # Company page (generateStaticParams from DB)
│   │       └── not-found.tsx
│   ├── compare/
│   │   └── page.tsx         # Compare page (use client)
│   └── api/
│       ├── ingest-salary/route.ts
│       ├── salaries/route.ts
│       ├── companies/[slug]/route.ts
│       └── compare/route.ts
├── components/
│   ├── ui/                  # Primitive components (custom Tailwind)
│   └── features/            # Feature-level components
├── lib/
│   ├── db.ts                # Prisma singleton
│   ├── normalise.ts         # Company name normalisation
│   ├── salary.ts            # TC computation, median, level distribution
│   ├── format.ts            # INR lakh/crore formatting, USD, delta
│   ├── seo.ts               # Metadata builders, JSON-LD
│   ├── validation.ts        # Zod schemas
│   └── constants.ts         # Conversion rates, pagination limits, TTLs
└── types/
    └── salary.ts            # TypeScript interfaces
```

---

## API Reference

### POST /api/ingest-salary
```json
// Request body
{
  "company": "Amazon",
  "role": "Software Development Engineer",
  "level": "SDE_II",
  "location": "Bengaluru",
  "currency": "INR",
  "experience_years": 5,
  "base_salary": 4200000,
  "bonus": 700000,
  "stock": 2200000,
  "source": "CONTRIBUTOR",
  "confidence_score": 0.95
}
// total_compensation is ALWAYS recomputed server-side — never trusted from input

// Success: 201 Created
// Duplicate: 409 Conflict
// Validation error: 400 Bad Request { error: true, field: "level", message: "..." }
```

### GET /api/salaries
```
/api/salaries?company=amazon&level=SDE_II&location=bengaluru&sort=total_comp_desc&page=1&limit=25

Response: { data: [...], meta: { total, page, limit, totalPages } }
- limit is capped at 100 (hard limit)
- company/role/location use ILIKE partial match
- level/currency are exact enum match
```

### GET /api/companies/:slug
```
/api/companies/amazon

Response: { company: {...}, stats: { median_total_compensation, level_distribution, ... }, salaries: [...] }
- 404 for unknown slugs
- median is TRUE statistical median, not average
```

### GET /api/compare
```
/api/compare?s1={uuid}&s2={uuid}

Response: { record1, record2, delta: { base_delta, bonus_delta, stock_delta, tc_delta, experience_delta } }
- Delta = record1 - record2 (positive = record1 higher)
- 400 if s1 === s2
- 404 if either ID not found
```

---

## System Architecture

```text
[ Browser / Client ]
        │
        │ (HTTP requests / URL State)
        ▼
[ Next.js App Router ] ── (SEO Layer: Metadata, JSON-LD)
        │
        ├─ [ Static Generation (SSG) ] ── (Company Pages)
        ├─ [ ISR (revalidate) ] ─────── (Homepage)
        ├─ [ React Server Components ] ─ (Initial Dashboard Shell)
        │
        ▼
 [ API Routes ] ── (Zod Validation, Caching)
        │
        │ (Prisma Client)
        ▼
[ Neon PostgreSQL ] ── (Relational Schema)
```

## Architecture Decisions

### Why Static vs ISR vs Dynamic per page

| Page | Strategy | Reason |
|---|---|---|
| `/salaries` | RSC + API fetch (revalidate:300) | Data changes frequently; initial static shell + API-driven filters |
| `/companies/[slug]` | Static (generateStaticParams from live DB) | Company metadata changes rarely; maximum performance; pre-built for every known company |
| `/compare` | `use client` | User-driven state machine; impossible to pre-build; URL state sync required |
| Homepage | ISR (revalidate:3600) | Changes ~daily; too dynamic for full static |
| API routes | No cache on mutations; s-maxage on reads | CDN caching reduces DB load for read-heavy traffic |

**Why `generateStaticParams` queries live Neon DB** (not a hardcoded array):
Adding a new company to the database automatically creates its page at the next deployment. This is the flywheel mechanism — data in → page out → SEO value → traffic → more data.

### Why Page-Based Pagination (Not Cursor-Based)
Page-based chosen because:
1. Users need to see "Page 2 of 13" — meaningful context for data density
2. The salary table is not a real-time feed; records don't shift between page loads
3. Cursor-based is better for infinite scroll / real-time feeds — not applicable here
4. Page-based maps naturally to URL params (`?page=2`) for shareable links

**Tradeoff**: Page-based can have phantom records if new entries are inserted mid-session. Acceptable for this use case.

### Cache-Control TTL Choices
- `GET /api/salaries: s-maxage=300, stale-while-revalidate=3600` — 5 minutes. New salary submissions should appear within minutes, not hours. SWR ensures no cold starts on Cloudflare CDN.
- `GET /api/companies/:slug: s-maxage=3600, stale-while-revalidate=86400` — 1 hour. Company metadata (name, industry, founded year) almost never changes. Salary list is already captured in the static page.
- `GET /api/compare: s-maxage=60, stale-while-revalidate=600` — 1 minute. Salary records are stable, but short TTL ensures any corrections to individual records propagate quickly.

### What I Would Build Differently With Another Day
1. **ISR revalidation trigger**: After `POST /api/ingest-salary`, call `revalidatePath('/salaries')` and `revalidatePath('/companies/' + slug)` to immediately reflect new data without waiting for TTL
2. **Cursor-based pagination on the compare selector**: The dropdown in `/compare` fetches top 100 records — with more data, this needs lazy-loading
3. **Full-text search**: Replace ILIKE with PostgreSQL `tsvector` for better partial-match quality
4. **Company logos**: Integrate Clearbit Logo API with `next/image` for visual trust signals

### What I Did NOT Build (Scope Cuts)
- **Reviews, Interviews, Tools, Community, Workplace Index pages**: Scope limit — 3 core pages ship correctly vs 7 pages shipped poorly
- **Admin panel / moderation queue**: No auth in this trial by spec
- **AI normalisation pipeline**: That's the AI/Data role; seed data covers Full-Stack needs
- **TypeSense search**: PostgreSQL ILIKE is sufficient at seed data scale

## Known Limitations

To deliver a complete vertical slice within the 72-hour trial limit, the following conscious engineering tradeoffs were made:

* **Static Currency Conversion Rates**: Currency conversion (`INR` to `USD`) relies on hardcoded constants. Acceptable for the trial scope, but a production system would require a cron job fetching live forex APIs.
* **Compare Selector Scalability**: The drop-down selector on the compare page fetches the top 100 records. For millions of rows, this must be replaced with an async autocomplete endpoint utilizing debounce.
* **ILIKE Search vs. Full-Text Search**: We use PostgreSQL `ILIKE` for company/role searches. While sufficient for seed data, production would migrate to `tsvector` or TypeSense for typo-tolerance.
* **TTL-based Revalidation**: We use `revalidate: 300` instead of on-demand cache invalidation (`revalidateTag`) to reduce state-management complexity while maintaining acceptable data freshness.

---

## Database Design

### Database Model

```text
+-------------------+       +-----------------------+
|      Company      |       |        Salary         |
+-------------------+       +-----------------------+
| id (UUID) PK      |       | id (UUID) PK          |
| slug (String) UQ  |<------| company_id (UUID) FK  |
| name (String)     | 1 : N | role (String)         |
| industry (String) |       | level (Enum)          |
| founded_year (Int)|       | location (String)     |
| ...               |       | base_salary (BigInt)  |
+-------------------+       | bonus (BigInt)        |
                            | stock (BigInt)        |
                            | total_comp (BigInt)   |
                            | ...                   |
                            +-----------------------+
```

### Why BigInt for salary fields
INR amounts stored in **paise** (smallest unit). ₹4 Crore = 40,00,00,000 paise = exceeds 32-bit int limit (2,147,483,647). BigInt is required.

### Why Decimal(3,2) for confidence_score
Exact decimal storage. Float would introduce rounding errors (0.1 + 0.2 ≠ 0.3 in IEEE 754). Confidence score comparisons must be exact.

### Why Company is a separate model
Enables aggregate queries (`median TC per company`, `level distribution per company`) without fragile string GROUP BY operations. Also powers the dedup check (company_id FK vs normalized string matching).

---

## Normalisation Examples

| Raw Input | Normalised Output |
|---|---|
| `"Google India Pvt. Ltd."` | `"google"` |
| `"GOOGLE"` | `"google"` |
| `"google "` (trailing space) | `"google"` |
| `"Tata Consultancy Services"` | `"tcs"` |
| `"TCS Ltd."` | `"tcs"` |
| `"Wipro Technologies"` | `"wipro"` |
| `"Flipkart Internet Pvt Ltd"` | `"flipkart"` |
| `"amazon.com"` | `"amazon"` |

---

## Seed Data

The seed (`prisma/seed.ts`) includes:
- **65+ records** across 12 companies
- **All Level enum values**: L3 through Principal
- **Multiple cities**: Bengaluru, Mumbai, Hyderabad, Pune, Delhi, Chennai, San Francisco, London
- **Both INR and USD** records
- **Edge cases**:
  - Zero bonus record: Amazon SDE-I Pune
  - Zero stock record: Meesho Data Analyst
  - Very high equity: Meta Distinguished Engineer ($800K stock)
  - Principal level: Google, Microsoft, Meta
- **Normalisation demo**: "Google India", "GOOGLE", "google" → all resolve to slug `google`

---

## Running Tests (Manual Edge Case Checklist)

```bash
# Test: negative base_salary → must return 400
curl -X POST http://localhost:3000/api/ingest-salary \
  -H "Content-Type: application/json" \
  -d '{"company":"Test","role":"SWE","level":"L4","location":"Bengaluru","currency":"INR","experience_years":3,"base_salary":-1000,"source":"CONTRIBUTOR","confidence_score":0.8}'

# Test: invalid level → must return 400
curl -X POST http://localhost:3000/api/ingest-salary \
  -d '{"level":"Senior Software Engineer",...}'

# Test: limit cap → must cap at 100
curl "http://localhost:3000/api/salaries?limit=10000"

# Test: identical IDs → must return 400
curl "http://localhost:3000/api/compare?s1=same-uuid&s2=same-uuid"

# Test: nonexistent company → must return 404
curl "http://localhost:3000/api/companies/nonexistent-slug"
```

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# DATABASE_URL = your Neon connection string (pooled)
# DIRECT_URL = your Neon connection string (direct, for migrations)
# NEXT_PUBLIC_SITE_URL = https://your-project.vercel.app
```

---

## Hardest Technical Decision: Rendering Strategy vs. Interactive Filtering

The most challenging architectural tradeoff was resolving the tension between **SEO/Performance** and **Rich Interactivity** on the primary `/salaries` dashboard.

A pure React Server Component (RSC) approach (fetching data at build time) maximizes SEO and achieves near-instant Largest Contentful Paint (LCP), but causes filters to trigger slow, full-page reloads. Conversely, a pure Single Page App (SPA) approach delivers fluid filtering but severely penalizes initial load times and crawler indexing.

**The Solution:**
We implemented a hybrid architecture:
1. **Static RSC Shell**: The page structure, headers, and SEO metadata are rendered server-side.
2. **URL-Driven Client Components**: The `SalaryFilters` component operates purely on the client, pushing state directly to the URL (`?company=google&level=L4`).
3. **API Fetching via RSC**: The data table component reads these `searchParams` server-side and fetches the data from `/api/salaries`, utilizing `stale-while-revalidate` CDN caching.

This guarantees a blistering fast initial load for SEO bots, while ensuring human users experience snappy, URL-shareable filtering without client-side waterfalls.

---

## Reviewer Guide

To evaluate this submission efficiently, follow this path:

1. **Start at the Dashboard**: Visit `/salaries`. Note the initial load speed and the presence of dynamic KPI cards computing stats based on the active view.
2. **Test Filtering**: Type "Amazon" into the company filter. Notice the URL updates dynamically and the table filters without a page reload. Toggle the Currency between INR and USD to verify BigInt formatting logic.
3. **Test Comparison**: Click the "Compare" button on any company page or navigate directly to `/compare`. Select two distinct records. Verify that the Delta logic accurately computes differences and correctly assigns the "Winner 🏆" badge.
4. **Explore SEO/ISR**: Navigate to a company profile like `/companies/google`. View the page source to verify the injected JSON-LD structured data and optimized meta tags.
5. **Submit a Salary**: Send a POST request to `/api/ingest-salary` (see the *Running Tests* section). Attempt to submit a negative salary or an invalid enum level to verify Zod server-side validation.
6. **Verify Normalization**: Submit a salary for `"  GoOGle India Pvt "` and observe in the database that it perfectly maps to the exact same `company_id` as the seeded Google records.
