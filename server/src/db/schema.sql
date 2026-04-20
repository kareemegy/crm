-- CRM schema. Projects are first-class entities; a client has many projects
-- and a project has many videos. The project's total price is always the
-- SUM of its videos' prices (computed at query time).

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS employees (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT,
  role        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Service types: Reel, Podcast, Design, Script, Long Video… (manageable list).
CREATE TABLE IF NOT EXISTS service_types (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clients (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  client_id       INTEGER NOT NULL REFERENCES clients(id)    ON DELETE CASCADE,
  category_id     INTEGER          REFERENCES categories(id) ON DELETE SET NULL,
  assignee_id     INTEGER          REFERENCES employees(id)  ON DELETE SET NULL,
  price           REAL NOT NULL DEFAULT 0,   -- legacy; kept for migration, ignored at query time
  deposit_paid    REAL NOT NULL DEFAULT 0,
  payment_status  TEXT NOT NULL CHECK (payment_status IN ('Completed','Deposit','Pending')),
  delivery_date   TEXT,
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- "videos" is the underlying table for services (Reel / Podcast / Design / …).
-- A service_type_id classifies the line item.
CREATE TABLE IF NOT EXISTS videos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id      INTEGER NOT NULL REFERENCES projects(id)       ON DELETE CASCADE,
  service_type_id INTEGER          REFERENCES service_types(id)  ON DELETE SET NULL,
  name            TEXT NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1,   -- how many of this service; Services count = SUM(quantity)
  price           REAL NOT NULL DEFAULT 0,      -- total price for the line (not per-unit)
  payment_status  TEXT NOT NULL DEFAULT 'Pending'
                  CHECK (payment_status IN ('Completed','Deposit','Pending')),
  deposit_paid    REAL NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_client   ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects(payment_status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_assignee ON projects(assignee_id);
CREATE INDEX IF NOT EXISTS idx_projects_delivery ON projects(delivery_date);
CREATE INDEX IF NOT EXISTS idx_videos_project    ON videos(project_id);
