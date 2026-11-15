-- ============================================================================
-- FreelanceHub Database Views (ADBMS Module)
-- Engine: PostgreSQL 18
-- ============================================================================

-- 1. VIEW: freelancer_dashboard_view
CREATE OR REPLACE VIEW freelancer_dashboard_view AS
SELECT
    u.id AS user_id,
    u.name,
    u.email,
    u.status AS user_status,
    fp.id AS profile_id,
    fp.title,
    fp.bio,
    fp.hourly_rate,
    fp.experience_level,
    fp.availability,
    fp.total_earnings,
    fp.average_rating,
    fp.completed_projects_count,
    w.available_balance,
    w.reserved_balance,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'PENDING') AS pending_proposals_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'ACCEPTED') AS accepted_proposals_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'REJECTED') AS rejected_proposals_count,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'ACTIVE') AS active_contracts_count,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'COMPLETED') AS completed_contracts_count
FROM users u
JOIN freelancer_profiles fp ON u.id = fp.user_id
LEFT JOIN wallets w ON u.id = w.user_id
LEFT JOIN proposals p ON u.id = p.freelancer_id
LEFT JOIN contracts c ON u.id = c.freelancer_id
WHERE u.role = 'FREELANCER'
GROUP BY u.id, u.name, u.email, u.status, fp.id, fp.title, fp.bio, fp.hourly_rate,
         fp.experience_level, fp.availability, fp.total_earnings, fp.average_rating,
         fp.completed_projects_count, w.available_balance, w.reserved_balance;


-- 2. VIEW: client_dashboard_view
CREATE OR REPLACE VIEW client_dashboard_view AS
SELECT
    u.id AS user_id,
    u.name,
    u.email,
    u.status AS user_status,
    cp.id AS profile_id,
    cp.company_name,
    cp.total_spent,
    w.available_balance,
    w.reserved_balance,
    COUNT(DISTINCT pr.id) AS total_projects,
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.status = 'OPEN') AS open_projects,
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.status = 'IN_PROGRESS') AS in_progress_projects,
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.status = 'COMPLETED') AS completed_projects,
    COUNT(DISTINCT prop.id) FILTER (WHERE prop.status = 'PENDING') AS pending_proposals_count
FROM users u
JOIN client_profiles cp ON u.id = cp.user_id
LEFT JOIN wallets w ON u.id = w.user_id
LEFT JOIN projects pr ON u.id = pr.client_id
LEFT JOIN proposals prop ON pr.id = prop.project_id
WHERE u.role = 'CLIENT'
GROUP BY u.id, u.name, u.email, u.status, cp.id, cp.company_name, cp.total_spent,
         w.available_balance, w.reserved_balance;


-- 3. VIEW: active_projects_view
CREATE OR REPLACE VIEW active_projects_view AS
SELECT
    p.id AS project_id,
    p.title,
    p.description,
    p.project_type,
    p.experience_level,
    p.min_budget,
    p.max_budget,
    p.deadline,
    p.status,
    p.created_at,
    c.id AS category_id,
    c.name AS category_name,
    u.id AS client_id,
    u.name AS client_name,
    cp.company_name,
    COUNT(DISTINCT prop.id) AS proposal_count,
    COALESCE(
        json_agg(
            json_build_object('id', s.id, 'name', s.name)
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
    ) AS required_skills
FROM projects p
JOIN categories c ON p.category_id = c.id
JOIN users u ON p.client_id = u.id
LEFT JOIN client_profiles cp ON u.id = cp.user_id
LEFT JOIN proposals prop ON p.id = prop.project_id
LEFT JOIN project_skills ps ON p.id = ps.project_id
LEFT JOIN skills s ON ps.skill_id = s.id
WHERE p.status = 'OPEN'
GROUP BY p.id, p.title, p.description, p.project_type, p.experience_level,
         p.min_budget, p.max_budget, p.deadline, p.status, p.created_at,
         c.id, c.name, u.id, u.name, cp.company_name;


-- 4. VIEW: completed_contracts_view
CREATE OR REPLACE VIEW completed_contracts_view AS
SELECT
    ct.id AS contract_id,
    ct.project_id,
    p.title AS project_title,
    ct.agreed_amount,
    ct.start_date,
    ct.end_date,
    ct.client_id,
    u_client.name AS client_name,
    ct.freelancer_id,
    u_free.name AS freelancer_name,
    r.rating AS client_given_rating,
    r.comment AS client_review_comment
FROM contracts ct
JOIN projects p ON ct.project_id = p.id
JOIN users u_client ON ct.client_id = u_client.id
JOIN users u_free ON ct.freelancer_id = u_free.id
LEFT JOIN reviews r ON ct.id = r.contract_id AND r.reviewer_id = ct.client_id
WHERE ct.status = 'COMPLETED';


-- 5. VIEW: transaction_history_view
CREATE OR REPLACE VIEW transaction_history_view AS
SELECT
    wt.id AS transaction_id,
    wt.wallet_id,
    w.user_id,
    u.name AS user_name,
    u.email AS user_email,
    u.role AS user_role,
    wt.transaction_type,
    wt.amount,
    wt.description,
    wt.milestone_id,
    m.title AS milestone_title,
    m.contract_id,
    wt.created_at
FROM wallet_transactions wt
JOIN wallets w ON wt.wallet_id = w.id
JOIN users u ON w.user_id = u.id
LEFT JOIN milestones m ON wt.milestone_id = m.id
ORDER BY wt.created_at DESC;


-- 6. VIEW: top_freelancers_view
CREATE OR REPLACE VIEW top_freelancers_view AS
SELECT
    u.id AS user_id,
    u.name,
    u.email,
    u.avatar_url,
    fp.title,
    fp.experience_level,
    fp.hourly_rate,
    fp.availability,
    fp.total_earnings,
    fp.average_rating,
    fp.completed_projects_count,
    COUNT(DISTINCT r.id) AS review_count,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object('id', s.id, 'name', s.name, 'level', fs.proficiency_level)
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
    ) AS skills
FROM users u
JOIN freelancer_profiles fp ON u.id = fp.user_id
LEFT JOIN reviews r ON u.id = r.reviewee_id
LEFT JOIN freelancer_skills fs ON fp.id = fs.freelancer_id
LEFT JOIN skills s ON fs.skill_id = s.id
WHERE u.status = 'ACTIVE' AND u.role = 'FREELANCER'
GROUP BY u.id, u.name, u.email, u.avatar_url, fp.title, fp.experience_level,
         fp.hourly_rate, fp.availability, fp.total_earnings, fp.average_rating,
         fp.completed_projects_count
ORDER BY fp.average_rating DESC, fp.completed_projects_count DESC, fp.total_earnings DESC;
