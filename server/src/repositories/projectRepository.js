import db from '../db/database.js';

// Joined select. Every money figure is aggregated from the videos table plus
// the project-level upfront deposit (p.deposit_paid).
//
// Per-video contribution to `received`:
//   Completed → full price
//   Deposit   → deposit_paid
//   Pending   → 0
//
// Project-level `price` = SUM(video.price) (overall budget).
// Project-level `received` = p.deposit_paid + per-video received.
// Project-level `remaining` = MAX(price - received, 0).
// Derived project status rule:
//   - no videos yet                             → 'In Progress'
//   - every video has payment_status = Completed → 'Completed'
//   - otherwise (any Pending or Deposit)         → 'In Progress'
const BASE_SELECT = `
  SELECT
    p.id, p.name, p.client_id, p.category_id, p.assignee_id,
    COALESCE(vagg.vsum,     0)                                 AS price,
    COALESCE(vagg.vcount,   0)                                 AS video_count,
    p.deposit_paid + COALESCE(vagg.v_received, 0)              AS received,
    MAX(COALESCE(vagg.vsum, 0)
        - (p.deposit_paid + COALESCE(vagg.v_received, 0)), 0)  AS remaining,
    p.deposit_paid + COALESCE(vagg.v_deposit, 0)               AS total_deposit,
    CASE
      WHEN COALESCE(vagg.vrows, 0) = 0          THEN 'In Progress'
      WHEN COALESCE(vagg.v_incomplete, 0) = 0   THEN 'Completed'
      ELSE 'In Progress'
    END                                                        AS status,
    p.deposit_paid, p.payment_status, p.delivery_date, p.notes,
    p.created_at, p.updated_at,
    cl.name  AS client_name,
    cat.name AS category_name,
    emp.name AS assignee_name
  FROM projects p
  LEFT JOIN clients    cl  ON cl.id  = p.client_id
  LEFT JOIN categories cat ON cat.id = p.category_id
  LEFT JOIN employees  emp ON emp.id = p.assignee_id
  LEFT JOIN (
    SELECT
      project_id,
      COUNT(*)       AS vrows,
      SUM(CASE WHEN payment_status != 'Completed' THEN 1 ELSE 0 END) AS v_incomplete,
      SUM(price)     AS vsum,
      SUM(quantity) AS vcount,
      SUM(CASE WHEN payment_status = 'Deposit' THEN deposit_paid ELSE 0 END) AS v_deposit,
      SUM(CASE
            WHEN payment_status = 'Completed' THEN price
            WHEN payment_status = 'Deposit'   THEN deposit_paid
            ELSE 0
          END) AS v_received
    FROM videos
    GROUP BY project_id
  ) vagg ON vagg.project_id = p.id
`;

export const projectRepository = {
  list() {
    return db.prepare(`${BASE_SELECT} ORDER BY p.created_at DESC`).all();
  },

  findById(id) {
    return db.prepare(`${BASE_SELECT} WHERE p.id = ?`).get(id);
  },

  listByClient(clientId) {
    return db.prepare(`${BASE_SELECT} WHERE p.client_id = ? ORDER BY p.created_at DESC`).all(clientId);
  },

  filter({ status, categoryId, assigneeId, clientId, from, to } = {}) {
    const conds = [];
    const params = {};
    if (status)     { conds.push('p.payment_status = @status'); params.status = status; }
    if (categoryId) { conds.push('p.category_id   = @categoryId'); params.categoryId = categoryId; }
    if (assigneeId) { conds.push('p.assignee_id   = @assigneeId'); params.assigneeId = assigneeId; }
    if (clientId)   { conds.push('p.client_id     = @clientId');   params.clientId   = clientId; }
    if (from)       { conds.push('p.delivery_date >= @from'); params.from = from; }
    if (to)         { conds.push('p.delivery_date <= @to');   params.to   = to; }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    return db.prepare(`${BASE_SELECT} ${where} ORDER BY p.created_at DESC`).all(params);
  },

  create(data) {
    const info = db.prepare(`
      INSERT INTO projects
        (name, client_id, category_id, assignee_id,
         deposit_paid, payment_status, delivery_date, notes)
      VALUES
        (@name, @client_id, @category_id, @assignee_id,
         @deposit_paid, @payment_status, @delivery_date, @notes)
    `).run(normalize(data));
    return this.findById(info.lastInsertRowid);
  },

  update(id, data) {
    db.prepare(`
      UPDATE projects SET
        name = @name, client_id = @client_id,
        category_id = @category_id, assignee_id = @assignee_id,
        deposit_paid = @deposit_paid, payment_status = @payment_status,
        delivery_date = @delivery_date, notes = @notes,
        updated_at = datetime('now')
      WHERE id = @id
    `).run({ ...normalize(data), id });
    return this.findById(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes > 0;
  }
};

function normalize(d) {
  // Project-level deposit only meaningful when status = Deposit.
  const status = d.payment_status;
  return {
    name:           d.name,
    client_id:      Number(d.client_id),
    category_id:    d.category_id ? Number(d.category_id) : null,
    assignee_id:    d.assignee_id ? Number(d.assignee_id) : null,
    deposit_paid:   status === 'Deposit' ? Number(d.deposit_paid ?? 0) : 0,
    payment_status: status,
    delivery_date:  d.delivery_date || null,
    notes:          d.notes || null
  };
}
