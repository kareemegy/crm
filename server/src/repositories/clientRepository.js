import db from '../db/database.js';

// Clients are pure contacts. Aggregates are computed per-client from the
// videos table + the upfront project.deposit_paid:
//   received  = p.deposit_paid + per-video (Completed price | Deposit deposit_paid)
//   pending   = MAX(total_price - received, 0)
const LIST_SELECT = `
  WITH project_sums AS (
    SELECT
      p.id, p.client_id, p.deposit_paid,
      COALESCE((SELECT SUM(price) FROM videos v WHERE v.project_id = p.id), 0) AS effective_price,
      COALESCE((SELECT SUM(CASE
                             WHEN payment_status='Completed' THEN price
                             WHEN payment_status='Deposit'   THEN deposit_paid
                             ELSE 0 END)
                FROM videos v WHERE v.project_id = p.id), 0) AS effective_received
    FROM projects p
  )
  SELECT
    c.*,
    COALESCE(agg.project_count,  0)  AS project_count,
    COALESCE(agg.total_value,    0)  AS total_value,
    COALESCE(agg.received_value, 0)  AS received_value,
    COALESCE(agg.pending_value,  0)  AS pending_value
  FROM clients c
  LEFT JOIN (
    SELECT
      client_id,
      COUNT(*)                                                                   AS project_count,
      SUM(effective_price)                                                       AS total_value,
      SUM(deposit_paid + effective_received)                                     AS received_value,
      SUM(MAX(effective_price - (deposit_paid + effective_received), 0))         AS pending_value
    FROM project_sums
    GROUP BY client_id
  ) agg ON agg.client_id = c.id
`;

export const clientRepository = {
  list()         { return db.prepare(`${LIST_SELECT} ORDER BY c.name`).all(); },
  findById(id)   { return db.prepare(`${LIST_SELECT} WHERE c.id = ?`).get(id); },

  create({ name, email = null, phone = null, notes = null }) {
    const info = db.prepare(`
      INSERT INTO clients (name, email, phone, notes) VALUES (?, ?, ?, ?)
    `).run(name, email, phone, notes);
    return this.findById(info.lastInsertRowid);
  },

  update(id, { name, email, phone, notes }) {
    db.prepare(`
      UPDATE clients SET
        name = ?, email = ?, phone = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, email ?? null, phone ?? null, notes ?? null, id);
    return this.findById(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM clients WHERE id = ?').run(id).changes > 0;
  }
};
