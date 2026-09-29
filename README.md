# ACME Salary Management System

A web application that replaces Excel-based salary tracking for an HR Manager. It handles a seeded dataset of
10,000 employees across four countries, stores every salary in the employee's local currency, and reports
organization-level analytics in USD.

See [docs/requirements.md](docs/requirements.md) and [docs/architecture.md](docs/architecture.md) for scope and design.

## Stack

| Layer    | Tech                                                                        |
| -------- | --------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Chakra UI, TanStack Query, Zustand, Recharts     |
| Backend  | Node.js, Express 5, TypeScript, TypeORM, Swagger (OpenAPI), JWT auth        |
| Database | PostgreSQL                                                                  |
| Testing  | Vitest — Supertest on the backend, Testing Library and MSW on the frontend  |

## Layout

```text
backend/    Express API, TypeORM entities and migrations, seed script, API tests
frontend/   React app (feature folders for auth, employees, salaries, dashboard)
docs/       Requirements and architecture notes
```

## Prerequisites

- Node.js 20+
- pnpm 10+
- A running PostgreSQL instance with an empty database

---

## Backend

### Configuration

The API reads its configuration from `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=acme_salary
JWT_SECRET=replace-me-in-production
```

`JWT_SECRET` falls back to a development default if unset, so set it for anything other than local work.
The database variables have no defaults — the connection fails without them.

### Setup

```bash
cd backend
pnpm install
pnpm db:run      # run TypeORM migrations
pnpm seed        # create the HR user and 10,000 employees with salaries
pnpm start:dev   # http://localhost:5000
```

Seeding inserts in batches of 1,000 and is safe to re-run: existing employee codes and any employee who
already has a salary row are skipped. It also creates the login used by the UI —
**hr@acme.com / Password123**.

Interactive API docs are served at [http://localhost:5000/api/docs](http://localhost:5000/api/docs), and
`GET /api/health` is an unauthenticated liveness check.

### Scripts

| Script                | Purpose                                             |
| --------------------- | --------------------------------------------------- |
| `pnpm start:dev`      | Dev server with reload via `tsx watch`              |
| `pnpm build` / `start`| Compile to `dist/` and run the compiled server      |
| `pnpm seed`           | Seed the HR user plus 10,000 employees              |
| `pnpm db:run`         | Apply pending migrations                            |
| `pnpm db:revert`      | Roll back the last migration                        |
| `pnpm db:generate`    | Generate a migration from entity changes            |
| `pnpm test`           | API tests (Vitest + Supertest)                      |

### API

Every route except `/api/health` and `/api/auth/login` requires `Authorization: Bearer <token>`.
Responses use a `{ success, message, data }` envelope.

| Method | Path                             | Description                                                              |
| ------ | -------------------------------- | ------------------------------------------------------------------------ |
| POST   | `/api/auth/login`                | Issue a JWT for the HR Manager                                           |
| POST   | `/api/auth/logout`               | Stateless logout; the client discards the token                          |
| GET    | `/api/employees`                 | Paged list — `page`, `limit` (max 100), `search`, `country`, `department`, `sortBy`, `sortOrder` |
| GET    | `/api/employees/filters`         | Distinct countries and departments for the filter dropdowns              |
| GET    | `/api/employees/:id`             | One employee with their current salary                                   |
| GET    | `/api/employees/:id/salaries`    | Salary history, newest effective date first                              |
| POST   | `/api/employees/:id/salaries`    | Record a salary; `409` if that effective date already exists             |
| GET    | `/api/dashboard`                 | Totals, averages, country and department breakdowns, salary bands        |

### Salary storage and currency

Salaries are stored as new rows rather than updates, so history is never overwritten. The current salary is
the newest row whose `effective_from` is not in the future.

Amounts stay in the employee's local currency (USD, EUR, GBP, INR). Cross-country analytics need one
reporting currency, so the dashboard converts to USD using the fixed rate table in
`backend/src/config/exchangeRates.ts`. The same rates are expanded into a SQL `CASE` expression so the
conversion happens inside the aggregation query instead of in application code.

### Scale

The 10,000-row dataset is handled in the database, not the browser: search, filtering, sorting, and
pagination are all SQL, dashboard figures are aggregated in a single query per breakdown, and
`1790682000000-AddSearchIndexes` adds the indexes those queries rely on.

---

## Frontend

```bash
cd frontend
pnpm install
pnpm dev         # http://localhost:5173
```

The dev server proxies `/api` to `http://localhost:5000`, so start the backend first. The session token and
user are kept in Zustand and persisted to `localStorage`.

| Script         | Purpose                          |
| -------------- | -------------------------------- |
| `pnpm dev`     | Vite dev server                  |
| `pnpm build`   | Typecheck and build for production |
| `pnpm preview` | Serve the production build       |
| `pnpm lint`    | Oxlint                           |
| `pnpm test`    | Component and unit tests         |

---

## Tests

```bash
cd backend
pnpm test     # 10 API tests

cd ../frontend
pnpm test     # 20 component and unit tests
```

Backend tests run against a real PostgreSQL database and `TRUNCATE` the `users`, `employees`, and `salaries`
tables between cases. Point `DB_NAME` at a throwaway database, or re-run `pnpm seed` afterwards.

Frontend tests mock the API with MSW and need no backend.

## Frontend tooling note

Oxlint can also run type-aware rules. To enable them, install `oxlint-tsgolint` and set
`options.typeAware` in `frontend/.oxlintrc.json`; see the
[Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules).
