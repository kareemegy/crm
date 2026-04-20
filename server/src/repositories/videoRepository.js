import db from '../db/database.js';

// A video carries a service_type_id; every read returns the joined type name
// so the UI doesn't need a second round-trip.
const BASE_SELECT = `
  SELECT v.*, st.name AS service_type_name
  FROM videos v
  LEFT JOIN service_types st ON st.id = v.service_type_id
`;

export const videoRepository = {
  listByProject(projectId) {
    return db.prepare(`${BASE_SELECT} WHERE v.project_id = ? ORDER BY v.created_at`).all(projectId);
  },

  findById(id) {
    return db.prepare(`${BASE_SELECT} WHERE v.id = ?`).get(id);
  },

  create({
    project_id, service_type_id = null, name,
    quantity = 1, price = 0,
    payment_status = 'Pending', deposit_paid = 0,
    notes = null
  }) {
    const info = db.prepare(`
      INSERT INTO videos
        (project_id, service_type_id, name, quantity, price,
         payment_status, deposit_paid, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      project_id, service_type_id ? Number(service_type_id) : null, name,
      Number(quantity) || 1, Number(price),
      payment_status, Number(deposit_paid) || 0,
      notes
    );
    return this.findById(info.lastInsertRowid);
  },

  update(id, { service_type_id, name, quantity, price, payment_status, deposit_paid, notes }) {
    db.prepare(`
      UPDATE videos SET
        service_type_id = ?, name = ?, quantity = ?, price = ?,
        payment_status = ?, deposit_paid = ?,
        notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      service_type_id ? Number(service_type_id) : null, name,
      Number(quantity) || 1, Number(price ?? 0),
      payment_status, Number(deposit_paid) || 0,
      notes ?? null, id
    );
    return this.findById(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM videos WHERE id = ?').run(id).changes > 0;
  }
};
