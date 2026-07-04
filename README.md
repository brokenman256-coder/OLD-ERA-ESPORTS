# Old Era Esports — Tournament Platform

A gaming tournament platform built with Next.js 16 (App Router), Prisma, and SQLite.

- **Players** browse tournaments and register, optionally paying an entry fee.
- **Organizers** (from any firm/company) post their own tournaments, paying a hosting fee.
- **Admin** manually verifies every payment screenshot — hosting fees from organizers and
  entry fees from players — before a tournament goes live or a registration is confirmed.
  Nothing is charged automatically; the admin reviews each screenshot and approves or
  rejects it.

## Roles

| Role | Can do |
| --- | --- |
| Player | Register an account, browse tournaments, register for one (uploading an entry-fee payment screenshot if there's a fee), track registration status |
| Organizer | Register an account with a firm/company name, post tournaments (uploading a hosting-fee payment screenshot if there's a fee), see status/registrant counts |
| Admin | Full access: approve/reject tournament postings and player registrations after reviewing the payment screenshot, edit or delete any tournament, manage user roles/bans |

## Getting started

```bash
npm install
cp .env.example .env   # then edit JWT_SECRET / ADMIN_* values
npx prisma migrate deploy   # creates the SQLite database
npm run db:seed             # creates/updates the admin account from .env
npm run dev
```

Visit `http://localhost:3000`.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite file path, defaults to `file:./dev.db` |
| `JWT_SECRET` | Secret used to sign session cookies. Generate with `openssl rand -base64 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Used by `npm run db:seed` to create/update the admin account |

**Log in as admin** with `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults in `.env`), then go to
**Account** in the nav bar and change the password immediately.

## How payment verification works

1. An **organizer** posts a tournament. If it has a hosting fee, they must upload a
   screenshot of that payment. The tournament is created with status `PENDING` and is
   not publicly visible yet.
2. A **player** registers for an approved tournament. If it has an entry fee, they must
   upload a screenshot of that payment. The registration is `PENDING` until reviewed
   (registrations for free tournaments are auto-approved).
3. The **admin dashboard** (`/dashboard/admin`) has three tabs:
   - **Tournaments & Hosting Fees** — view the organizer's hosting-fee screenshot, approve
     or reject the tournament (rejecting can include a note), edit any field, or delete it.
   - **Player Payments** — view each player's entry-fee screenshot, approve or reject the
     registration.
   - **Users** — change any user's role, ban/unban an account, or delete an account.
   Only an `ADMIN` account can reach these routes/pages (enforced both by the `proxy.ts`
   route guard and by every API route via `requireRole`).

Payment screenshots are stored on local disk under `public/uploads/payments/` and are not
committed to git. **If you deploy to a platform with an ephemeral/read-only filesystem
(e.g. serverless functions), uploaded files will not persist across deploys** — swap
`src/lib/upload.ts` for an object-storage backend (S3, R2, etc.) in that case.

## Tech stack

- Next.js 16 (App Router, Turbopack, the `proxy.ts` convention replacing `middleware.ts`)
- Prisma 5 + SQLite
- JWT session cookies (`jsonwebtoken` + `bcryptjs`), no third-party auth provider
- Tailwind CSS v4

## Project structure

```
src/
  app/
    api/                 # route handlers (auth, tournaments, registrations, admin/*)
    dashboard/{player,organizer,admin}/  # role-specific dashboards
    tournaments/          # public browse + detail pages
    login/, register/, account/
  components/            # shared + admin UI
  lib/                   # db client, auth/session helpers, upload helper, constants
  proxy.ts               # optimistic route protection (Next.js 16's middleware replacement)
prisma/
  schema.prisma
  seed.ts                # provisions the admin account
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build/run
- `npm run lint` — ESLint
- `npm run db:seed` — create/update the admin account from env vars
- `npx prisma studio` — browse the database
