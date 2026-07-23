# Sick Fits

A full-stack e-commerce demo store — browse products, search, add to cart, sign up/sign in,
check out with Stripe, manage orders, and manage user permissions.

This README assumes **zero prior knowledge of the project** — follow it top to bottom on a
freshly cloned copy of the repo and you'll end up with a fully working store, seeded with test
data and test accounts.

## Tech stack

| Layer     | Technology                                                                 |
| --------- | --------------------------------------------------------------------------- |
| Frontend  | Next.js 16 (Pages Router) · React 18 · TypeScript · Ant Design 5 · Apollo Client 3 |
| Backend   | Node.js · TypeScript · Apollo Server 5 (GraphQL) · Express 5               |
| Database  | PostgreSQL 16 · Prisma ORM 6                                                |
| Infra     | Docker Compose (PostgreSQL + Adminer) · npm workspaces                      |
| Payments  | Stripe (test mode)                                                          |
| Email     | Nodemailer (SMTP — e.g. Mailtrap for local dev)                            |

Monorepo layout:

```
.
├── backend/     GraphQL API (TypeScript, Prisma, PostgreSQL)
├── frontend/    Next.js storefront (TypeScript, Ant Design, Apollo Client)
└── docker-compose.yml   Local PostgreSQL + Adminer
```

## 1. Requirements

Install these before doing anything else:

- **Node.js 20 LTS or newer** (includes npm 10+) — https://nodejs.org
- **Docker Desktop** (macOS/Windows) or **Docker Engine + Compose plugin** (Linux) — https://docs.docker.com/get-docker/
- **Git**

Check your versions:

```bash
node -v   # v20.x or newer
npm -v    # v10.x or newer
docker --version
docker compose version
```

### macOS

```bash
# Using Homebrew (https://brew.sh)
brew install node@20 git
brew install --cask docker   # then open Docker.app once to finish setup
```

### Windows

1. Install **Node.js 20 LTS** from https://nodejs.org (choose the Windows installer).
2. Install **Docker Desktop** from https://www.docker.com/products/docker-desktop — during setup
   make sure "Use WSL 2 based engine" is enabled, and start Docker Desktop at least once.
3. Install **Git for Windows** from https://git-scm.com/download/win.
4. Run all commands below in **PowerShell**, **Git Bash**, or **WSL2 Ubuntu** — any of the three works.

### Ubuntu / Debian

```bash
# Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"   # log out/in afterwards so the group applies
```

## 2. Get the code and configure environment variables

```bash
git clone <this-repo-url> sick-fits
cd sick-fits
```

Copy the example env files (defaults work out of the box for local development):

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

You don't need to edit anything to get the store running locally. The only reasons you'd ever
edit these later:

- `backend/.env` → `STRIPE_SECRET` / `frontend/.env.local` → `NEXT_PUBLIC_STRIPE_KEY` if you want
  real Stripe test-mode checkout (get a free pair from https://dashboard.stripe.com/test/apikeys).
- `backend/.env` → `MAIL_*` if you want password-reset emails to actually send (e.g. a free
  https://mailtrap.io sandbox inbox).

See [Environment variables](#environment-variables) below for the full list.

## 3. Install dependencies

From the **repo root** (this installs both `backend/` and `frontend/` via npm workspaces):

```bash
npm install
```

## 4. Start everything with one command

```bash
npm run dev
```

This single command:

1. Starts a PostgreSQL container via Docker Compose (`docker compose up -d db`).
2. Waits until the database is accepting connections.
3. Applies all Prisma migrations (creates the schema).
4. Seeds the database with demo products and test accounts (safe to run repeatedly — it skips
   seeding anything that already exists).
5. Starts the backend GraphQL API at **http://localhost:4444**.
6. Starts the Next.js frontend at **http://localhost:7777**.

Open **http://localhost:7777** in your browser — you should see a store front page with products
already listed.

To stop everything: `Ctrl+C` the `npm run dev` process, then `npm run dev:down` to stop the
database container.

## Test accounts

The seed script creates these accounts every time the database is empty. Use them to log in and
click-test every role in the app:

| Role                      | Email                 | Password      | Permissions                                              |
| ------------------------- | ---------------------- | -------------- | ---------------------------------------------------------- |
| Administrator              | `admin@example.com`   | `admin123`    | ADMIN, USER, ITEMCREATE, ITEMUPDATE, ITEMDELETE, PERMISSIONUPDATE |
| Manager (product staff)    | `manager@example.com` | `manager123`  | USER, ITEMCREATE, ITEMUPDATE, ITEMDELETE                 |
| Buyer (regular customer)   | `buyer@example.com`   | `user123`     | USER                                                       |

Sign in at http://localhost:7777/signup. The **Administrator** account can manage everyone's
permissions at http://localhost:7777/permissions. **Manager** and **Administrator** can create,
edit and delete products from http://localhost:7777/sell. Any signed-in account (including
**Buyer**) can add products to a cart and place an order.

The database also comes pre-loaded with 6 demo products so the shop is never empty.

## Everyday scripts

Run these from the **repo root** unless noted otherwise.

| Command | What it does |
| --- | --- |
| `npm run dev` | One-command start: DB + migrations + seed + backend + frontend (dev mode, hot reload) |
| `npm run dev:up` | Start only the PostgreSQL container |
| `npm run dev:down` | Stop the PostgreSQL container |
| `npm run db:setup` | Apply migrations and seed the database (without starting the app) |
| `npm run build` | Production build of the frontend |
| `npm start` | Start backend + frontend in production mode (run `build` first) |
| `npm test` | Run the frontend test suite (Jest + React Testing Library) |

Backend-only scripts (run with `--workspace=backend`, or `cd backend` first):

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the API in watch mode (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled API from `dist/` |
| `npm run migrate:dev` | Create a new migration from schema changes (local dev) |
| `npm run migrate` | Apply pending migrations (used in `db:setup` / CI / production) |
| `npm run seed` | Re-run the seed script |
| `npm run studio` | Open Prisma Studio, a GUI for browsing/editing the database |
| `npm run typecheck` | Type-check without emitting files |

Frontend-only scripts (run with `--workspace=frontend`, or `cd frontend` first):

| Command | What it does |
| --- | --- |
| `npm run dev` | Start Next.js in dev mode on port 7777 |
| `npm run build` | Production build |
| `npm start` | Start the production build |
| `npm test` | Run Jest tests once |
| `npm run test:watch` | Run Jest tests in watch mode |
| `npm run typecheck` | Type-check without emitting files |

## Inspecting the database

- **Adminer** (web UI) is started automatically by Docker Compose: http://localhost:8080
  — System: `PostgreSQL`, Server: `db`, Username/Password/Database: see `.env` (defaults to
  `sickfits` / `sickfits` / `sickfits`).
- **Prisma Studio**: `npm run studio --workspace=backend`, then open http://localhost:5555.

## Environment variables

### Root `.env` (Docker Compose / PostgreSQL container)

| Variable | Default | Purpose |
| --- | --- | --- |
| `POSTGRES_USER` | `sickfits` | Database username |
| `POSTGRES_PASSWORD` | `sickfits` | Database password |
| `POSTGRES_DB` | `sickfits` | Database name |
| `POSTGRES_PORT` | `5432` | Host port the database is exposed on |

### `backend/.env`

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string — must match the root `.env` credentials |
| `PORT` | Port the GraphQL API listens on (default `4444`) |
| `FRONTEND_URL` | Used for CORS and password-reset email links (default `http://localhost:7777`) |
| `APP_SECRET` | Secret used to sign JWT auth cookies — use a long random string |
| `STRIPE_SECRET` | Stripe **secret** test key, for creating charges |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASS` | SMTP credentials for password-reset emails (e.g. Mailtrap) |

### `frontend/.env.local`

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_ENDPOINT` | URL of the GraphQL backend (default `http://localhost:4444`) |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe **publishable** test key, for the checkout widget |

## Troubleshooting

- **`npm run dev` fails with a port already in use** — something else is using `7777`, `4444` or
  `5432`. Stop it, or change `PORT` / `NEXT_PUBLIC_ENDPOINT` / `POSTGRES_PORT` accordingly.
- **Docker permission denied on Linux** — you likely need to log out/in after
  `usermod -aG docker $USER`, or run commands with `sudo`.
- **Database connection errors** — make sure Docker is running and `backend/.env`'s
  `DATABASE_URL` matches the credentials in the root `.env`.
- **Checkout button shows a Stripe "legacy Checkout" warning** — this app uses the classic
  `react-stripe-checkout` popup widget for simplicity. It still works with Stripe test keys, but
  a production rewrite should migrate to Stripe Elements/Payment Element.
- **Start completely fresh** — `npm run dev:down`, then `docker volume rm sick-fits_db_data`
  (or the matching volume name from `docker volume ls`) to wipe the database, then `npm run dev`
  again.
