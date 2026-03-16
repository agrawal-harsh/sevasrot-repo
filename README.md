# Sevasrot — Complete Project Documentation

> A cow welfare platform for tracking seva drives and managing community donations.
> Built with React + Vite (frontend) and Express.js (backend) on a pnpm monorepo.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Environment Variables](#4-environment-variables)
5. [How to Run](#5-how-to-run)
6. [Database](#6-database)
7. [Backend — API Server](#7-backend--api-server)
8. [Frontend — Sevasrot App](#8-frontend--sevasrot-app)
9. [Authentication System](#9-authentication-system)
10. [API Reference](#10-api-reference)
11. [Shared Libraries](#11-shared-libraries)
12. [Admin Setup Guide](#12-admin-setup-guide)
13. [Deployment](#13-deployment)
14. [Common Workflows](#14-common-workflows)

---

## 1. Project Overview

Sevasrot is a full-stack web platform dedicated to cow welfare (Gauseva). It allows:

- The **public** to view upcoming and past seva drives, and see community donation totals.
- **Registered users** to make donations via UPI and track their donation history.
- **Admins** to create and manage seva drives (with image uploads to Cloudinary), and to approve or reject incoming donations.

### Key Design Principles

- Donations are **manually verified** — no automatic payment gateway. Users scan a UPI QR code, pay, and admins approve after verifying the payment.
- Images for seva drives are uploaded to **Cloudinary** (not stored locally).
- Authentication supports both **email/password** and **Google OAuth**.
- JWTs are used for session management and stored in `localStorage`.

---

## 2. Monorepo Structure

The project is a **pnpm workspace monorepo**. All packages share a root `pnpm-workspace.yaml` and are managed together.

```
sevasrot/
├── artifacts/
│   ├── sevasrot/              ← React + Vite frontend
│   └── api-server/            ← Express.js backend API
│
├── lib/
│   ├── api-spec/              ← OpenAPI 3.1 specification + codegen config
│   ├── api-client-react/      ← Auto-generated React Query hooks (from spec)
│   ├── api-zod/               ← Auto-generated Zod validation schemas (from spec)
│   └── db/                    ← PostgreSQL schema + Drizzle ORM client
│
├── scripts/                   ← One-off utility scripts
│
├── pnpm-workspace.yaml        ← Workspace package discovery + version catalog
├── tsconfig.base.json         ← Shared TypeScript config
├── tsconfig.json              ← Root TS project references (libs only)
├── package.json               ← Root-level dev tooling
├── DOCUMENTATION.md           ← This file
└── replit.md                  ← Project memory / architecture notes
```

### Why a Monorepo?

All packages share types and code. For example, the OpenAPI spec in `lib/api-spec` generates both the backend Zod validators (`lib/api-zod`) and the frontend React Query hooks (`lib/api-client-react`). This guarantees the frontend and backend always agree on the same data shapes.

---

## 3. Tech Stack & Dependencies

### Frontend (`artifacts/sevasrot`)

| Package | Version | Purpose |
|---|---|---|
| `react` | 19.1.0 | UI framework |
| `react-dom` | 19.1.0 | DOM rendering |
| `vite` | ^7.3.0 | Build tool & dev server |
| `tailwindcss` | ^4.1.14 | Utility-first CSS |
| `wouter` | ^3.x | Client-side routing (lightweight) |
| `@tanstack/react-query` | ^5.x | Server state management & caching |
| `framer-motion` | 12.35.1 | Animations and transitions |
| `lucide-react` | 0.545.0 | Icon library |
| `react-hook-form` | ^7.x | Form state management |
| `@hookform/resolvers` | ^3.x | Zod integration for forms |
| `zod` | 3.25.76 | Runtime schema validation |
| `date-fns` | ^3.x | Date formatting |
| `clsx` + `tailwind-merge` | latest | Conditional className utilities |
| `@workspace/api-client-react` | workspace | Generated API hooks |

### Backend (`artifacts/api-server`)

| Package | Version | Purpose |
|---|---|---|
| `express` | ^5 | HTTP server framework |
| `cors` | ^2 | Cross-origin request handling |
| `cookie-parser` | ^1.4.7 | Cookie parsing middleware |
| `bcryptjs` | ^3.x | Password hashing |
| `jsonwebtoken` | ^9.x | JWT creation and verification |
| `multer` | ^2.x | Multipart form data / file uploads |
| `cloudinary` | ^2.x | Cloud image storage & CDN |
| `drizzle-orm` | ^0.45 | Type-safe PostgreSQL ORM |
| `@workspace/db` | workspace | Shared DB client & schema |
| `@workspace/api-zod` | workspace | Generated Zod validators |

### Shared Libraries

| Package | Purpose |
|---|---|
| `lib/db` | Drizzle ORM setup, PostgreSQL connection pool, all table schemas |
| `lib/api-spec` | OpenAPI 3.1 YAML spec — single source of truth for all API contracts |
| `lib/api-client-react` | Generated React Query hooks and a custom fetch client |
| `lib/api-zod` | Generated Zod schemas used by the backend for request/response validation |

### Dev Tools

| Tool | Purpose |
|---|---|
| `typescript` ~5.9 | Static type checking |
| `tsx` | TypeScript execution for Node (replaces `ts-node`) |
| `esbuild` | Fast production bundler for the backend |
| `orval` | OpenAPI → TypeScript codegen (generates hooks + Zod schemas) |
| `drizzle-kit` | DB schema push / migration tool |
| `prettier` | Code formatter |

---

## 4. Environment Variables

All secrets are managed as Replit Secrets (equivalent to `.env` in local dev). Never commit these values.

### Required Secrets

| Variable | Where Used | Description |
|---|---|---|
| `JWT_SECRET` | Backend | Secret key for signing and verifying JWTs. Use a long random string. |
| `GOOGLE_CLIENT_ID` | Backend | From Google Cloud Console — OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Backend | From Google Cloud Console — OAuth 2.0 Client Secret |
| `CLOUDINARY_CLOUD_NAME` | Backend | Your Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Backend | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Backend | Cloudinary API secret |
| `DATABASE_URL` | Backend + DB | PostgreSQL connection string (auto-provisioned by Replit) |

### Auto-Provided by Replit

| Variable | Description |
|---|---|
| `REPLIT_DOMAINS` | Comma-separated list of domains for the deployed app |
| `REPLIT_DEV_DOMAIN` | Dev tunnel domain |
| `PORT` | Port each workflow should listen on |

### Optional Config

| Variable | Default | Description |
|---|---|---|
| `INITIAL_ADMIN_EMAIL` | — | If set, this email is promoted to `admin` role on every server startup. Used for first-time admin setup. |

---

## 5. How to Run

### Prerequisites

- Node.js 24+
- pnpm (`npm install -g pnpm`)
- A PostgreSQL database (Replit provides one automatically)
- Secrets configured (see Section 4)

### Install All Dependencies

```bash
pnpm install
```

This installs dependencies for all packages in the monorepo at once.

### Run Development Servers

You need **two** services running simultaneously:

**1. Backend API Server** (runs at `/api`)
```bash
pnpm --filter @workspace/api-server run dev
```
Starts the Express server. Reads `PORT` from environment. Logs: `Server listening on port <PORT>`.

**2. Frontend Web App** (runs at `/`)
```bash
pnpm --filter @workspace/sevasrot run dev
```
Starts the Vite dev server with hot module replacement.

On Replit, both are started automatically as configured workflows. You do not need to run these manually.

### Build for Production

**Backend:**
```bash
pnpm --filter @workspace/api-server run build
```
Bundles the server into `artifacts/api-server/dist/index.cjs` using esbuild.

**Frontend:**
```bash
pnpm --filter @workspace/sevasrot run build
```
Outputs static files to `artifacts/sevasrot/dist/`.

### Run Type Checks

```bash
# Check all packages
pnpm run typecheck

# Check only shared libraries
pnpm run typecheck:libs
```

### Regenerate API Code (After Changing the OpenAPI Spec)

```bash
pnpm --filter @workspace/api-spec run codegen
```

This re-generates both `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/`. Run this every time `lib/api-spec/openapi.yaml` is modified.

### Push Database Schema Changes

```bash
pnpm --filter @workspace/db run push
# If there are conflicts:
pnpm --filter @workspace/db run push-force
```

---

## 6. Database

### Technology

PostgreSQL managed by **Drizzle ORM**. The connection is defined in `lib/db/src/index.ts` using a `pg` connection pool and the `DATABASE_URL` environment variable.

### Schema Files

All table definitions live in `lib/db/src/schema/`. Each table is in its own file and re-exported from `lib/db/src/schema/index.ts`.

---

### `users` table — `lib/db/src/schema/users.ts`

Stores all registered users, whether they signed up via email or Google.

| Column | Type | Description |
|---|---|---|
| `id` | `serial` PK | Auto-incrementing user ID |
| `name` | `text` | Full display name |
| `email` | `text` unique | Login email address |
| `password` | `text` nullable | Bcrypt-hashed password (null for Google-only users) |
| `auth_provider` | `enum` | `"local"` (email/password) or `"google"` |
| `google_id` | `text` nullable | Google's unique user ID (for OAuth users) |
| `role` | `enum` | `"user"` (default) or `"admin"` |
| `created_at` | `timestamptz` | Account creation timestamp |

---

### `donations` table — `lib/db/src/schema/donations.ts`

Tracks every donation submitted by users.

| Column | Type | Description |
|---|---|---|
| `id` | `serial` PK | Auto-incrementing donation ID |
| `user_id` | `integer` FK | References `users.id` |
| `amount` | `numeric(12,2)` | Donation amount in Indian Rupees |
| `is_anonymous` | `boolean` | Whether to hide the donor's name publicly |
| `display_name` | `text` nullable | The name shown publicly (if not anonymous) |
| `status` | `enum` | `"pending"` → `"approved"` or `"rejected"` |
| `created_at` | `timestamptz` | When the donation was submitted |
| `reviewed_at` | `timestamptz` nullable | When an admin reviewed it |
| `reviewed_by` | `integer` FK nullable | Admin user ID who reviewed it |

---

### `seva_drives` table — `lib/db/src/schema/seva_drives.ts`

Records each seva (service) drive event created by admins.

| Column | Type | Description |
|---|---|---|
| `id` | `serial` PK | Auto-incrementing drive ID |
| `title` | `text` | Drive title (e.g., "Winter Feeding Camp") |
| `description` | `text` | Full description of activities |
| `location` | `location` | Gaushala name and city |
| `date` | `timestamptz` | Date of the event |
| `images` | `text[]` | Array of Cloudinary `secure_url` strings |
| `created_by` | `integer` FK | References `users.id` (must be admin) |
| `created_at` | `timestamptz` | When the record was created |

---

## 7. Backend — API Server

**Location:** `artifacts/api-server/`  
**Entry point:** `src/index.ts`  
**App config:** `src/app.ts`

### Directory Structure

```
artifacts/api-server/src/
├── index.ts              ← Server startup, port binding, admin auto-promotion
├── app.ts                ← Express app setup (CORS, JSON parsing, routes)
├── routes/
│   ├── index.ts          ← Root router — mounts all sub-routers
│   ├── health.ts         ← GET /api/healthz
│   ├── auth.ts           ← Auth routes (register, login, Google OAuth, /me)
│   ├── donations.ts      ← Donation CRUD routes
│   ├── drives.ts         ← Seva drive routes (with Cloudinary upload)
│   └── admin.ts          ← Admin-only routes (counts, all-donations)
├── middlewares/
│   ├── verifyToken.ts    ← JWT verification — attaches req.user
│   └── isAdmin.ts        ← Role guard — rejects non-admins with 403
└── lib/
    └── cloudinary.ts     ← Cloudinary SDK config
```

---

### `src/index.ts` — Server Startup

Reads `PORT` from environment, starts the Express server, then calls `promoteInitialAdmin()`.

**`promoteInitialAdmin()`**: If `INITIAL_ADMIN_EMAIL` env var is set, it runs an `UPDATE` on the `users` table to set that email's role to `"admin"`. This runs on every server start, making it safe to redeploy. Used for bootstrapping the first admin account.

---

### `src/app.ts` — Express App Configuration

- Sets up `cors` (allows all origins with credentials)
- Parses JSON and URL-encoded bodies
- Parses cookies via `cookie-parser`
- Mounts all routes under the `/api` base path

---

### `src/middlewares/verifyToken.ts` — JWT Middleware

Extracts the `Authorization: Bearer <token>` header, verifies the JWT using `JWT_SECRET`, and attaches the decoded payload to `req.user` with shape:

```typescript
interface AuthUser {
  id: number;
  email: string;
  role: string;  // "user" | "admin"
  name: string;
}
```

Returns `401` if no token is present or the token is invalid/expired.

---

### `src/middlewares/isAdmin.ts` — Admin Guard

Checks that `req.user.role === "admin"`. Returns `403 Admin access required` if not. Must be used **after** `verifyToken`.

---

### `src/lib/cloudinary.ts` — Cloudinary Configuration

Configures the Cloudinary v2 SDK using `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` from environment variables. Exports the configured `cloudinary` object.

---

### `src/routes/auth.ts` — Authentication Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Create account with name, email, password. Hashes password with bcrypt (10 rounds). Returns JWT + user object. |
| `/api/auth/login` | POST | Public | Verify email + password. Returns JWT + user object. |
| `/api/auth/me` | GET | JWT required | Returns current user's profile from DB. |
| `/api/auth/google` | GET | Public | Redirects browser to Google's OAuth consent screen. |
| `/api/auth/google/callback` | GET | Public | Receives OAuth code, exchanges for access token, fetches profile, creates or updates user, redirects to `/?token=JWT`. |

**JWT Payload:**
```json
{ "id": 1, "email": "user@example.com", "role": "user", "name": "Full Name" }
```
Tokens expire in **7 days**.

---

### `src/routes/donations.ts` — Donation Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/donations/create` | POST | User JWT | Creates a donation with `status: "pending"`. Body: `{ amount, isAnonymous, displayName }`. |
| `/api/donations/approved` | GET | Public | Returns all approved donations + total sum. |
| `/api/donations/my` | GET | User JWT | Returns the authenticated user's own donation history. |
| `/api/donations/pending` | GET | Admin JWT | Returns all pending donations joined with user name and email. |
| `/api/donations/:id/approve` | PATCH | Admin JWT | Sets status to `"approved"`, records `reviewedAt` and `reviewedBy`. |
| `/api/donations/:id/reject` | PATCH | Admin JWT | Sets status to `"rejected"`, records `reviewedAt` and `reviewedBy`. |

---

### `src/routes/drives.ts` — Seva Drive Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/drives` | GET | Public | Returns all seva drives, newest first. |
| `/api/drives/:id` | GET | Public | Returns one drive by ID. |
| `/api/drives/create` | POST | Admin JWT | Accepts `multipart/form-data`. Uploads up to 10 images to Cloudinary folder `sevasrot/drives`, stores returned `secure_url` array. |
| `/api/drives/:id` | PUT | Admin JWT | Updates drive fields. Accepts JSON body with optional `images` array (for managing existing images). |
| `/api/drives/:id` | DELETE | Admin JWT | Deletes the drive record. |

**Image Upload Flow:**
1. `multer` middleware buffers uploaded files in memory.
2. Each file buffer is piped to `cloudinary.uploader.upload_stream()`.
3. The returned `secure_url` values are stored in the `images` text array column.

---

### `src/routes/admin.ts` — Admin Utility Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/admin/pending-count` | GET | Admin JWT | Returns `{ count: N }` — number of pending donations. Used by the navbar badge. |
| `/api/admin/all-donations` | GET | Admin JWT | Returns all donations (all statuses) joined with user name and email. |

---

## 8. Frontend — Sevasrot App

**Location:** `artifacts/sevasrot/`  
**Entry point:** `src/main.tsx` → `src/App.tsx`  
**Routing:** Wouter (lightweight React Router alternative)  
**Styling:** TailwindCSS v4 with custom saffron-orange theme

### Directory Structure

```
artifacts/sevasrot/
├── public/
│   └── images/
│       ├── hero-bg.png          ← AI-generated hero background (cow in meadow)
│       ├── mandala-pattern.png  ← AI-generated Indian mandala background pattern
│       ├── qr-code.png          ← PhonePe UPI QR code for donations
│       └── auth-bg.png          ← AI-generated auth page background
│
├── src/
│   ├── App.tsx                  ← Root component: providers + router
│   ├── main.tsx                 ← DOM entry point
│   ├── index.css                ← TailwindCSS theme + CSS custom properties
│   │
│   ├── pages/
│   │   ├── Home.tsx             ← Landing page
│   │   ├── Drives.tsx           ← All seva drives grid
│   │   ├── DriveDetail.tsx      ← Single drive with image gallery
│   │   ├── Donations.tsx        ← Public approved donations list
│   │   ├── Login.tsx            ← Email/password + Google login
│   │   ├── Register.tsx         ← Email/password + Google register
│   │   ├── Donate.tsx           ← Protected: donation form + QR code
│   │   ├── Profile.tsx          ← Protected: user info + donation history
│   │   ├── AdminDashboard.tsx   ← Admin only: manage donations & drives
│   │   └── not-found.tsx        ← 404 page
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx       ← Sticky top navbar with auth state
│   │   │   └── Footer.tsx       ← Site footer
│   │   └── ui/                  ← Shadcn-style UI primitives
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── textarea.tsx
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── use-auth.tsx         ← Auth context: login, logout, user state
│   │   ├── use-admin.ts         ← Custom hook for multipart drive creation
│   │   └── use-toast.ts         ← Toast notification hook
│   │
│   └── lib/
│       └── utils.ts             ← cn() helper, formatCurrency() helper
│
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

### `src/App.tsx` — Root Component

Wraps the app with:
1. `QueryClientProvider` — React Query client for all data fetching
2. `AuthProvider` — Global auth context (user, token, login, logout)
3. `TooltipProvider` — UI tooltip context
4. `WouterRouter` — Client-side router with `BASE_URL` base path
5. `Toaster` — Global toast notification renderer

Defines all routes using Wouter's `<Switch>` and `<Route>`:

```
/              → Home
/drives        → Drives
/drives/:id    → DriveDetail
/donations     → Donations
/login         → Login
/register      → Register
/donate        → Donate (protected in component)
/profile       → Profile (protected in component)
/admin         → AdminDashboard (admin-protected in component)
*              → NotFound (404)
```

---

### Pages

#### `Home.tsx`
- Fetches approved donations total via `useGetApprovedDonations()`
- Fetches up to 3 latest drives via `useGetAllDrives()`
- Shows: hero section with CTA buttons, total donation counter, recent drive cards
- "Donate Now" button redirects unauthenticated users to `/login`

#### `Drives.tsx`
- Fetches all drives via `useGetAllDrives()`
- Renders a responsive grid of drive cards
- Each card shows: thumbnail image, title, location, date
- Clicking a card navigates to `/drives/:id`

#### `DriveDetail.tsx`
- Reads the drive `id` from Wouter's URL params
- Fetches single drive via `useGetDrive({ id })`
- Shows full description, location, formatted date
- Renders all Cloudinary images in a gallery grid

#### `Donations.tsx`
- Fetches approved donations via `useGetApprovedDonations()`
- Shows total amount at the top
- Lists each donation: named shows `displayName`, anonymous shows "Anonymous"

#### `Login.tsx`
- Email + password form using `react-hook-form` + Zod validation
- Calls `useLogin()` generated hook on submit
- On success: calls `login(token, user)` from auth context, redirects to `/`
- Google login button: `window.location.href = '/api/auth/google'`

#### `Register.tsx`
- Name + email + password form using `react-hook-form` + Zod
- Calls `useRegister()` generated hook on submit
- On success: calls `login(token, user)`, redirects to `/`
- Google signup button: `window.location.href = '/api/auth/google'`

#### `Donate.tsx` (Protected)
- Redirects to `/login` if no token
- **Step 1:** Form with amount input (with quick-select ₹101/₹501/₹1100/₹2100 buttons), anonymous toggle, display name field
- **Step 2:** After submitting (POST to `/api/donations/create`), shows the PhonePe UPI QR code with the amount. User scans and pays.
- **Step 3:** "I have completed the payment" button → redirects to `/` with a success toast: "Thank you! Your donation will reflect on the website after 24 hours"

#### `Profile.tsx` (Protected)
- Redirects to `/login` if no token
- Shows logged-in user's name and email
- Fetches and renders own donation history table: Amount | Display Name | Status (colored badge) | Date

#### `AdminDashboard.tsx` (Admin Only)
- Redirects to `/` if not admin
- Has a sidebar (desktop) / tab bar (mobile) with three sections:
  - **Pending Donations:** Cards for each pending donation with Approve (green) and Reject (red) buttons. Invalidates cache after action.
  - **All Donations:** Full table of all donations with status badges.
  - **Manage Drives:** Grid of existing drives with Delete button. "New Drive" button toggles a create form with title, description, location, date, and multi-image upload.

---

### Components

#### `components/layout/Navbar.tsx`
- Sticky top navigation bar
- Shows: Logo, Home, Seva Drives, Donations links
- If logged in: Donate Now, Profile icon, Logout button
- If admin: Admin button with pending count badge (fetches live from `/api/admin/pending-count`)
- Mobile: Animated hamburger menu (Framer Motion)
- Active page indicator uses Framer Motion `layoutId` spring animation

#### `components/layout/Footer.tsx`
- Simple footer with Sevasrot branding and copyright

#### `components/ui/` — UI Primitives
Shadcn-compatible component library built with TailwindCSS. Key components:
- `button.tsx` — Styled button with variants (default, outline, ghost, destructive, secondary)
- `input.tsx` — Styled text input
- `textarea.tsx` — Styled multi-line input
- `card.tsx` — Card container with `CardContent`
- `badge.tsx` — Status badge with variants (default, destructive, warning, success)

---

### Hooks

#### `hooks/use-auth.tsx` — Auth Context

Provides the `AuthContext` and `AuthProvider` component. Exposes:

```typescript
interface AuthContextType {
  user: User | null;         // Current logged-in user
  token: string | null;      // JWT string
  isLoading: boolean;        // True while validating token on load
  login: (token, user) => void;  // Save token + user, persist to localStorage
  logout: () => void;        // Clear token, redirect to /
  isAdmin: boolean;          // Shortcut: user?.role === "admin"
  authHeaders: { Authorization: string } | {};  // Ready-to-spread headers
}
```

**Startup flow:**
1. Check URL for `?token=` param (set by Google OAuth callback)
2. If found: save to `localStorage`, clean URL with `history.replaceState`
3. Otherwise: check `localStorage` for existing `sevasrot_token`
4. If token found: call `GET /api/auth/me` to validate and hydrate `user`
5. If `/me` fails: clear token (treats it as expired/invalid)

#### `hooks/use-admin.ts` — Drive Creation Hook

Custom `useMutation` hook for creating seva drives with image uploads. Uses raw `fetch` (not the generated hooks) because multipart form data requires manually set `Authorization` header and `FormData` body — not compatible with JSON-based generated hooks.

#### `hooks/use-toast.ts`

Standard toast notification hook. Used throughout the app for success and error feedback.

---

### `lib/utils.ts`

```typescript
// Merges Tailwind classes safely (handles conflicts)
function cn(...inputs: ClassValue[]): string

// Formats numbers as Indian currency (₹1,00,000)
function formatCurrency(amount: number | string): string
```

---

### `src/index.css` — Theme

Defines the full saffron-orange colour palette using CSS custom properties following Tailwind v4's `@theme` convention. All colours are HSL values:

- `--primary` — Saffron orange (the main brand colour)
- `--background` — Warm cream / light yellow background
- `--foreground` — Dark brown text
- `--card` — Slightly warmer white for card surfaces
- `--muted` — Muted sand tones for secondary text

Also defines the `glass` and `glass-card` utility classes for frosted-glass effects used in the navbar and stats section.

---

### `lib/api-client-react/src/custom-fetch.ts` — Auto-Auth Fetch

The custom fetch function used by all generated API hooks. Key behaviour:

- Automatically reads `sevasrot_token` from `localStorage` and sets the `Authorization: Bearer <token>` header on every request — unless the caller has already set an `Authorization` header.
- This means protected endpoints work automatically from generated hooks without needing to pass headers manually.
- Handles JSON/text/blob responses, builds typed `ApiError` instances for failed requests.

---

## 9. Authentication System

### Flow 1: Email / Password

```
User fills register/login form
  → POST /api/auth/register or /api/auth/login
  → Backend verifies credentials (bcrypt compare)
  → Backend signs JWT with { id, email, role, name }
  → Frontend receives { token, user }
  → token saved to localStorage as "sevasrot_token"
  → AuthContext.user is set
  → User is redirected to home
```

### Flow 2: Google OAuth

```
User clicks "Login with Google"
  → window.location.href = '/api/auth/google'
  → Backend redirects to Google consent page
  → User approves, Google redirects to /api/auth/google/callback?code=...
  → Backend exchanges code for access token
  → Backend fetches profile from Google (name, email, Google ID)
  → If googleId found in DB → existing user
  → Else if email found in DB → link Google to existing account
  → Else → create new user record
  → Backend signs JWT, redirects to /?token=<JWT>
  → AuthProvider detects ?token in URL on page load
  → Saves token to localStorage, cleans URL
  → AuthProvider calls /api/auth/me to load user profile
```

### JWT Structure

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "user",
  "name": "Full Name",
  "iat": 1700000000,
  "exp": 1700604800
}
```

Tokens expire after **7 days**. There is no refresh token — users must log in again after expiry.

### Role System

| Role | Capabilities |
|---|---|
| `user` | Register, login, create donations, view own donation history |
| `admin` | Everything users can do, plus: create/edit/delete seva drives, approve/reject donations, view all donations |

---

## 10. API Reference

Base URL: `/api`

All protected routes require the header:
```
Authorization: Bearer <JWT>
```

### Auth Endpoints

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/auth/register` | — | `{ name, email, password }` | `{ token, user }` |
| POST | `/auth/login` | — | `{ email, password }` | `{ token, user }` |
| GET | `/auth/me` | User | — | `User` object |
| GET | `/auth/google` | — | — | Redirect to Google |
| GET | `/auth/google/callback` | — | `?code=` | Redirect to `/?token=JWT` |

### Donation Endpoints

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/donations/create` | User | `{ amount, isAnonymous, displayName? }` | `Donation` |
| GET | `/donations/approved` | — | — | `{ donations: Donation[], total: number }` |
| GET | `/donations/my` | User | — | `Donation[]` |
| GET | `/donations/pending` | Admin | — | `DonationWithUser[]` |
| PATCH | `/donations/:id/approve` | Admin | — | `Donation` |
| PATCH | `/donations/:id/reject` | Admin | — | `Donation` |

### Seva Drive Endpoints

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| GET | `/drives` | — | — | `SevaDrive[]` |
| GET | `/drives/:id` | — | — | `SevaDrive` |
| POST | `/drives/create` | Admin | `multipart/form-data`: title, description, location, date, images[] | `SevaDrive` |
| PUT | `/drives/:id` | Admin | `{ title?, description?, location?, date?, images? }` | `SevaDrive` |
| DELETE | `/drives/:id` | Admin | — | `204 No Content` |

### Admin Endpoints

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/admin/pending-count` | Admin | `{ count: number }` |
| GET | `/admin/all-donations` | Admin | `DonationWithUser[]` |

### Health Check

| Method | Path | Response |
|---|---|---|
| GET | `/healthz` | `{ status: "ok" }` |

---

## 11. Shared Libraries

### `lib/api-spec/` — OpenAPI Specification

**File:** `lib/api-spec/openapi.yaml`

This is the **single source of truth** for the entire API contract. All endpoints, request bodies, and response shapes are defined here first. The codegen command reads this file to generate typed code for both the frontend and backend.

**Codegen config:** `lib/api-spec/orval.config.ts`

Orval generates two outputs:
1. `lib/api-client-react/src/generated/` — React Query hooks
2. `lib/api-zod/src/generated/` — Zod validators

**Run codegen:**
```bash
pnpm --filter @workspace/api-spec run codegen
```

Always run this after modifying `openapi.yaml`.

---

### `lib/api-client-react/` — Generated React Query Hooks

Auto-generated by Orval from the OpenAPI spec. Do not edit files in `src/generated/` directly — they are overwritten on every codegen run.

**What's generated:**
- One React Query hook per endpoint (e.g., `useGetAllDrives`, `useCreateDonation`, `useApproveDonation`)
- TypeScript types for all request/response payloads

**Custom file (do edit):**
- `src/custom-fetch.ts` — The underlying fetch implementation. Currently auto-injects JWT from `localStorage` into every request.

**Exports from `src/index.ts`:**
```typescript
// Example imports used across the frontend:
import { useGetAllDrives, useCreateDonation, useGetPendingCount } from "@workspace/api-client-react";
```

---

### `lib/api-zod/` — Generated Zod Schemas

Auto-generated Zod schemas matching every schema in the OpenAPI spec. Used by the backend routes to validate request bodies and parse responses.

**Example usage in a route:**
```typescript
import { CreateDonationBody } from "@workspace/api-zod";

const parsed = CreateDonationBody.safeParse(req.body);
if (!parsed.success) {
  res.status(400).json({ error: parsed.error.message });
  return;
}
```

---

### `lib/db/` — Database Layer

**Connection:** `lib/db/src/index.ts`
- Creates a `pg.Pool` using `DATABASE_URL`
- Creates a Drizzle ORM instance with the schema
- Exports: `pool`, `db`, and all table objects

**Schema:** `lib/db/src/schema/index.ts`
- Re-exports all tables: `usersTable`, `donationsTable`, `sevaDriversTable`
- Re-exports all Zod insert schemas and TypeScript types

**Importing in route handlers:**
```typescript
import { db, usersTable, donationsTable } from "@workspace/db";
```

---

## 12. Admin Setup Guide

### First Time: Setting Up an Admin Account

When the app is first deployed, all registered users have the `user` role. To promote someone to admin:

**Option A — Via Environment Variable (Recommended)**

1. Set `INITIAL_ADMIN_EMAIL` to the user's email in Replit Secrets.
2. The server reads this on every startup and promotes that email to `admin` automatically.
3. The user must **log out and log back in** to receive a new JWT with `role: "admin"`.

**Option B — Via Database (Direct)**

Using the Replit database console, run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```
The user must then **log out and log back in** to get a fresh token.

### Important: Re-Login After Promotion

The JWT token is signed at login time and contains the role. After a role change in the database, the user's existing token still says `"role": "user"`. They must **log out and log back in** to receive a new token reflecting their admin role.

---

## 13. Deployment

The app is deployed on Replit. The deployment:
1. Runs `pnpm --filter @workspace/api-server run build` to bundle the backend
2. Runs `pnpm --filter @workspace/sevasrot run build` to build the React app as static files
3. Serves the React app as static files at `/`
4. Serves the API at `/api`
5. The `INITIAL_ADMIN_EMAIL` env var promotes the admin on first production server start

### Google OAuth in Production

The Google OAuth callback URL must be registered in the Google Cloud Console. The backend constructs the callback URL as:
```
https://<primary-domain-from-REPLIT_DOMAINS>/api/auth/google/callback
```

In the Google Cloud Console → OAuth 2.0 Credentials → Authorised redirect URIs, add this exact URL.

### Cloudinary Images

All uploaded seva drive images are stored in Cloudinary under the folder `sevasrot/drives`. These are served over Cloudinary's CDN. Deleting a drive from the database does not automatically delete images from Cloudinary.

---

## 14. Common Workflows

### Adding a New API Endpoint

1. Add the endpoint to `lib/api-spec/openapi.yaml`
2. Run `pnpm --filter @workspace/api-spec run codegen`
3. Implement the route handler in `artifacts/api-server/src/routes/`
4. Register it in `artifacts/api-server/src/routes/index.ts`
5. Use the generated hook in the frontend

### Adding a New Database Table

1. Create `lib/db/src/schema/<tablename>.ts` with the Drizzle table definition
2. Export it from `lib/db/src/schema/index.ts`
3. Run `pnpm --filter @workspace/db run push`
4. Import and use in route handlers via `@workspace/db`

### Creating the First Seva Drive

1. Log in with an admin account
2. Click the "Admin" button in the navbar
3. Go to "Manage Drives" section
4. Click "New Drive"
5. Fill in title, description, location, date, and upload images (max 10, any format)
6. Click "Publish Seva Drive"
7. Images are uploaded to Cloudinary and the drive appears on the Drives page

### Approving a Donation

1. A user submits a donation and pays via the UPI QR code
2. Log in as admin and go to the Admin Dashboard
3. The "Pending" tab shows the donation with donor name, amount, and date
4. Verify the payment in your UPI app
5. Click "Approve" → status changes to approved, appears on the public Donations page
6. Or click "Reject" if no payment was received

### Running a Full Typecheck

```bash
pnpm run typecheck
```

This builds all shared libraries first (`tsc --build`), then typechecks all artifact packages. Fix any errors it reports before deploying.
