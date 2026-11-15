-- ============================================================================
-- FreelanceHub Database Materialized Views (ADBMS Module)
-- Engine: PostgreSQL 18
-- ============================================================================

-- 1. MATERIALIZED VIEW: monthly_platform_analytics
DROP MATERIALIZED VIEW IF EXISTS monthly_platform_analytics CASCADE;
CREATE MATERIALIZED VIEW monthly_platform_analytics AS
SELECT
    TO_CHAR(d.month_date, 'YYYY-MM') AS month_label,
    EXTRACT(YEAR FROM d.month_date)::INT AS year,
    EXTRACT(MONTH FROM d.month_date)::INT AS month,
    COUNT(DISTINCT u.id) AS total_registrations,
    COUNT(DISTINCT p.id) AS total_projects_posted,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'ACTIVE') AS active_contracts,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'COMPLETED') AS completed_contracts,
    COALESCE(SUM(wt.amount) FILTER (WHERE wt.transaction_type = 'PAYMENT_RELEASE'), 0.00) / 2.0 AS total_payments_released,
    COALESCE(AVG(c.agreed_amount), 0.00) AS avg_contract_value
FROM (
    SELECT generate_series(
        DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months'),
        DATE_TRUNC('month', CURRENT_DATE),
        '1 month'::interval
    ) AS month_date
) d
LEFT JOIN users u ON DATE_TRUNC('month', u.created_at) = d.month_date
LEFT JOIN projects p ON DATE_TRUNC('month', p.created_at) = d.month_date
LEFT JOIN contracts c ON DATE_TRUNC('month', c.created_at) = d.month_date
LEFT JOIN wallet_transactions wt ON DATE_TRUNC('month', wt.created_at) = d.month_date
GROUP BY d.month_date
ORDER BY d.month_date ASC;

-- Unique index to support concurrent refresh
CREATE UNIQUE INDEX idx_mat_monthly_analytics ON monthly_platform_analytics (month_label);


-- 2. MATERIALIZED VIEW: freelancer_performance_analytics
DROP MATERIALIZED VIEW IF EXISTS freelancer_performance_analytics CASCADE;
CREATE MATERIALIZED VIEW freelancer_performance_analytics AS
SELECT
    u.id AS freelancer_id,
    u.name,
    u.email,
    fp.experience_level,
    fp.hourly_rate,
    fp.average_rating,
    COUNT(p.id) AS total_proposals_submitted,
    COUNT(p.id) FILTER (WHERE p.status = 'ACCEPTED') AS proposals_accepted,
    ROUND(
        CASE 
            WHEN COUNT(p.id) = 0 THEN 0.00
            ELSE (COUNT(p.id) FILTER (WHERE p.status = 'ACCEPTED')::NUMERIC / COUNT(p.id)::NUMERIC) * 100.0
        END, 
        2
    ) AS acceptance_rate_pct,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'COMPLETED') AS completed_contracts,
    COALESCE(SUM(c.agreed_amount) FILTER (WHERE c.status = 'COMPLETED'), 0.00) AS total_contract_earnings,
    COUNT(DISTINCT r.id) AS total_reviews_received
FROM users u
JOIN freelancer_profiles fp ON u.id = fp.user_id
LEFT JOIN proposals p ON u.id = p.freelancer_id
LEFT JOIN contracts c ON u.id = c.freelancer_id
LEFT JOIN reviews r ON u.id = r.reviewee_id
WHERE u.role = 'FREELANCER'
GROUP BY u.id, u.name, u.email, fp.experience_level, fp.hourly_rate, fp.average_rating;

CREATE UNIQUE INDEX idx_mat_freelancer_perf ON freelancer_performance_analytics (freelancer_id);


-- 3. MATERIALIZED VIEW: project_category_statistics
DROP MATERIALIZED VIEW IF EXISTS project_category_statistics CASCADE;
CREATE MATERIALIZED VIEW project_category_statistics AS
SELECT
    c.id AS category_id,
    c.name AS category_name,
    c.slug,
    COUNT(DISTINCT p.id) AS total_projects,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'OPEN') AS open_projects,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'IN_PROGRESS') AS in_progress_projects,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'COMPLETED') AS completed_projects,
    COALESCE(ROUND(AVG(p.min_budget), 2), 0.00) AS avg_min_budget,
    COALESCE(ROUND(AVG(p.max_budget), 2), 0.00) AS avg_max_budget,
    COALESCE(SUM(ct.agreed_amount), 0.00) AS total_category_contract_value
FROM categories c
LEFT JOIN projects p ON c.id = p.category_id
LEFT JOIN contracts ct ON p.id = ct.project_id
GROUP BY c.id, c.name, c.slug;

CREATE UNIQUE INDEX idx_mat_category_stats ON project_category_statistics (category_id);


-- 4. PROCEDURE: refresh_all_materialized_views
-- Refreshes all materialized views with latest transactional data
CREATE OR REPLACE PROCEDURE refresh_all_materialized_views()
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW monthly_platform_analytics;
    REFRESH MATERIALIZED VIEW freelancer_performance_analytics;
    REFRESH MATERIALIZED VIEW project_category_statistics;
END;
$$;
