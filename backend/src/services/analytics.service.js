import { query } from '../config/database.js';

export async function getAdminAnalytics() {
  // 1. Overall platform headline counts
  const summarySql = `
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM users WHERE role = 'CLIENT') AS total_clients,
      (SELECT COUNT(*) FROM users WHERE role = 'FREELANCER') AS total_freelancers,
      (SELECT COUNT(*) FROM projects) AS total_projects,
      (SELECT COUNT(*) FROM projects WHERE status = 'OPEN') AS open_projects,
      (SELECT COUNT(*) FROM projects WHERE status = 'IN_PROGRESS') AS in_progress_projects,
      (SELECT COUNT(*) FROM projects WHERE status = 'COMPLETED') AS completed_projects,
      (SELECT COUNT(*) FROM contracts) AS total_contracts,
      (SELECT COALESCE(SUM(amount), 0.00) / 2.0 FROM wallet_transactions WHERE transaction_type = 'PAYMENT_RELEASE') AS total_volume_released;
  `;
  const summaryRes = await query(summarySql);

  // 2. Monthly Platform Analytics (from Materialized View)
  const monthlySql = `
    SELECT * FROM monthly_platform_analytics
    ORDER BY month_label ASC;
  `;
  const monthlyRes = await query(monthlySql);

  // 3. Category Statistics (from Materialized View)
  const categorySql = `
    SELECT * FROM project_category_statistics
    ORDER BY total_projects DESC;
  `;
  const categoryRes = await query(categorySql);

  // 4. Top Freelancers (from View)
  const topFreelancersSql = `
    SELECT * FROM top_freelancers_view
    LIMIT 6;
  `;
  const topFreelancersRes = await query(topFreelancersSql);

  // 5. Recent Transaction History (from View)
  const transactionsSql = `
    SELECT * FROM transaction_history_view
    LIMIT 10;
  `;
  const transactionsRes = await query(transactionsSql);

  return {
    summary: summaryRes.rows[0],
    monthlyTrends: monthlyRes.rows,
    categoryDistribution: categoryRes.rows,
    topFreelancers: topFreelancersRes.rows,
    recentTransactions: transactionsRes.rows,
  };
}

export async function getClientDashboardStats(clientId) {
  const sql = `
    SELECT * FROM client_dashboard_view
    WHERE user_id = $1;
  `;
  const res = await query(sql, [clientId]);
  return res.rows[0] || null;
}

export async function getFreelancerDashboardStats(freelancerId) {
  const sql = `
    SELECT * FROM freelancer_dashboard_view
    WHERE user_id = $1;
  `;
  const res = await query(sql, [freelancerId]);
  return res.rows[0] || null;
}

export async function refreshMaterializedViews() {
  await query('CALL refresh_all_materialized_views();');
  return { success: true, message: 'All database materialized views refreshed successfully.' };
}
