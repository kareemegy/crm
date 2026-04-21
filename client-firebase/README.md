# CRM — Firebase edition

Fork of [../client/](../client/) that uses **Firestore** as the data store and **realtime `onSnapshot`** subscriptions instead of the Express + SQLite + SSE stack. Same UI, same design, same pages — just the data source differs.

Use this version when you want a cloud-hosted, multi-device CRM (desktop + Android APK both reading the same data). Keep the [../client/](../client/) + [../server/](../server/) version for fully-local work.

## How the two versions relate

```
client/                ←→ server/  (Express + SQLite, local dev, SSE)
client-firebase/       ←→ Firestore (cloud, realtime via onSnapshot)
```

Both point at the **same UI code**, so a fix to a page in one folder is a manual copy to the other.

## Setup (one time)

1. **Create a Firebase project** at <https://console.firebase.google.com> — free Spark plan. No card required.
2. **Enable Firestore** — in the console: *Build → Firestore Database → Create database → Start in production mode → pick a region*. (We'll deploy open rules in a moment; pick a region close to your users.)
3. **Register a Web app** — *Project Settings → Your apps → Add app → Web (`</>`)*. Copy the config object Firebase shows.
4. **Fill in `.env.local`**:

   ```bash
   cp .env.example .env.local
   # Edit .env.local and paste the six VITE_FIREBASE_* values from step 3.
   ```

5. **Install + run**:

   ```bash
   cd client-firebase
   npm install
   npm run dev        # -> http://localhost:5174
   ```

6. **(Optional) Deploy Firestore rules** — the [`firestore.rules`](./firestore.rules) file allows all reads/writes (no auth yet). To apply it:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules --project <your-project-id>
   ```

   You can skip this step if you enabled Firestore in *test mode* — those temporary rules are equivalent for 30 days.

## Data model

Collections map 1:1 to the SQLite tables:

| Firestore collection | Notes |
|----------------------|-------|
| `clients`            | `{ name, email, phone, notes, created_at, updated_at }` |
| `projects`           | `{ name, client_id, category_id, assignee_id, payment_status, deposit_paid, delivery_date, notes, created_at, updated_at }` |
| `videos`             | `{ project_id, service_type_id, name, quantity, price, payment_status, deposit_paid, notes, created_at, updated_at }` |
| `categories`         | `{ name, created_at }` |
| `employees`          | `{ name, email, role, created_at }` |
| `serviceTypes`       | `{ name, created_at }` |

Field names stay snake_case to match the SQLite shape, so the React pages don't care which backend they're hitting.

## How realtime + toasts work

[`src/realtime/firestore.js`](src/realtime/firestore.js) subscribes to each collection with `onSnapshot`. Any insert/update/delete fires:
- the same `clients:changed` / `projects:changed` / … window events the pages already listen for → pages auto-refetch
- a `toast:show` window event → [`ToastHost`](src/components/ui/ToastHost.jsx) shows a notification

This replaces the custom SSE endpoint + `EventSource` client used in the SQLite version. It's simpler, and it's always-on (no cold starts, no hosting).

## Build for production / Firebase Hosting

```bash
npm run build                  # outputs dist/
firebase deploy --only hosting # optional — serves the static SPA from Firebase Hosting (free tier)
```
