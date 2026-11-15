-- ============================================================================
-- FreelanceHub Database Functions (ADBMS Module)
-- Engine: PostgreSQL 18
-- ============================================================================

-- 1. FUNCTION: calculate_freelancer_rating
-- Computes average rating for a freelancer from verified contract reviews
CREATE OR REPLACE FUNCTION calculate_freelancer_rating(p_freelancer_id UUID)
RETURNS NUMERIC(3, 2)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_avg_rating NUMERIC(3, 2);
BEGIN
    SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0.00)
    INTO v_avg_rating
    FROM reviews
    WHERE reviewee_id = p_freelancer_id;

    RETURN v_avg_rating;
END;
$$;


-- 2. FUNCTION: get_total_freelancer_earnings
-- Calculates verified cumulative earnings received by a freelancer
CREATE OR REPLACE FUNCTION get_total_freelancer_earnings(p_freelancer_id UUID)
RETURNS NUMERIC(14, 2)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_total NUMERIC(14, 2);
BEGIN
    SELECT COALESCE(SUM(wt.amount), 0.00)
    INTO v_total
    FROM wallet_transactions wt
    JOIN wallets w ON wt.wallet_id = w.id
    WHERE w.user_id = p_freelancer_id
      AND wt.transaction_type = 'PAYMENT_RELEASE';

    RETURN v_total;
END;
$$;


-- 3. FUNCTION: get_client_total_spending
-- Computes the total spending successfully disbursed by a client
CREATE OR REPLACE FUNCTION get_client_total_spending(p_client_id UUID)
RETURNS NUMERIC(14, 2)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_total NUMERIC(14, 2);
BEGIN
    SELECT COALESCE(SUM(wt.amount), 0.00)
    INTO v_total
    FROM wallet_transactions wt
    JOIN wallets w ON wt.wallet_id = w.id
    WHERE w.user_id = p_client_id
      AND wt.transaction_type = 'PAYMENT_RELEASE';

    RETURN v_total;
END;
$$;


-- 4. FUNCTION: get_project_proposal_count
-- Returns current number of active/pending proposals on a project
CREATE OR REPLACE FUNCTION get_project_proposal_count(p_project_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER
    INTO v_count
    FROM proposals
    WHERE project_id = p_project_id;

    RETURN v_count;
END;
$$;


-- 5. FUNCTION: get_monthly_platform_analytics
-- Returns key platform performance indicators for a specified month and year
CREATE OR REPLACE FUNCTION get_monthly_platform_analytics(p_year INTEGER, p_month INTEGER)
RETURNS TABLE (
    year_num INT,
    month_num INT,
    new_users BIGINT,
    new_projects BIGINT,
    contracts_created BIGINT,
    total_volume NUMERIC(14, 2)
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p_year AS year_num,
        p_month AS month_num,
        (SELECT COUNT(*) FROM users 
         WHERE EXTRACT(YEAR FROM created_at) = p_year 
           AND EXTRACT(MONTH FROM created_at) = p_month) AS new_users,
        (SELECT COUNT(*) FROM projects 
         WHERE EXTRACT(YEAR FROM created_at) = p_year 
           AND EXTRACT(MONTH FROM created_at) = p_month) AS new_projects,
        (SELECT COUNT(*) FROM contracts 
         WHERE EXTRACT(YEAR FROM created_at) = p_year 
           AND EXTRACT(MONTH FROM created_at) = p_month) AS contracts_created,
        (SELECT COALESCE(SUM(amount), 0.00) FROM wallet_transactions 
         WHERE transaction_type = 'PAYMENT_RELEASE'
           AND EXTRACT(YEAR FROM created_at) = p_year 
           AND EXTRACT(MONTH FROM created_at) = p_month) / 2.0 AS total_volume; 
           -- Divided by 2 because PAYMENT_RELEASE creates 2 entries (debit from client, credit to freelancer)
END;
$$;
