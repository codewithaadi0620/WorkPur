-- ============================================================================
-- FreelanceHub Indexing Benchmarks & Query Optimization Evidence
-- Engine: PostgreSQL 18
-- Demonstration of EXPLAIN ANALYZE performance with B-tree & Composite Indexes
-- ============================================================================

-- Benchmark Query 1: Filter Active Projects in Category
EXPLAIN ANALYZE
SELECT p.id, p.title, p.min_budget, p.max_budget, p.deadline
FROM projects p
WHERE p.category_id = '30000000-0000-4000-a000-000000000001'
  AND p.status = 'OPEN';

-- Benchmark Query 2: Proposals Lookup by Project & Status
EXPLAIN ANALYZE
SELECT prop.id, prop.freelancer_id, prop.proposed_amount, prop.estimated_days, prop.status
FROM proposals prop
WHERE prop.project_id = '50000000-0000-4000-a000-000000000003'
  AND prop.status = 'PENDING';

-- Benchmark Query 3: Freelancer Reviews by Rating
EXPLAIN ANALYZE
SELECT r.rating, r.comment, r.created_at
FROM reviews r
WHERE r.reviewee_id = '20000000-0000-4000-a000-000000000003'
ORDER BY r.rating DESC;

-- Benchmark Query 4: Freelancer Performance Analytics with Materialized View
EXPLAIN ANALYZE
SELECT * FROM freelancer_performance_analytics
WHERE experience_level = 'EXPERT'
ORDER BY total_contract_earnings DESC;
