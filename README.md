# CRM & Project Management Dashboard

Lightweight, solo-developer-friendly CRM built with **Node + Express + SQLite** on the backend and **React + Vite + TailwindCSS** on the frontend.

Architecture follows a layered / SOLID approach:

```
routes  ->  controllers  ->  services  ->  repositories  ->  SQLite
(HTTP)      (shape I/O)      (rules)       (SQL only)
```

---

## Project layout

```
crm_system/
├── server/            # Express API
│   └── src/
│       ├── app.js
│       ├── db/           # schema.sql, database.js, seed.js
│       ├── repositories/ # pure SQL access
│       ├── services/     # business rules + validation
│       ├── controllers/  # request/response shaping
│       ├── routes/       # URL -> controller
│       └── middleware/   # error handling
└── client/            # React SPA
    └── src/
        ├── api/          # fetch wrapper (api.clients, api.reports, ...)
        ├── components/   # layout, ui primitives, feature components
        ├── hooks/        # useAsync
        ├── lib/          # formatters
        └── pages/        # Dashboard, Clients, Categories, Employees, Reports
```

---

## Database schema (SQLite)

See [server/src/db/schema.sql](server/src/db/schema.sql).

- `categories(id, name UNIQUE, created_at)`
- `employees(id, name, email, role, created_at)`
- `clients(id, name, email, phone, category_id FK, assignee_id FK,
           project_price, deposit_paid, payment_status ENUM('Completed','Deposit','Pending'),
           delivery_date, notes, created_at, updated_at)`

Foreign keys use `ON DELETE SET NULL` so deleting a category/employee doesn't orphan the client — the field just goes blank.

### How the financial widgets are computed

- **Income This Month**: `SUM(project_price)` where `payment_status = 'Completed'` and the delivery month matches the current month.
- **Deposited / Waiting**: `SUM(deposit_paid)` for rows with `payment_status = 'Deposit'`.
- **Expected / Pending**: for each row, `project_price` when `Pending`, `project_price - deposit_paid` when `Deposit`, `0` when `Completed` — then summed.

All three are in [`reportService.financialSummary()`](server/src/services/reportService.js).

---

## Running locally

You need Node 18+.

### 1. Backend

```bash
cd server
npm install
cp .env.example .env    # optional, defaults are fine
npm run seed            # (optional) populate sample categories + employees
npm run dev             # -> http://localhost:4000
```

The SQLite file is created automatically at `server/data/crm.db`.

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev             # -> http://localhost:5173
```

Vite proxies `/api/*` to the backend, so the UI uses relative URLs.

---

## API reference

| Method | Path                         | Description                         |
| ------ | ---------------------------- | ----------------------------------- |
| GET    | `/api/clients`               | List clients (supports filters)     |
| POST   | `/api/clients`               | Create client                       |
| PUT    | `/api/clients/:id`           | Update client                       |
| DELETE | `/api/clients/:id`           | Delete client                       |
| GET/POST/PUT/DELETE | `/api/categories[/:id]` | Full CRUD on categories     |
| GET/POST/PUT/DELETE | `/api/employees[/:id]`  | Full CRUD on employees      |
| GET    | `/api/reports/summary`       | Financial widgets                   |
| GET    | `/api/reports/workload`      | Active clients per employee         |
| GET    | `/api/reports/by-status`     | Count / total value by status       |
| GET    | `/api/reports/by-category`   | Count / total value by category     |
| GET    | `/api/reports/monthly`       | Last 12 months of completed revenue |

Client filters (all optional, sent as query string):
`status`, `categoryId`, `assigneeId`, `from` (ISO date), `to` (ISO date).

---

## How the inline "Add Category / Add Employee" works

`InlineCreatableSelect` ([client/src/components/clients/InlineCreatableSelect.jsx](client/src/components/clients/InlineCreatableSelect.jsx)) is a generic component used for both categories and employees.

1. Renders a `<select>` plus a `+ Add X` button.
2. Clicking `+ Add X` reveals an inline mini-form (name only).
3. On submit it calls the `onCreate` prop (which hits the API).
4. It then calls `onCreated` so the parent re-fetches the option list.
5. It finally calls `onChange` with the new id so the new record is **auto-selected**.

This keeps the client form flow unbroken while still respecting SRP — the component knows nothing about categories or employees specifically; the ClientForm composes it with the right callbacks.

---

## Extending the system

- **New entity** → add a `*.repository.js` + `*.service.js` + `*.controller.js` and register its routes. Controllers stay thin; rules live in the service.
- **New report** → add a method on `reportService` with a raw SQL aggregation and expose it through the controller. UI should only render returned shapes.
- **Swap the DB** → everything SQL lives in `server/src/repositories/` and `server/src/db/`. A Supabase/Firestore adapter only needs to match the repository interface; nothing else changes.
