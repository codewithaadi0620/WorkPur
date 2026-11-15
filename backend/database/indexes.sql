-- ============================================================================
-- FreelanceHub Database Indexes (ADBMS Module)
-- Performance Optimization and Query Benchmarking
-- Engine: PostgreSQL 18
-- ============================================================================

-- 1. B-tree Indexes for High-Frequency Filter & Foreign Keys
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);

CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

CREATE INDEX IF NOT EXISTS idx_contracts_project_id ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_freelancer_id ON contracts(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

CREATE INDEX IF NOT EXISTS idx_milestones_contract_id ON milestones(contract_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_milestone ON wallet_transactions(milestone_id);

CREATE INDEX IF NOT EXISTS idx_reviews_contract_id ON reviews(contract_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_freelancer_skills_freelancer_id ON freelancer_skills(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_skills_skill_id ON freelancer_skills(skill_id);

CREATE INDEX IF NOT EXISTS idx_project_skills_project_id ON project_skills(project_id);
CREATE INDEX IF NOT EXISTS idx_project_skills_skill_id ON project_skills(skill_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_name, entity_id);

-- 2. COMPOSITE INDEXES for Multi-Column Queries
-- Optimizes active project searches filtering by category and status
CREATE INDEX IF NOT EXISTS idx_projects_category_status 
ON projects(category_id, status);

-- Optimizes proposal lookup for client dashboard reviewing proposals per project
CREATE INDEX IF NOT EXISTS idx_proposals_project_status 
ON proposals(project_id, status);

-- Optimizes freelancer review calculations and ratings
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_rating 
ON reviews(reviewee_id, rating);

-- Optimizes smart freelancer matching by experience and rating
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_exp_rating 
ON freelancer_profiles(experience_level, average_rating DESC);

-- Optimizes wallet transactions date sorting
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_created 
ON wallet_transactions(wallet_id, created_at DESC);
