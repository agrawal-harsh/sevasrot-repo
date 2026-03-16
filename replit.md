# Sevasrot - Cow Welfare Platform

## Overview

Full-stack MERN-style web application for tracking seva drives and managing donations for cow welfare. Built with React + Vite (frontend) and Express.js (backend) with PostgreSQL via Drizzle ORM.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/sevasrot), TailwindCSS, Wouter routing
- **Backend**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT + Google OAuth 2.0 (custom PKCE flow)
- **Image Storage**: Cloudinary (seva drive images)
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)

## Project Structure

```text
artifacts/
├── sevasrot/           # React + Vite frontend
│   ├── src/
│   │   ├── pages/      # Home, Drives, DriveDetail, Donations, Donate, Login, Register, Profile, AdminDashboard
│   │   ├── components/ # Navbar, Footer, UI components
│   │   ├── hooks/      # use-auth.tsx, use-admin.ts
│   │   └── App.tsx     # Wouter router with all routes
│   └── public/images/  # Static images (hero, mandala, qr, auth)
└── api-server/         # Express 5 API
    └── src/
        ├── routes/     # auth.ts, donations.ts, drives.ts, admin.ts, health.ts
        ├── middlewares/ # verifyToken.ts, isAdmin.ts
        └── lib/        # cloudinary.ts

lib/
├── api-spec/           # OpenAPI 3.1 spec + Orval codegen config
├── api-client-react/   # Generated React Query hooks
├── api-zod/            # Generated Zod schemas
└── db/                 # Drizzle ORM
    └── src/schema/     # users.ts, donations.ts, seva_drives.ts
```

## Database Tables

- **users**: id, name, email, password (hashed), auth_provider (local|google), google_id, role (user|admin), created_at
- **donations**: id, user_id, amount, is_anonymous, display_name, status (pending|approved|rejected), created_at, reviewed_at, reviewed_by
- **seva_drives**: id, title, description, location, date, images (text[]), created_by, created_at

## API Routes (mounted at /api)

### Auth
- POST /auth/register — email/password register
- POST /auth/login — email/password login
- GET /auth/me — current user (protected)
- GET /auth/google — Google OAuth redirect
- GET /auth/google/callback — Google OAuth callback → redirects to /?token=JWT

### Donations
- POST /donations/create — create pending donation (protected user)
- GET /donations/approved — all approved donations + total (public)
- GET /donations/my — current user's donations (protected)
- GET /donations/pending — pending donations list (admin)
- PATCH /donations/:id/approve — approve donation (admin)
- PATCH /donations/:id/reject — reject donation (admin)

### Drives
- GET /drives — all seva drives (public)
- GET /drives/:id — single drive (public)
- POST /drives/create — create drive with Cloudinary image upload (admin, multipart/form-data)
- PUT /drives/:id — update drive (admin)
- DELETE /drives/:id — delete drive (admin)

### Admin
- GET /admin/pending-count — pending donation count (admin)
- GET /admin/all-donations — all donations with user info (admin)

## Authentication

- JWT stored in localStorage as `sevasrot_token`
- Google OAuth: GET /api/auth/google → Google → /api/auth/google/callback → /?token=JWT
- Frontend captures ?token param on load, saves to localStorage, cleans URL
- All protected endpoints: Authorization: Bearer {token} header

## Environment Variables Required

- JWT_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- DATABASE_URL (auto-provisioned by Replit)
- REPLIT_DOMAINS (auto-provided by Replit)

## Frontend Pages

1. `/` — Home: hero, donation counter, latest 3 drives preview
2. `/drives` — All seva drives grid
3. `/drives/:id` — Drive detail with image gallery
4. `/donations` — Approved donations list + total
5. `/login` — Email/password + Google login
6. `/register` — Email/password + Google signup
7. `/donate` — Protected: donation form → UPI QR code → success
8. `/profile` — Protected: user info + own donation history
9. `/admin` — Admin only: pending donations, all donations, seva drives management

## Design

- Saffron-orange primary color theme
- Warm Indian cultural aesthetic with mandala patterns
- Custom AI-generated images: hero-bg.png, mandala-pattern.png, qr-placeholder.png, auth-bg.png
