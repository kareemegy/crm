# CRM Desktop (Electron)

Electron wrapper around the existing web project. Reuses the `server/` Express
API and the `client/` React SPA — no business logic is duplicated.

## How it works

1. Electron's main process (`src/main.cjs`) forks `../server/src/app.js` as a
   child process using `ELECTRON_RUN_AS_NODE=1`, so the backend runs inside
   Electron's bundled Node runtime.
2. The server listens on `http://127.0.0.1:14317` and writes its SQLite file
   to Electron's per-user data directory (`app.getPath('userData')/crm.db`),
   so the desktop DB is separate from the dev DB in `server/data/`.
3. The client is built ahead of time with `VITE_API_BASE_URL=http://localhost:14317`
   and loaded from `file://.../client/dist/index.html`.
4. On quit, the forked server process is killed.

## One-time setup

From the repo root:

```bash
cd server && npm install
cd ../client && npm install
cd ../desktop && npm install
```

The `postinstall` in this folder runs `electron-builder install-app-deps`
and then rebuilds `better-sqlite3` (in `../server/node_modules`) against
Electron's native ABI. That rebuild is required — otherwise the forked
server will crash on startup.

If you ever re-run `npm install` inside `server/`, re-run the native rebuild:

```bash
npm run rebuild-native
```

## Run in dev

```bash
npm run dev
```

That builds the client for the desktop target and launches Electron.

## Package a distributable

```bash
npm run dist          # current OS
npm run dist:win      # Windows NSIS installer
npm run dist:mac      # macOS dmg
npm run dist:linux    # Linux AppImage
```

Output goes to `desktop/release/`.

## File layout

```
desktop/
├── package.json       # electron + electron-builder config
├── src/
│   ├── main.cjs       # main process: forks server, creates window
│   └── preload.cjs    # renderer preload (currently a no-op)
└── README.md
```

## Notes

- The web project (`client/` + `server/`) is untouched; it still runs exactly
  as before (`npm run dev` in each).
- The desktop build does not embed Node — it uses Electron's bundled Node
  runtime for the forked server process.
- The CORS layer in the server defaults to "allow any origin" when
  `CORS_ORIGIN` is unset, which is what we want for the `file://` renderer.
