import db from '../db/database.js';

// All report calculations aggregate from the videos table — since price and
// deposits live there now, so does all the financial truth. Projects just
// provide the grouping/filter keys.
const WITH_PROJECT_STATS = `
  WITH p_stats AS (
    SELECT
      p.*,
      COALESCE((SELECT SUM(price) FROM videos v WHERE v.project_id = p.id), 0) AS effective_price,
      COALESCE((SELECT SUM(CASE WHEN payment_status='Deposit' THEN deposit_paid ELSE 0 END)
                FROM videos v WHERE v.project_id = p.id), 0) AS effective_deposit,
      -- Per-video cash already received: full price for Completed, deposit for Deposit.
      COALESCE((SELECT SUM(CASE
                             WHEN payment_status='Completed' THEN price
                             WHEN payment_status='Deposit'   THEN deposit_paid
                             ELSE 0 END)
                FROM videos v WHERE v.project_id = p.id), 0) AS effective_received
    FROM projects p
  )
`;

export const reportService = {
  financialSummary() {
    // Income this month = completed revenue (sum of video prices on projects
    // marked Completed, within the current month by delivery date).
    const { incomeThisMonth = 0 } = db.prepare(`
      ${WITH_PROJECT_STATS}
      SELECT COALESCE(SUM(effective_price), 0) AS incomeThisMonth
      FROM p_stats
      WHERE payment_status = 'Completed'
        AND strftime('%Y-%m', COALESCE(delivery_date, created_at)) = strftime('%Y-%m','now')
    `).get();

    // Deposited money = per-video deposits + upfront project.deposit_paid.
    const { depositedMoney = 0 } = db.prepare(`
      SELECT
        COALESCE((SELECT SUM(deposit_paid) FROM videos WHERE payment_status = 'Deposit'), 0)
      + COALESCE((SELECT SUM(deposit_paid) FROM projects WHERE payment_status = 'Deposit'), 0)
      AS depositedMoney
    `).get();

    // Pending money = SUM over projects of MAX(price - received, 0),
    // where received = p.deposit_paid + per-video received.
    const { pendingMoney = 0 } = db.prepare(`
      ${WITH_PROJECT_STATS}
      SELECT COALESCE(SUM(
        MAX(effective_price - (deposit_paid + effective_received), 0)
      ), 0) AS pendingMoney
      FROM p_stats
    `).get();

    return { incomeThisMonth, depositedMoney, pendingMoney };
  },

  employeeWorkload() {
    return db.prepare(`
      ${WITH_PROJECT_STATS}
      SELECT
        e.id,
        e.name,
        e.role,
        COUNT(p.id) AS total_projects,
        SUM(CASE WHEN p.payment_status != 'Completed' THEN 1 ELSE 0 END) AS active_projects,
        COALESCE(SUM(p.effective_price), 0) AS total_value
      FROM employees e
      LEFT JOIN p_stats p ON p.assignee_id = e.id
      GROUP BY e.id
      ORDER BY active_projects DESC, e.name
    `).all();
  },

  statusBreakdown() {
    return db.prepare(`
      ${WITH_PROJECT_STATS}
      SELECT
        payment_status                       AS status,
        COUNT(*)                             AS count,
        COALESCE(SUM(effective_price), 0)    AS total_value
      FROM p_stats
      GROUP BY payment_status
    `).all();
  },

  categoryBreakdown() {
    return db.prepare(`
      ${WITH_PROJECT_STATS}
      SELECT
        COALESCE(cat.name, 'Uncategorized') AS category,
        COUNT(p.id)                         AS count,
        COALESCE(SUM(p.effective_price), 0) AS total_value
      FROM p_stats p
      LEFT JOIN categories cat ON cat.id = p.category_id
      GROUP BY cat.id
      ORDER BY total_value DESC
    `).all();
  },

  monthlyRevenue() {
    return db.prepare(`
      ${WITH_PROJECT_STATS}
      SELECT
        strftime('%Y-%m', COALESCE(delivery_date, created_at)) AS month,
        COALESCE(SUM(effective_price), 0)                      AS revenue
      FROM p_stats
      WHERE payment_status = 'Completed'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all();
  }
};
