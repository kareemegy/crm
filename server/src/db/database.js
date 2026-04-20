import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbFile = process.env.DB_FILE || path.join(__dirname, '../../data/crm.db');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// --- Migration 1: split legacy single-table clients → clients + projects ---
const clientCols = db.prepare('PRAGMA table_info(clients)').all().map(c => c.name);
if (clientCols.includes('project_price')) {
  console.log('[migrate] Moving project data from clients → projects…');
  db.transaction(() => {
    db.prepare(`
      INSERT INTO projects
        (name, client_id, category_id, assignee_id, price, deposit_paid,
         payment_status, delivery_date, notes, created_at)
      SELECT COALESCE(name, 'Untitled') || ' project',
             id, category_id, assignee_id, project_price, deposit_paid,
             payment_status, delivery_date, notes, created_at
      FROM clients
    `).run();

    for (const idx of [
      'idx_clients_status', 'idx_clients_category',
      'idx_clients_assignee', 'idx_clients_delivery'
    ]) {
      db.exec(`DROP INDEX IF EXISTS ${idx}`);
    }
    for (const col of [
      'category_id', 'assignee_id', 'project_price', 'deposit_paid',
      'payment_status', 'delivery_date'
    ]) {
      db.exec(`ALTER TABLE clients DROP COLUMN ${col}`);
    }
  })();
  console.log('[migrate] Done.');
}

// --- Migration 2: seed one video per existing project with a non-zero price
// so total price stays consistent once videos become the source of truth. ---
// Trigger: any project with price > 0 that has no videos yet.
const orphanPriced = db.prepare(`
  SELECT p.id, p.name, p.price
  FROM projects p
  LEFT JOIN videos v ON v.project_id = p.id
  WHERE p.price > 0
  GROUP BY p.id
  HAVING COUNT(v.id) = 0
`).all();

if (orphanPriced.length) {
  console.log(`[migrate] Seeding ${orphanPriced.length} initial video(s) from legacy project prices…`);
  const insertVideo = db.prepare(
    'INSERT INTO videos (project_id, name, price) VALUES (?, ?, ?)'
  );
  db.transaction(() => {
    for (const p of orphanPriced) {
      insertVideo.run(p.id, `${p.name} — main`, p.price);
    }
    // Reset legacy price so it can't desync from the video sum going forward.
    db.exec('UPDATE projects SET price = 0');
  })();
  console.log('[migrate] Done.');
}

// --- Migration 3: add quantity column to videos (default 1) ----------------
let videoCols = db.prepare('PRAGMA table_info(videos)').all().map(c => c.name);
if (!videoCols.includes('quantity')) {
  console.log('[migrate] Adding videos.quantity column…');
  db.exec('ALTER TABLE videos ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1');
  videoCols.push('quantity');
}

// --- Migration 4: add payment_status column to videos (default 'Pending') --
if (!videoCols.includes('payment_status')) {
  console.log("[migrate] Adding videos.payment_status column (default 'Pending')…");
  // No CHECK constraint here — SQLite's ALTER TABLE can't add one retroactively.
  // The service layer validates the enum on every write.
  db.exec(`ALTER TABLE videos ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'Pending'`);
  videoCols.push('payment_status');
}

// --- Migration 5: add deposit_paid column to videos (default 0) -----------
if (!videoCols.includes('deposit_paid')) {
  console.log('[migrate] Adding videos.deposit_paid column (default 0)…');
  db.exec('ALTER TABLE videos ADD COLUMN deposit_paid REAL NOT NULL DEFAULT 0');
  videoCols.push('deposit_paid');
}

// --- Migration 6: add service_type_id (nullable) ---------------------------
if (!videoCols.includes('service_type_id')) {
  console.log('[migrate] Adding videos.service_type_id column…');
  db.exec('ALTER TABLE videos ADD COLUMN service_type_id INTEGER REFERENCES service_types(id) ON DELETE SET NULL');
}

// --- Seed: default service types on first run -----------------------------
const hasServiceTypes = db.prepare('SELECT COUNT(*) AS c FROM service_types').get().c > 0;
if (!hasServiceTypes) {
  console.log('[seed] Creating default service types…');
  const insert = db.prepare('INSERT OR IGNORE INTO service_types (name) VALUES (?)');
  db.transaction(() => {
    for (const name of ['Reel', 'Podcast', 'Design', 'Script', 'Long Video']) {
      insert.run(name);
    }
  })();
}

export default db;
