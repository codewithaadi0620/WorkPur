-- ============================================================================
-- FreelanceHub Advanced SQL Queries (ADBMS Module)
-- Requirements: 15+ meaningful complex queries demonstrating CTEs, Window
-- Functions, Correlated Subqueries, Aggregations, Joins, and Relational Set Operations.
-- Database Engine: PostgreSQL 18
-- ============================================================================

-- ============================================================================
-- QUERY 1: Window Function - Freelancers Ranked by Earnings within Experience Level
-- Concept: DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...), Multi-Table JOIN
-- Purpose: Evaluate top earners in each experience tier (Entry, Intermediate, Expert)
-- ============================================================================
SELECT 
    u.id AS freelancer_id,
    u.name AS freelancer_name,
    fp.experience_level,
    fp.total_earnings,
    fp.average_rating,
    DENSE_RANK() OVER (
        PARTITION BY fp.experience_level 
        ORDER BY fp.total_earnings DESC
    ) AS earning_rank_within_tier
FROM users u
JOIN freelancer_profiles fp ON u.id = fp.user_id
WHERE u.role = 'FREELANCER' AND u.status = 'ACTIVE'
ORDER BY fp.experience_level, earning_rank_within_tier;


-- ============================================================================
-- QUERY 2: Multi-level CTE with Rolling Spend & Cumulative Monthly Volume
-- Concept: Recursive/Sequential CTEs, Window SUM() OVER (ORDER BY ...)
-- Purpose: Track monthly platform GMV and cumulative platform-wide turnover
-- ============================================================================
WITH MonthlyTransactions AS (
    SELECT 
        DATE_TRUNC('month', wt.created_at) AS month_start,
        COUNT(wt.id) AS tx_count,
        SUM(wt.amount) / 2.0 AS monthly_gmv
    FROM wallet_transactions wt
    WHERE wt.transaction_type = 'PAYMENT_RELEASE'
    GROUP BY DATE_TRUNC('month', wt.created_at)
)
SELECT 
    TO_CHAR(month_start, 'YYYY-MM') AS billing_month,
    tx_count,
    ROUND(monthly_gmv, 2) AS monthly_gmv,
    ROUND(SUM(monthly_gmv) OVER (ORDER BY month_start ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS cumulative_gmv
FROM MonthlyTransactions
ORDER BY month_start;


-- ============================================================================
-- QUERY 3: Correlated Subquery - Clients Whose Average Project Budget Exceeds Platform Average
-- Concept: Correlated Subquery, Subquery in WHERE clause, Conditional Expressions
-- Purpose: Identify high-ticket premium enterprise clients
-- ============================================================================
SELECT 
    u.id AS client_id,
    u.name AS client_name,
    cp.company_name,
    (SELECT COUNT(*) FROM projects p WHERE p.client_id = u.id) AS total_projects,
    (SELECT ROUND(AVG(p.max_budget), 2) FROM projects p WHERE p.client_id = u.id) AS client_avg_budget
FROM users u
JOIN client_profiles cp ON u.id = cp.user_id
WHERE u.role = 'CLIENT'
  AND (
      SELECT AVG(p.max_budget) 
      FROM projects p 
      WHERE p.client_id = u.id
  ) > (
      SELECT AVG(max_budget) 
      FROM projects
  )
ORDER BY client_avg_budget DESC;


-- ============================================================================
-- QUERY 4: Window Function - Row Numbering Proposals per Project to Identify Earliest Submissions
-- Concept: ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...), JOIN
-- Purpose: Analyze early bird applicants and see if faster submissions correlate with acceptance
-- ============================================================================
SELECT 
    p.title AS project_title,
    u.name AS freelancer_name,
    prop.proposed_amount,
    prop.created_at AS submitted_at,
    prop.status AS proposal_status,
    ROW_NUMBER() OVER (
        PARTITION BY prop.project_id 
        ORDER BY prop.created_at ASC
    ) AS submission_sequence
FROM proposals prop
JOIN projects p ON prop.project_id = p.id
JOIN users u ON prop.freelancer_id = u.id
ORDER BY prop.project_id, submission_sequence;


-- ============================================================================
-- QUERY 5: Relational Set Operation - NOT EXISTS: Freelancers Without Any Rejected Proposals
-- Concept: NOT EXISTS correlated subquery, Negation Filtering
-- Purpose: Identify high-performing freelancers with 100% clean application records
-- ============================================================================
SELECT 
    u.id AS freelancer_id,
    u.name AS freelancer_name,
    fp.title,
    fp.total_earnings
FROM users u
JOIN freelancer_profiles fp ON u.id = fp.user_id
WHERE u.role = 'FREELANCER'
  AND EXISTS (SELECT 1 FROM proposals p WHERE p.freelancer_id = u.id) -- At least 1 proposal
  AND NOT EXISTS (
      SELECT 1 
      FROM proposals p 
      WHERE p.freelancer_id = u.id AND p.status = 'REJECTED'
  );


-- ============================================================================
-- QUERY 6: GROUP BY with HAVING - Project Categories with High Demand & High Competition
-- Concept: GROUP BY, HAVING, Multi-Table Joins, Aggregate Functions
-- Purpose: Find categories having more than 2 projects and an average proposal count > 1.5
-- ============================================================================
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COUNT(DISTINCT p.id) AS project_count,
    COUNT(prop.id) AS total_proposals_received,
    ROUND(COUNT(prop.id)::NUMERIC / NULLIF(COUNT(DISTINCT p.id), 0), 2) AS avg_proposals_per_project,
    ROUND(AVG(p.max_budget), 2) AS category_avg_max_budget
FROM categories c
JOIN projects p ON c.id = p.category_id
LEFT JOIN proposals prop ON p.id = prop.project_id
GROUP BY c.id, c.name
HAVING COUNT(DISTINCT p.id) >= 2 
   AND COUNT(prop.id)::NUMERIC / NULLIF(COUNT(DISTINCT p.id), 0) >= 1.0
ORDER BY avg_proposals_per_project DESC;


-- ============================================================================
-- QUERY 7: Window Function - NTILE(4) Quartile Segmentation of Contract Sizes
-- Concept: NTILE() Window Function, Statistical Distribution
-- Purpose: Classify platform contracts into 4 budget quartiles (Economy, Standard, Premium, Enterprise)
-- ============================================================================
SELECT 
    c.id AS contract_id,
    p.title AS project_title,
    c.agreed_amount,
    NTILE(4) OVER (ORDER BY c.agreed_amount ASC) AS budget_quartile,
    CASE NTILE(4) OVER (ORDER BY c.agreed_amount ASC)
        WHEN 1 THEN 'Tier 1 - Economy'
        WHEN 2 THEN 'Tier 2 - Moderate'
        WHEN 3 THEN 'Tier 3 - Premium'
        WHEN 4 THEN 'Tier 4 - Enterprise'
    END AS budget_tier_name
FROM contracts c
JOIN projects p ON c.project_id = p.id
ORDER BY c.agreed_amount DESC;


-- ============================================================================
-- QUERY 8: Multi-table Skill Match Matrix - Matching Freelancers to Open Projects
-- Concept: Multi-table JOIN, ARRAY_AGG, Array Overlap/Intersection
-- Purpose: Calculate skill match percentage between candidate skills and project required skills
-- ============================================================================
WITH ProjectSkillRequirements AS (
    SELECT 
        p.id AS project_id,
        p.title,
        p.min_budget,
        p.max_budget,
        ARRAY_AGG(ps.skill_id) AS required_skill_ids,
        COUNT(ps.skill_id) AS total_required_skills
    FROM projects p
    JOIN project_skills ps ON p.id = ps.project_id
    WHERE p.status = 'OPEN'
    GROUP BY p.id, p.title, p.min_budget, p.max_budget
),
FreelancerSkillsAggregate AS (
    SELECT 
        fp.user_id,
        ARRAY_AGG(fs.skill_id) AS possessed_skill_ids
    FROM freelancer_profiles fp
    JOIN freelancer_skills fs ON fp.id = fs.freelancer_id
    GROUP BY fp.user_id
)
SELECT 
    psr.title AS project_title,
    u.name AS freelancer_name,
    psr.total_required_skills,
    (
        SELECT COUNT(*) 
        FROM UNNEST(psr.required_skill_ids) s_req 
        WHERE s_req = ANY(fsa.possessed_skill_ids)
    ) AS matching_skills_count,
    ROUND(
        (
            (SELECT COUNT(*) FROM UNNEST(psr.required_skill_ids) s_req WHERE s_req = ANY(fsa.possessed_skill_ids))::NUMERIC 
            / NULLIF(psr.total_required_skills, 0)::NUMERIC
        ) * 100.0, 
        1
    ) AS match_percentage
FROM ProjectSkillRequirements psr
CROSS JOIN FreelancerSkillsAggregate fsa
JOIN users u ON fsa.user_id = u.id
WHERE (
    SELECT COUNT(*) 
    FROM UNNEST(psr.required_skill_ids) s_req 
    WHERE s_req = ANY(fsa.possessed_skill_ids)
) > 0
ORDER BY match_percentage DESC;


-- ============================================================================
-- QUERY 9: Conditional Aggregation - Milestone Completion Rate and Financial Health
-- Concept: CASE inside SUM(), Financial Aggregation
-- Purpose: Breakdown milestone amounts by progress state per active contract
-- ============================================================================
SELECT 
    ct.id AS contract_id,
    p.title AS project_title,
    ct.agreed_amount,
    COUNT(m.id) AS total_milestones,
    SUM(CASE WHEN m.status = 'PAID' THEN m.amount ELSE 0.00 END) AS paid_amount,
    SUM(CASE WHEN m.status = 'APPROVED' THEN m.amount ELSE 0.00 END) AS pending_release_amount,
    SUM(CASE WHEN m.status = 'SUBMITTED' THEN m.amount ELSE 0.00 END) AS in_review_amount,
    SUM(CASE WHEN m.status = 'PENDING' THEN m.amount ELSE 0.00 END) AS pending_work_amount,
    ROUND(
        (SUM(CASE WHEN m.status = 'PAID' THEN m.amount ELSE 0.00 END) / NULLIF(ct.agreed_amount, 0)) * 100.0,
        2
    ) AS payout_completion_pct
FROM contracts ct
JOIN projects p ON ct.project_id = p.id
LEFT JOIN milestones m ON ct.id = m.contract_id
GROUP BY ct.id, p.title, ct.agreed_amount
ORDER BY payout_completion_pct DESC;


-- ============================================================================
-- QUERY 10: Window Function - LAG() to Analyze Pricing Competitiveness vs Prior Submissions
-- Concept: LAG() OVER (PARTITION BY ... ORDER BY ...)
-- Purpose: Determine if freelancers adjust proposal bids downward compared to competitors
-- ============================================================================
SELECT 
    prop.project_id,
    p.title AS project_title,
    u.name AS bidder_name,
    prop.proposed_amount,
    LAG(prop.proposed_amount, 1) OVER (
        PARTITION BY prop.project_id 
        ORDER BY prop.created_at ASC
    ) AS previous_bid_amount,
    ROUND(
        prop.proposed_amount - LAG(prop.proposed_amount, 1) OVER (
            PARTITION BY prop.project_id 
            ORDER BY prop.created_at ASC
        ), 
        2
    ) AS bid_difference_from_previous
FROM proposals prop
JOIN projects p ON prop.project_id = p.id
JOIN users u ON prop.freelancer_id = u.id
ORDER BY prop.project_id, prop.created_at;


-- ============================================================================
-- QUERY 11: Set Division Simulation - Freelancers Who Possess All Skills in a Category
-- Concept: Relational Division, NOT EXISTS within NOT EXISTS
-- Purpose: Find comprehensive specialists covering every skill in 'Web Development'
-- ============================================================================
SELECT 
    u.id AS freelancer_id,
    u.name AS specialist_name,
    fp.title
FROM users u
JOIN freelancer_profiles fp ON u.id = fp.user_id
WHERE u.role = 'FREELANCER'
  AND NOT EXISTS (
      -- All skills belonging to Web Development
      SELECT s.id 
      FROM skills s
      JOIN categories c ON s.category_id = c.id
      WHERE c.slug = 'web-development'
      EXCEPT
      -- Skills that the freelancer possesses
      SELECT fs.skill_id 
      FROM freelancer_skills fs
      WHERE fs.freelancer_id = fp.id
  );


-- ============================================================================
-- QUERY 12: Window Function - LEAD() to Determine Turnaround Duration Between Milestones
-- Concept: LEAD() OVER (PARTITION BY ... ORDER BY ...), Interval Arithmetic
-- Purpose: Analyze project pacing and average delay between consecutive milestones
-- ============================================================================
SELECT 
    m.contract_id,
    m.title AS milestone_title,
    m.amount,
    m.status,
    m.created_at,
    LEAD(m.created_at, 1) OVER (
        PARTITION BY m.contract_id 
        ORDER BY m.created_at ASC
    ) AS next_milestone_created,
    AGE(
        LEAD(m.created_at, 1) OVER (
            PARTITION BY m.contract_id 
            ORDER BY m.created_at ASC
        ),
        m.created_at
    ) AS time_gap_to_next_milestone
FROM milestones m
ORDER BY m.contract_id, m.created_at;


-- ============================================================================
-- QUERY 13: CTE with Window PERCENT_RANK() - Client Spending Distribution
-- Concept: PERCENT_RANK() OVER (ORDER BY ...), CTE
-- Purpose: Identify top 10% highest spending clients for VIP loyalty incentives
-- ============================================================================
WITH ClientSpends AS (
    SELECT 
        u.id AS client_id,
        u.name AS client_name,
        cp.company_name,
        cp.total_spent
    FROM users u
    JOIN client_profiles cp ON u.id = cp.user_id
    WHERE u.role = 'CLIENT'
)
SELECT 
    client_name,
    company_name,
    total_spent,
    ROUND((PERCENT_RANK() OVER (ORDER BY total_spent ASC) * 100.0)::NUMERIC, 2) AS spending_percentile,
    CASE 
        WHEN PERCENT_RANK() OVER (ORDER BY total_spent ASC) >= 0.90 THEN 'VIP Tier'
        WHEN PERCENT_RANK() OVER (ORDER BY total_spent ASC) >= 0.50 THEN 'Preferred Tier'
        ELSE 'Standard Tier'
    END AS tier_classification
FROM ClientSpends
ORDER BY total_spent DESC;


-- ============================================================================
-- QUERY 14: Audit Trail Anomaly Detection - High-Volume Rapid Transactions
-- Concept: Window COUNT() OVER (PARTITION BY ... ORDER BY ... RANGE BETWEEN ...)
-- Purpose: ADBMS security audit detecting potential fraud or duplicate double-spend
-- ============================================================================
SELECT 
    wt.id AS transaction_id,
    wt.wallet_id,
    wt.transaction_type,
    wt.amount,
    wt.created_at,
    COUNT(*) OVER (
        PARTITION BY wt.wallet_id 
        ORDER BY wt.created_at 
        RANGE BETWEEN INTERVAL '1 hour' PRECEDING AND CURRENT ROW
    ) AS transactions_in_last_hour
FROM wallet_transactions wt
ORDER BY transactions_in_last_hour DESC, wt.created_at DESC;


-- ============================================================================
-- QUERY 15: Cross-Join & Matrix Aggregation - Category Skill Density & Coverage
-- Concept: GROUP BY, COUNT, Cross-Join verification, Density Metric
-- Purpose: ADBMS Data quality check: Analyze skill availability per category
-- ============================================================================
SELECT 
    c.name AS category_name,
    COUNT(DISTINCT s.id) AS total_skills_cataloged,
    COUNT(DISTINCT fs.freelancer_id) AS qualified_freelancers_available,
    COUNT(DISTINCT ps.project_id) AS active_projects_demanding_category_skills
FROM categories c
LEFT JOIN skills s ON c.id = s.category_id
LEFT JOIN freelancer_skills fs ON s.id = fs.skill_id
LEFT JOIN project_skills ps ON s.id = ps.skill_id
GROUP BY c.id, c.name
ORDER BY qualified_freelancers_available DESC;
