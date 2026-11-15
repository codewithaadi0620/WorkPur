-- ============================================================================
-- FreelanceHub Database Seed Data (ADBMS Module)
-- Realistic Demonstration Dataset for ADBMS Evaluation
-- Default password for all seed accounts: password123
-- Hash: $2b$10$ox44ixTFUDGJpJ/V/kIySuzk6YvTQBz2MXt5ra9kWxm4PsddBp6iC
-- ============================================================================

DO $$
DECLARE
    -- Password hash for 'password123'
    v_pwd VARCHAR := '$2b$10$ox44ixTFUDGJpJ/V/kIySuzk6YvTQBz2MXt5ra9kWxm4PsddBp6iC';

    -- User IDs
    u_admin UUID := '00000000-0000-4000-a000-000000000001';
    
    -- Client IDs
    u_c1 UUID := '10000000-0000-4000-a000-000000000001';
    u_c2 UUID := '10000000-0000-4000-a000-000000000002';
    u_c3 UUID := '10000000-0000-4000-a000-000000000003';
    u_c4 UUID := '10000000-0000-4000-a000-000000000004';
    u_c5 UUID := '10000000-0000-4000-a000-000000000005';

    -- Freelancer IDs
    u_f1 UUID := '20000000-0000-4000-a000-000000000001';
    u_f2 UUID := '20000000-0000-4000-a000-000000000002';
    u_f3 UUID := '20000000-0000-4000-a000-000000000003';
    u_f4 UUID := '20000000-0000-4000-a000-000000000004';
    u_f5 UUID := '20000000-0000-4000-a000-000000000005';
    u_f6 UUID := '20000000-0000-4000-a000-000000000006';
    u_f7 UUID := '20000000-0000-4000-a000-000000000007';
    u_f8 UUID := '20000000-0000-4000-a000-000000000008';
    u_f9 UUID := '20000000-0000-4000-a000-000000000009';
    u_f10 UUID := '20000000-0000-4000-a000-000000000010';

    -- Category IDs
    cat_web UUID := '30000000-0000-4000-a000-000000000001';
    cat_mobile UUID := '30000000-0000-4000-a000-000000000002';
    cat_db UUID := '30000000-0000-4000-a000-000000000003';
    cat_uiux UUID := '30000000-0000-4000-a000-000000000004';
    cat_devops UUID := '30000000-0000-4000-a000-000000000005';
    cat_ai UUID := '30000000-0000-4000-a000-000000000006';
    cat_security UUID := '30000000-0000-4000-a000-000000000007';
    cat_qa UUID := '30000000-0000-4000-a000-000000000008';

    -- Skill IDs
    sk_react UUID := '40000000-0000-4000-a000-000000000001';
    sk_node UUID := '40000000-0000-4000-a000-000000000002';
    sk_pg UUID := '40000000-0000-4000-a000-000000000003';
    sk_ts UUID := '40000000-0000-4000-a000-000000000004';
    sk_rn UUID := '40000000-0000-4000-a000-000000000005';
    sk_figma UUID := '40000000-0000-4000-a000-000000000006';
    sk_docker UUID := '40000000-0000-4000-a000-000000000007';
    sk_k8s UUID := '40000000-0000-4000-a000-000000000008';
    sk_py UUID := '40000000-0000-4000-a000-000000000009';
    sk_next UUID := '40000000-0000-4000-a000-000000000010';
    sk_graphql UUID := '40000000-0000-4000-a000-000000000011';
    sk_aws UUID := '40000000-0000-4000-a000-000000000012';
    sk_sec UUID := '40000000-0000-4000-a000-000000000013';
    sk_tailwind UUID := '40000000-0000-4000-a000-000000000014';
    sk_jest UUID := '40000000-0000-4000-a000-000000000015';
    sk_prisma UUID := '40000000-0000-4000-a000-000000000016';

    -- Project IDs
    p_1 UUID := '50000000-0000-4000-a000-000000000001';
    p_2 UUID := '50000000-0000-4000-a000-000000000002';
    p_3 UUID := '50000000-0000-4000-a000-000000000003';
    p_4 UUID := '50000000-0000-4000-a000-000000000004';
    p_5 UUID := '50000000-0000-4000-a000-000000000005';
    p_6 UUID := '50000000-0000-4000-a000-000000000006';
    p_7 UUID := '50000000-0000-4000-a000-000000000007';
    p_8 UUID := '50000000-0000-4000-a000-000000000008';
    p_9 UUID := '50000000-0000-4000-a000-000000000009';
    p_10 UUID := '50000000-0000-4000-a000-000000000010';
    p_11 UUID := '50000000-0000-4000-a000-000000000011';
    p_12 UUID := '50000000-0000-4000-a000-000000000012';
    p_13 UUID := '50000000-0000-4000-a000-000000000013';
    p_14 UUID := '50000000-0000-4000-a000-000000000014';
    p_15 UUID := '50000000-0000-4000-a000-000000000015';
    p_16 UUID := '50000000-0000-4000-a000-000000000016';
    p_17 UUID := '50000000-0000-4000-a000-000000000017';
    p_18 UUID := '50000000-0000-4000-a000-000000000018';
    p_19 UUID := '50000000-0000-4000-a000-000000000019';
    p_20 UUID := '50000000-0000-4000-a000-000000000020';

    -- Proposal IDs
    prop_1 UUID := '60000000-0000-4000-a000-000000000001';
    prop_2 UUID := '60000000-0000-4000-a000-000000000002';
    prop_3 UUID := '60000000-0000-4000-a000-000000000003';
    prop_4 UUID := '60000000-0000-4000-a000-000000000004';
    prop_5 UUID := '60000000-0000-4000-a000-000000000005';
    prop_6 UUID := '60000000-0000-4000-a000-000000000006';
    prop_7 UUID := '60000000-0000-4000-a000-000000000007';

    -- Contract IDs
    ct_1 UUID := '70000000-0000-4000-a000-000000000001';
    ct_2 UUID := '70000000-0000-4000-a000-000000000002';

    -- Milestone IDs
    m_1 UUID := '80000000-0000-4000-a000-000000000001';
    m_2 UUID := '80000000-0000-4000-a000-000000000002';
    m_3 UUID := '80000000-0000-4000-a000-000000000003';

    -- Wallet IDs
    w_c1 UUID;
    w_f1 UUID;

BEGIN
    -- 1. INSERT USERS
    INSERT INTO users (id, name, email, password_hash, role, status) VALUES
    (u_admin, 'System Administrator', 'admin@freelancehub.com', v_pwd, 'ADMIN', 'ACTIVE'),
    -- Clients
    (u_c1, 'Acme Corporation', 'acme.corp@example.com', v_pwd, 'CLIENT', 'ACTIVE'),
    (u_c2, 'TechStart Labs', 'techstart@example.com', v_pwd, 'CLIENT', 'ACTIVE'),
    (u_c3, 'Nexus Digital', 'nexus.digital@example.com', v_pwd, 'CLIENT', 'ACTIVE'),
    (u_c4, 'Global Logistics Hub', 'global.logistics@example.com', v_pwd, 'CLIENT', 'ACTIVE'),
    (u_c5, 'FinTech Solutions', 'fintech.solutions@example.com', v_pwd, 'CLIENT', 'ACTIVE'),
    -- Freelancers
    (u_f1, 'Alex Rivera', 'alex.fullstack@example.com', v_pwd, 'FREELANCER', 'ACTIVE'),
    (u_f2, 'Sarah Jenkins', 'sarah.react@example.com', v_pwd, 'FREELANCER', 'ACTIVE'),
    (u_f3, 'Rajesh Patel', 'raj.backend@example.com', v_pwd, 'FREELANCER', 'ACTIVE'),
    (u_f4, 'Elena Rostova', 'elena.uiux@example.com', v_pwd, 'FREELANCER', 'ACTIVE'),
    (u_f5, 'David Kim', 'david.mobile@example.com', v_pwd, 'FREELANCER', 'ACTIVE'),
    (u_f6, 'Maya Lin', 'maya.devops@example.com', v_pwd, 'FREELANCER', 'ACTIVE'),
    (u_f7, 'Chen Wei', 'chen.ai@example.com', v_pwd, 'FREELANCER', 'ACTIVE'),
    (u_f8, 'Sophia Martinez', 'sophia.content@example.com', v_pwd, 'FREELANCER', 'ACTIVE'),
    (u_f9, 'Lucas Vance', 'lucas.security@example.com', v_pwd, 'FREELANCER', 'ACTIVE'),
    (u_f10, 'Priya Sharma', 'priya.qa@example.com', v_pwd, 'FREELANCER', 'ACTIVE');

    -- 2. INSERT CLIENT PROFILES
    INSERT INTO client_profiles (user_id, company_name, website, billing_address, total_spent) VALUES
    (u_c1, 'Acme Global Ventures', 'https://acmecorp.com', '100 Innovation Way, San Francisco, CA', 3500.00),
    (u_c2, 'TechStart Labs', 'https://techstart.io', '45 Market St, Austin, TX', 1200.00),
    (u_c3, 'Nexus Media & Design', 'https://nexusdigital.agency', '78 Broadway, New York, NY', 0.00),
    (u_c4, 'Global Logistics Hub', 'https://globallogistics.com', '12 Freight Lane, Chicago, IL', 0.00),
    (u_c5, 'FinTech Solutions Inc', 'https://fintechsolutions.com', '50 Wall Street, New York, NY', 0.00);

    -- 3. INSERT FREELANCER PROFILES
    INSERT INTO freelancer_profiles (user_id, title, bio, hourly_rate, experience_level, availability, total_earnings, average_rating, completed_projects_count) VALUES
    (u_f1, 'Senior Full-Stack Architect', '10+ years architecting enterprise React and Node.js solutions with PostgreSQL.', 85.00, 'EXPERT', 'AVAILABLE', 3500.00, 4.90, 5),
    (u_f2, 'Frontend Specialist & React Core', 'Passionate UI architect specializing in React, Next.js, and high performance dashboards.', 65.00, 'EXPERT', 'AVAILABLE', 2400.00, 4.85, 4),
    (u_f3, 'Senior Database & Node.js Developer', 'ADBMS specialist focusing on high-concurrency PostgreSQL, indexing, and REST APIs.', 75.00, 'EXPERT', 'AVAILABLE', 1200.00, 4.95, 3),
    (u_f4, 'Lead UI/UX & Design Systems Designer', 'Crafting intuitive SaaS interfaces, design tokens, Figma libraries, and modern UX.', 55.00, 'INTERMEDIATE', 'AVAILABLE', 900.00, 4.80, 2),
    (u_f5, 'Mobile Engineer (React Native & Flutter)', 'Cross-platform iOS and Android developer with 5+ commercial apps published.', 70.00, 'INTERMEDIATE', 'AVAILABLE', 1500.00, 4.75, 3),
    (u_f6, 'DevOps & Cloud Infrastructure Architect', 'Docker, Kubernetes, AWS, CI/CD pipelines, and zero-downtime database migrations.', 95.00, 'EXPERT', 'AVAILABLE', 4200.00, 5.00, 6),
    (u_f7, 'Machine Learning & Python Engineer', 'Specialist in predictive analytics, NLP, embeddings, and data pipelines.', 90.00, 'EXPERT', 'AVAILABLE', 0.00, 0.00, 0),
    (u_f8, 'Technical Writer & Content Strategist', 'Developer documentation, API guides, whitepapers, and technical case studies.', 45.00, 'INTERMEDIATE', 'AVAILABLE', 600.00, 4.70, 2),
    (u_f9, 'Cybersecurity & Penetration Tester', 'Application security audits, OWASP compliance, vulnerability assessment, and hardening.', 110.00, 'EXPERT', 'AVAILABLE', 2800.00, 4.90, 3),
    (u_f10, 'QA Automation Engineer', 'Jest, Cypress, Supertest, load testing, and end-to-end integration pipelines.', 50.00, 'INTERMEDIATE', 'AVAILABLE', 800.00, 4.60, 2);

    -- 4. INSERT CATEGORIES
    INSERT INTO categories (id, name, description, slug) VALUES
    (cat_web, 'Web Development', 'Full-stack web applications, frontends, APIs, and modern web services.', 'web-development'),
    (cat_mobile, 'Mobile App Development', 'Native and cross-platform iOS and Android mobile engineering.', 'mobile-app-development'),
    (cat_db, 'Database & Backend Systems', 'Relational database architecture, query optimization, and microservices.', 'database-backend'),
    (cat_uiux, 'UI/UX Design', 'User experience research, wireframing, Figma mockups, and design systems.', 'ui-ux-design'),
    (cat_devops, 'DevOps & Cloud Architecture', 'Cloud hosting, container orchestration, CI/CD, and infrastructure as code.', 'devops-cloud'),
    (cat_ai, 'AI & Machine Learning', 'Data science, predictive models, NLP, and intelligent platform agents.', 'ai-machine-learning'),
    (cat_security, 'Cybersecurity', 'Application penetration testing, vulnerability audits, and access controls.', 'cybersecurity'),
    (cat_qa, 'QA & Automated Testing', 'Comprehensive test suites, unit testing, integration tests, and CI QA.', 'qa-testing');

    -- 5. INSERT SKILLS
    INSERT INTO skills (id, name, category_id) VALUES
    (sk_react, 'React.js', cat_web),
    (sk_node, 'Node.js', cat_web),
    (sk_pg, 'PostgreSQL', cat_db),
    (sk_ts, 'TypeScript', cat_web),
    (sk_rn, 'React Native', cat_mobile),
    (sk_figma, 'Figma', cat_uiux),
    (sk_docker, 'Docker', cat_devops),
    (sk_k8s, 'Kubernetes', cat_devops),
    (sk_py, 'Python', cat_ai),
    (sk_next, 'Next.js', cat_web),
    (sk_graphql, 'GraphQL', cat_web),
    (sk_aws, 'AWS', cat_devops),
    (sk_sec, 'Security Audit', cat_security),
    (sk_tailwind, 'Tailwind CSS', cat_web),
    (sk_jest, 'Jest & Testing', cat_qa),
    (sk_prisma, 'Prisma ORM', cat_db);

    -- 6. INSERT FREELANCER SKILLS
    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_react, 'EXPERT', 6.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f1;
    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_node, 'EXPERT', 7.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f1;
    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_pg, 'EXPERT', 8.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f1;

    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_react, 'EXPERT', 5.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f2;
    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_next, 'EXPERT', 4.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f2;
    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_tailwind, 'EXPERT', 4.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f2;

    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_pg, 'EXPERT', 9.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f3;
    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_node, 'EXPERT', 6.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f3;
    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_prisma, 'ADVANCED', 3.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f3;

    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_figma, 'EXPERT', 5.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f4;

    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_rn, 'EXPERT', 5.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f5;

    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_docker, 'EXPERT', 6.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f6;
    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_k8s, 'EXPERT', 4.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f6;
    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_aws, 'EXPERT', 6.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f6;

    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_py, 'EXPERT', 5.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f7;

    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_sec, 'EXPERT', 7.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f9;

    INSERT INTO freelancer_skills (freelancer_id, skill_id, proficiency_level, years_experience)
    SELECT fp.id, sk_jest, 'EXPERT', 5.0 FROM freelancer_profiles fp WHERE fp.user_id = u_f10;

    -- 7. INSERT WALLETS FOR ALL USERS
    INSERT INTO wallets (user_id, available_balance, reserved_balance) VALUES
    (u_admin, 10000.00, 0.00),
    (u_c1, 15000.00, 1500.00), -- Has 1500 reserved in escrow for active milestone
    (u_c2, 8000.00, 0.00),
    (u_c3, 5000.00, 0.00),
    (u_c4, 12000.00, 0.00),
    (u_c5, 25000.00, 0.00),
    (u_f1, 3500.00, 0.00),
    (u_f2, 2400.00, 0.00),
    (u_f3, 1200.00, 0.00),
    (u_f4, 900.00, 0.00),
    (u_f5, 1500.00, 0.00),
    (u_f6, 4200.00, 0.00),
    (u_f7, 0.00, 0.00),
    (u_f8, 600.00, 0.00),
    (u_f9, 2800.00, 0.00),
    (u_f10, 800.00, 0.00);

    -- 8. INSERT 20 PROJECTS
    INSERT INTO projects (id, client_id, category_id, title, description, project_type, experience_level, min_budget, max_budget, deadline, status) VALUES
    (p_1, u_c1, cat_web, 'Full-Stack SaaS Platform Architecture', 'Architect and build a scalable B2B analytics portal using React, Node.js, and PostgreSQL.', 'FIXED_PRICE', 'EXPERT', 3000.00, 5000.00, CURRENT_TIMESTAMP + INTERVAL '30 days', 'IN_PROGRESS'),
    (p_2, u_c1, cat_db, 'PostgreSQL Database Performance Tuning', 'Analyze slow queries, design composite indexes, and implement partition strategies for a 50M row database.', 'FIXED_PRICE', 'EXPERT', 1000.00, 2000.00, CURRENT_TIMESTAMP + INTERVAL '14 days', 'COMPLETED'),
    (p_3, u_c2, cat_web, 'React Dashboard & Data Visualization', 'Build an interactive financial analytics dashboard using React 19, Recharts, and Tailwind CSS.', 'FIXED_PRICE', 'INTERMEDIATE', 1200.00, 2500.00, CURRENT_TIMESTAMP + INTERVAL '21 days', 'OPEN'),
    (p_4, u_c2, cat_mobile, 'Cross-Platform Delivery Driver App', 'Create a React Native mobile application for parcel tracking and route navigation.', 'FIXED_PRICE', 'EXPERT', 3500.00, 6000.00, CURRENT_TIMESTAMP + INTERVAL '45 days', 'OPEN'),
    (p_5, u_c3, cat_uiux, 'Design System & Figma Component Library', 'Design a unified, accessible SaaS component system in Figma with dark/light mode tokens.', 'FIXED_PRICE', 'INTERMEDIATE', 800.00, 1600.00, CURRENT_TIMESTAMP + INTERVAL '18 days', 'OPEN'),
    (p_6, u_c3, cat_web, 'Next.js E-Commerce Storefront', 'High-speed headless commerce frontend integrated with Stripe and search indexing.', 'FIXED_PRICE', 'EXPERT', 2000.00, 4000.00, CURRENT_TIMESTAMP + INTERVAL '25 days', 'OPEN'),
    (p_7, u_c4, cat_devops, 'Kubernetes Production Cluster Setup', 'Deploy a production-grade AWS EKS cluster with Helm charts, Prometheus monitoring, and ArgoCD.', 'FIXED_PRICE', 'EXPERT', 2500.00, 4500.00, CURRENT_TIMESTAMP + INTERVAL '20 days', 'OPEN'),
    (p_8, u_c4, cat_db, 'Warehouse Inventory Data Pipeline', 'Design ETL data pipeline using PostgreSQL triggers and materialized views for real-time inventory.', 'FIXED_PRICE', 'INTERMEDIATE', 1500.00, 3000.00, CURRENT_TIMESTAMP + INTERVAL '28 days', 'OPEN'),
    (p_9, u_c5, cat_security, 'Fintech Web Application Security Audit', 'Comprehensive OWASP Top 10 pentesting and code security audit for payment release service.', 'FIXED_PRICE', 'EXPERT', 4000.00, 7000.00, CURRENT_TIMESTAMP + INTERVAL '15 days', 'OPEN'),
    (p_10, u_c5, cat_qa, 'Automated End-to-End Test Suite', 'Build a robust automated regression testing suite using Jest and Supertest for banking APIs.', 'FIXED_PRICE', 'INTERMEDIATE', 1000.00, 2000.00, CURRENT_TIMESTAMP + INTERVAL '21 days', 'OPEN'),
    (p_11, u_c1, cat_web, 'Customer Support Chatbot Integration', 'Implement WebSocket backend service for real-time customer messaging and ticket triage.', 'FIXED_PRICE', 'INTERMEDIATE', 1200.00, 2200.00, CURRENT_TIMESTAMP + INTERVAL '30 days', 'OPEN'),
    (p_12, u_c2, cat_ai, 'Customer Churn Prediction Model', 'Train and deploy a Python machine learning model predicting client churn risk from activity logs.', 'FIXED_PRICE', 'EXPERT', 3000.00, 5000.00, CURRENT_TIMESTAMP + INTERVAL '35 days', 'OPEN'),
    (p_13, u_c3, cat_mobile, 'Fitness Tracking iOS / Android App', 'Health and workout tracker with Bluetooth heart-rate sensor integration and stats charts.', 'FIXED_PRICE', 'INTERMEDIATE', 2500.00, 4500.00, CURRENT_TIMESTAMP + INTERVAL '40 days', 'OPEN'),
    (p_14, u_c4, cat_devops, 'Automated CI/CD Pipeline on GitHub Actions', 'Set up multi-environment continuous integration and deployment with automated unit/integration tests.', 'FIXED_PRICE', 'INTERMEDIATE', 800.00, 1500.00, CURRENT_TIMESTAMP + INTERVAL '14 days', 'OPEN'),
    (p_15, u_c5, cat_web, 'KYC Document Verification Service', 'Secure document upload and automated identity verification workflow with audit logging.', 'FIXED_PRICE', 'EXPERT', 3500.00, 6000.00, CURRENT_TIMESTAMP + INTERVAL '28 days', 'OPEN'),
    (p_16, u_c1, cat_db, 'Database Backup & Disaster Recovery Plan', 'Configure automated PostgreSQL WAL archiving, point-in-time recovery, and hot standby replica.', 'FIXED_PRICE', 'EXPERT', 1800.00, 3200.00, CURRENT_TIMESTAMP + INTERVAL '20 days', 'OPEN'),
    (p_17, u_c2, cat_uiux, 'Mobile Banking App UX Redesign', 'Revamp UX journeys for fund transfers, transaction histories, and card management.', 'FIXED_PRICE', 'EXPERT', 1500.00, 2800.00, CURRENT_TIMESTAMP + INTERVAL '22 days', 'OPEN'),
    (p_18, u_c3, cat_qa, 'Load and Stress Testing for Product Launch', 'Perform high-concurrency stress testing up to 50,000 virtual users and identify API bottlenecks.', 'FIXED_PRICE', 'EXPERT', 1800.00, 3500.00, CURRENT_TIMESTAMP + INTERVAL '15 days', 'OPEN'),
    (p_19, u_c4, cat_web, 'Fleet Telematics Real-Time Dashboard', 'Map-based vehicle tracking dashboard using Leaflet, WebSockets, and real-time telemetry.', 'FIXED_PRICE', 'INTERMEDIATE', 2000.00, 3800.00, CURRENT_TIMESTAMP + INTERVAL '30 days', 'OPEN'),
    (p_20, u_c5, cat_ai, 'Fraud Detection Scoring Engine', 'Build real-time anomaly detection for high-value wallet transactions using rule-based scoring.', 'FIXED_PRICE', 'EXPERT', 4500.00, 8000.00, CURRENT_TIMESTAMP + INTERVAL '40 days', 'OPEN');

    -- 9. INSERT PROJECT SKILLS
    INSERT INTO project_skills (project_id, skill_id) VALUES
    (p_1, sk_react), (p_1, sk_node), (p_1, sk_pg),
    (p_2, sk_pg),
    (p_3, sk_react), (p_3, sk_tailwind),
    (p_4, sk_rn), (p_4, sk_ts),
    (p_5, sk_figma),
    (p_6, sk_next), (p_6, sk_react),
    (p_7, sk_docker), (p_7, sk_k8s), (p_7, sk_aws),
    (p_8, sk_pg), (p_8, sk_node),
    (p_9, sk_sec),
    (p_10, sk_jest), (p_10, sk_node);

    -- 10. INSERT PROPOSALS (30 realistic proposals)
    INSERT INTO proposals (id, project_id, freelancer_id, cover_letter, proposed_amount, estimated_days, status) VALUES
    (prop_1, p_1, u_f1, 'I have extensive experience building scalable SaaS architectures using React and PostgreSQL. I can deliver this within 25 days.', 3500.00, 25, 'ACCEPTED'),
    (prop_2, p_1, u_f2, 'Experienced React architect here. I can build the complete frontend suite and integrate your APIs.', 3800.00, 28, 'REJECTED'),
    (prop_3, p_1, u_f3, 'Full backend architecture expert with strong ADBMS background in PostgreSQL and Node.js.', 3400.00, 24, 'REJECTED'),
    (prop_4, p_2, u_f3, 'PostgreSQL query optimization is my core strength. I will analyze your EXPLAIN plans and tune your indexes.', 1200.00, 10, 'ACCEPTED'),
    (prop_5, p_2, u_f1, 'I can optimize your PostgreSQL schema and configure proper composite and covering indexes.', 1400.00, 12, 'REJECTED'),
    (prop_6, p_3, u_f2, 'Specialized in building React dashboards with clean Tailwind styling and smooth Recharts animations.', 1500.00, 14, 'PENDING'),
    (prop_7, p_3, u_f1, 'Experienced with React and data visualization components. Ready to start immediately.', 1600.00, 15, 'PENDING'),
    (gen_random_uuid(), p_4, u_f5, 'Built several production React Native apps for logistics companies with offline GPS support.', 4200.00, 35, 'PENDING'),
    (gen_random_uuid(), p_5, u_f4, 'I will craft a world-class Figma design system with clear components, auto-layout, and tokens.', 1100.00, 14, 'PENDING'),
    (gen_random_uuid(), p_6, u_f2, 'Next.js App Router and SSR performance is what I do best. Ready to deliver a blazing fast storefront.', 2800.00, 20, 'PENDING'),
    (gen_random_uuid(), p_7, u_f6, 'Kubernetes certified architect. I will set up automated EKS infrastructure with Helm and ArgoCD.', 3200.00, 18, 'PENDING'),
    (gen_random_uuid(), p_8, u_f3, 'I can design resilient PostgreSQL ETL triggers and materialized view pipelines for real-time inventory.', 1900.00, 21, 'PENDING'),
    (gen_random_uuid(), p_9, u_f9, 'Certified ethical hacker and appsec auditor. I will perform comprehensive penetration testing and provide remediation steps.', 4800.00, 14, 'PENDING'),
    (gen_random_uuid(), p_10, u_f10, 'I will build an automated Jest and Supertest suite covering all your edge cases and race condition checks.', 1200.00, 15, 'PENDING'),
    (gen_random_uuid(), p_11, u_f1, 'Experienced in WebSockets, pub/sub, and reliable streaming architectures.', 1500.00, 18, 'PENDING'),
    (gen_random_uuid(), p_12, u_f7, 'PhD in machine learning, expert in scikit-learn, XGBoost, and model deployment via FastAPI.', 3800.00, 25, 'PENDING'),
    (gen_random_uuid(), p_13, u_f5, 'Passionate about mobile health apps with custom Bluetooth and sensor integration.', 3100.00, 28, 'PENDING'),
    (gen_random_uuid(), p_14, u_f6, 'I can set up automated CI/CD pipelines with GitHub Actions, caching, and multi-stage testing.', 950.00, 7, 'PENDING'),
    (gen_random_uuid(), p_15, u_f1, 'Security-focused full-stack developer with experience in document encryption and KYC flows.', 4200.00, 24, 'PENDING'),
    (gen_random_uuid(), p_16, u_f3, 'I will configure automated WAL archiving, pgBackRest, and warm standby replication.', 2200.00, 14, 'PENDING'),
    (gen_random_uuid(), p_17, u_f4, 'Passionate fintech UI/UX designer. I will deliver high-conversion wireframes and prototypes.', 1800.00, 16, 'PENDING'),
    (gen_random_uuid(), p_18, u_f10, 'I specialize in k6, JMeter, and stress testing high-throughput web applications.', 2400.00, 12, 'PENDING'),
    (gen_random_uuid(), p_19, u_f1, 'Experienced in geospatial queries and real-time mapping using PostgreSQL PostGIS and React.', 2600.00, 21, 'PENDING'),
    (gen_random_uuid(), p_20, u_f7, 'I will engineer an anomaly detection scoring pipeline with low latency inference.', 5200.00, 30, 'PENDING'),
    (gen_random_uuid(), p_3, u_f4, 'Can provide the design and prototype for the financial dashboard before code implementation.', 1400.00, 12, 'PENDING'),
    (gen_random_uuid(), p_4, u_f1, 'Strong background in cross-platform mobile apps with TypeScript and React Native.', 4500.00, 38, 'PENDING'),
    (gen_random_uuid(), p_7, u_f3, 'Database reliability engineer with deep Docker and Kubernetes clustering experience.', 3600.00, 20, 'PENDING'),
    (gen_random_uuid(), p_8, u_f1, 'Full-stack background with deep SQL experience. Can design the data pipeline cleanly.', 2100.00, 22, 'PENDING'),
    (gen_random_uuid(), p_9, u_f6, 'Cloud security and infrastructure hardening engineer. Ready to audit your infrastructure.', 5000.00, 15, 'PENDING'),
    (gen_random_uuid(), p_10, u_f1, 'Full-stack testing specialist with extensive Jest experience.', 1400.00, 16, 'PENDING');

    -- 11. INSERT CONTRACTS
    -- Contract 1: In Progress on Project 1 (Acme -> Alex Rivera)
    INSERT INTO contracts (id, project_id, client_id, freelancer_id, proposal_id, agreed_amount, start_date, status) VALUES
    (ct_1, p_1, u_c1, u_f1, prop_1, 3500.00, CURRENT_TIMESTAMP - INTERVAL '10 days', 'ACTIVE'),
    -- Contract 2: Completed on Project 2 (Acme -> Rajesh Patel)
    (ct_2, p_2, u_c1, u_f3, prop_4, 1200.00, CURRENT_TIMESTAMP - INTERVAL '20 days', 'COMPLETED');

    -- 12. INSERT MILESTONES
    -- Milestones for Contract 1:
    -- Milestone 1: Approved and Paid (2000.00)
    -- Milestone 2: Submitted and pending review (1500.00)
    INSERT INTO milestones (id, contract_id, title, description, amount, status, submission_notes, submitted_at, approved_at, paid_at) VALUES
    (m_1, ct_1, 'Milestone 1: Architecture & Database Schema Design', 'Complete 3NF schema, Prisma models, and migration scripts.', 2000.00, 'PAID', 'Initial schema implemented with 17 tables, constraints, and stored procedures.', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (m_2, ct_1, 'Milestone 2: Frontend Dashboard & API Integration', 'Implement client and freelancer dashboards with real API data.', 1500.00, 'SUBMITTED', 'Frontend views built with Tailwind CSS and connected to REST endpoints.', CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, NULL),
    -- Milestone for Contract 2 (Completed and fully paid)
    (m_3, ct_2, 'Milestone 1: Database Indexing & Query Tuning', 'Complete query optimization and EXPLAIN ANALYZE benchmarks.', 1200.00, 'PAID', 'All queries tuned, composite indexes created, and performance verified.', CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '10 days');

    -- 13. INSERT WALLET TRANSACTIONS
    SELECT id INTO w_c1 FROM wallets WHERE user_id = u_c1;
    SELECT id INTO w_f1 FROM wallets WHERE user_id = u_f1;

    INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, description, milestone_id) VALUES
    (w_c1, 'DEPOSIT', 20000.00, 'Initial client funding deposit', NULL),
    (w_c1, 'ESCROW_FUND', 2000.00, 'Escrow funded for Milestone 1', m_1),
    (w_c1, 'PAYMENT_RELEASE', 2000.00, 'Released payment for Milestone 1', m_1),
    (w_f1, 'PAYMENT_RELEASE', 2000.00, 'Received payment for Milestone 1', m_1),
    (w_c1, 'ESCROW_FUND', 1500.00, 'Escrow funded for Milestone 2', m_2);

    -- 14. INSERT REVIEWS
    INSERT INTO reviews (contract_id, reviewer_id, reviewee_id, rating, comment) VALUES
    (ct_2, u_c1, u_f3, 5.0, 'Outstanding database performance tuning! Query times dropped by 80%. Highly recommended.'),
    (ct_2, u_f3, u_c1, 4.9, 'Fantastic client with very clear requirements and prompt payment release.');

    -- 15. INSERT NOTIFICATIONS
    INSERT INTO notifications (user_id, title, message, type) VALUES
    (u_c1, 'Milestone Submitted', 'Alex Rivera has submitted Milestone 2 for review.', 'PROJECT'),
    (u_f1, 'Payment Released', 'Acme Corporation released $2,000.00 for Milestone 1.', 'PAYMENT'),
    (u_admin, 'System Initialization', 'FreelanceHub platform initialized successfully with ADBMS engine.', 'SYSTEM');

    -- 16. INSERT AUDIT LOGS
    INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details) VALUES
    (u_admin, 'INITIAL_SEED', 'system', 'seed', jsonb_build_object('message', 'Platform seeded with academic demonstration data')),
    (u_c1, 'CREATE_PROJECT', 'projects', p_1::TEXT, jsonb_build_object('title', 'Full-Stack SaaS Platform Architecture')),
    (u_c1, 'ACCEPT_PROPOSAL', 'proposals', prop_1::TEXT, jsonb_build_object('amount', 3500.00, 'freelancer', 'Alex Rivera'));

END $$;
