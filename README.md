# WorkPur – Enterprise Freelance Marketplace Platform
### Advanced Database Management Systems (ADBMS) Academic Implementation

[![Repository](https://img.shields.io/badge/GitHub-codewithaadi0620%2FWorkPur-181717?logo=github&logoColor=white)](https://github.com/codewithaadi0620/WorkPur)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.0-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Jest](https://img.shields.io/badge/Jest-26%2F26%20Passing-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![Documentation](https://img.shields.io/badge/Docs-27%20Chapters%20PDF-blue?logo=adobeacrobatreader&logoColor=white)](docs/FreelanceHub_ADBMS_Report.pdf)

**WorkPur** (FreelanceHub) is a production-grade full-stack freelance marketplace built to demonstrate **Advanced Database Management Systems (ADBMS)** principles. The application places PostgreSQL at the center of system integrity—featuring 17 relational tables in 3NF/BCNF, atomic PL/pgSQL stored procedures, triggers, views, materialized views, composite indexes, and concurrency controls with pessimistic row locking (`FOR UPDATE`).


---

## 🌟 Key System Capabilities

- **Role-Based Portals:** Dedicated, customized workflows for **Clients**, **Freelancers**, and **Administrators**.
- **Atomic Proposal Acceptance:** Single-step stored procedure (`accept_proposal`) locks the project, accepts the winning proposal, automatically rejects competing bids, and generates the contract and initial milestone atomically.
- **Simulated Escrow & Ledger:** Safe double-entry wallet ledger where client deposits, escrow reservations, milestone releases, and withdrawals are protected by database check constraints and row locks.
- **Smart Freelancer Matching:** Rule-based recommendation engine scoring candidates based on skill match (50%), rating (20%), experience level (15%), and budget alignment (15%).
- **PostgreSQL Database Triggers:** Automated timestamp management, milestone state transition validation (preventing tampering with paid work), wallet non-negativity guards, rating recalculation, and audit logging.
- **Analytical Materialized Views:** Precomputed monthly platform metrics, category stats, and freelancer performance metrics with one-click refresh from the Admin portal.
- **Race Condition Immunity:** Tested and verified under simultaneous competing proposal acceptance requests.

---

## 👨‍💻 5-Person Academic Project Role Allocation Matrix

For academic capstone presentation and viva defense, project responsibilities are mapped across a 5-member engineering team:

| Member / Role | Focus Area | Key Modules Owned | Defense / Viva Topics |
| :--- | :--- | :--- | :--- |
| **Member 1: Team Lead & Database Architect** | ADBMS Core & Stored Procedures | `schema.sql`, `procedures.sql` (`accept_proposal`, `release_milestone_payment`) | 3NF/BCNF normalization, `FOR UPDATE` row locking, ACID transactions. |
| **Member 2: Backend & Security Architect** | Node.js, Express & Prisma ORM | `auth.service.js`, `jwt.js`, `upload.js`, `project.routes.js`, RBAC middleware | Stateless JWT auth, bcrypt hashing, Zod validation, Multer upload pipeline. |
| **Member 3: Frontend Lead & UI/UX Designer** | React 19, Tailwind CSS & SPA | `App.jsx`, `Navbar.jsx`, `Sidebar.jsx`, Client/Freelancer/Admin Portals | Component hierarchy, client-side route guards, Axios interceptors, responsive UI. |
| **Member 4: Performance & Analytics Engineer** | Indexing & Materialized Views | `indexes.sql`, `materialized_views.sql`, `benchmark_explain.sql`, `AdminDashboard.jsx` | `EXPLAIN ANALYZE` (35.3x speedup), sequential scan elimination, Recharts GMV graphs. |
| **Member 5: QA, Triggers & Concurrency Engineer**| Integrity Triggers & Test Suites | `triggers.sql`, `matching.service.js`, 6 Jest test suites (`concurrency.test.js`) | Race condition prevention, milestone state machines, 4-factor smart matching. |

---

## 👥 Demo Accounts (Pre-Seeded)


All demo accounts share the password: `password123`

| Role | Email Address | Description | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@freelancehub.com` | Platform Administrator | Refresh materialized views, suspend/activate users, audit logs, GMV charts |
| **Client** | `acme.corp@example.com` | Enterprise Client (Acme Corp) | Post projects, review & accept proposals, fund escrow, release milestone funds |
| **Client** | `techstart@example.com` | Startup Client (TechStart) | Manage active contracts, review deliverables, rate freelancers |
| **Freelancer** | `alex.fullstack@example.com` | Senior Full-Stack Eng. (Alex) | Browse projects, submit proposals, submit deliverables, simulate wallet withdrawals |
| **Freelancer** | `elena.uiux@example.com` | UI/UX & Product Designer (Elena) | Manage active contracts, update technical skills, review client ratings |

> 💡 **Quick Login:** The Login page includes one-click buttons to instantly autofill credentials for Admin, Client, or Freelancer!

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended, tested on v22)
- PostgreSQL 18 (Running on port 5433 or configured via `.env`)

### 1. Start the Database
The project includes a pre-configured, local PostgreSQL 18 data cluster:
```powershell
# From project root
npm run start:db
```
*(Or launch your local PostgreSQL instance on port `5433` with database `freelancehub`)*

### 2. Initialize Database & Seed Sample Data
```powershell
# Initialize schema, procedures, triggers, views & materialized views
npm run init:db

# Seed 17 tables with rich marketplace sample data
npm run seed
```

### 3. Launch Backend Server
```powershell
# Run backend development server (starts on http://localhost:5000)
npm run dev:backend
```

### 4. Launch Frontend Application
```powershell
# In a new terminal, run the Vite React frontend (starts on http://localhost:5173)
npm run dev:frontend
```

Now open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🧪 Automated Test Suite

FreelanceHub includes a 26-test integration suite covering authentication, projects, proposals, contracts, escrow releases, and multi-user concurrency race conditions:

```powershell
# Run all Jest integration tests
npm test
```

### Test Suite Summary:
```
PASS  tests/auth.test.js (6 tests)
PASS  tests/projects.test.js (5 tests)
PASS  tests/proposals.test.js (5 tests)
PASS  tests/contracts_milestones.test.js (6 tests)
PASS  tests/payments.test.js (3 tests)
PASS  tests/concurrency.test.js (1 test - simultaneous proposal race condition)

Test Suites: 6 passed, 6 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        13.885 s
```

---

## 🏛️ Database Architecture Overview

### 17 Normalized Tables (3NF/BCNF)
1. `users` – Core credentials and RBAC roles
2. `client_profiles` – Client company details and billing information
3. `freelancer_profiles` – Bio, experience level, rates, and rating aggregates
4. `categories` – Classified service specializations
5. `skills` – Technical skills repository
6. `freelancer_skills` – Bridge relation for freelancer capabilities
7. `projects` – Client job postings with budgets and status
8. `project_skills` – Bridge relation for required project competencies
9. `proposals` – Freelancer bids, pricing, and estimated timelines
10. `contracts` – Legally binding agreements formed upon proposal acceptance
11. `milestones` – Phased contract deliverables and payout stages
12. `wallets` – Double-entry balance storage (available & reserved)
13. `wallet_transactions` – Immutable ledger of credits, debits, and escrow movements
14. `reviews` – Two-way ratings and feedback
15. `notifications` – System alerts and event dispatches
16. `project_attachments` – Uploaded project specifications
17. `audit_logs` – Append-only trail written by stored procedures & triggers

### Stored Procedures
- `CALL accept_proposal(p_proposal_id, p_client_id)`: Locks project (`FOR UPDATE`), accepts proposal, rejects competitors, creates contract and milestone atomically.
- `CALL release_milestone_payment(p_milestone_id, p_client_id)`: Locks wallets, transfers reserved escrow to available freelancer balance, writes ledger records, and marks milestone `PAID`.
- `CALL complete_contract(p_contract_id, p_client_id)`: Verifies all milestones are paid, closes contract and parent project.
- `CALL suspend_user(p_user_id, p_admin_id, p_reason)`: Suspends account and creates immutable audit log.
- `CALL refresh_all_materialized_views()`: Asynchronously refreshes all analytical materialized views.

### Database Views & Materialized Views
- **Standard Views:** `freelancer_dashboard_view`, `client_dashboard_view`, `active_projects_view`, `completed_contracts_view`, `transaction_history_view`, `top_freelancers_view`.
- **Materialized Views:** `monthly_platform_analytics`, `freelancer_performance_analytics`, `project_category_statistics`.

---

## 📁 Project Structure

```
Freelance MarketPlace/
├── backend/
│   ├── database/
│   │   ├── schema.sql                # 17 Table definitions & constraints
│   │   ├── procedures.sql            # PL/pgSQL stored procedures
│   │   ├── functions.sql             # User-defined mathematical & scalar functions
│   │   ├── triggers.sql              # Automated integrity triggers
│   │   ├── views.sql                 # Operational relational views
│   │   ├── materialized_views.sql    # Analytical materialized views
│   │   ├── indexes.sql               # Composite and B-tree indexes
│   │   ├── seed.sql                  # Complete marketplace seed data
│   │   ├── advanced_queries.sql      # 15 Complex analytical SQL queries
│   │   └── benchmark_explain.sql     # EXPLAIN ANALYZE comparison queries
│   ├── prisma/
│   │   └── schema.prisma             # Introspected ORM model definitions
│   ├── src/
│   │   ├── config/                   # Database pool and environment configuration
│   │   ├── controllers/              # Request handlers for all routes
│   │   ├── middleware/               # Auth, validation, error handling middleware
│   │   ├── routes/                   # Express REST API routes
│   │   ├── services/                 # Business logic, stored procedure callers, matching engine
│   │   ├── validators/               # Zod request payload schemas
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Server entry point (port 5000)
│   └── tests/                        # Jest & Supertest integration test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Footer, Sidebar, Modals, Layouts
│   │   ├── context/                  # AuthContext with token & user management
│   │   ├── pages/
│   │   │   ├── admin/                # Admin Dashboard, User Directory, Audit Logs
│   │   │   ├── auth/                 # Login & Registration pages
│   │   │   ├── client/               # Client Dashboard, Post Project, Contracts, Wallet
│   │   │   ├── freelancer/           # Freelancer Dashboard, Proposals, Contracts, Profile, Wallet
│   │   │   ├── LandingPage.jsx       # Public landing page with stats and categories
│   │   │   ├── ProjectsPage.jsx      # Multi-criteria project discovery
│   │   │   └── ProjectDetailsPage.jsx# Details, Smart Matching, & proposal submission
│   │   ├── services/                 # Centralized Axios API client
│   │   ├── App.jsx                   # React Router routing definition
│   │   └── main.jsx                  # React DOM root entry
│   └── tailwind.config.js            # Indigo/violet SaaS theme configuration
│
├── docs/
│   └── ADBMS_REPORT.md               # 27-chapter academic project report
├── package.json                      # Unified root management scripts
└── README.md                         # Project documentation
```

---

## 📚 Academic Documentation

For complete academic documentation including:
- Mathematical Functional Dependencies
- Proof of Normalization (1NF through 3NF & BCNF)
- Detailed Data Dictionary for all 17 tables
- Stored Procedures and Triggers Specification
- Query Optimization benchmarks with `EXPLAIN ANALYZE` (35x speedup)
- Concurrency and ACID demonstration

Please refer to the comprehensive report in **[`docs/ADBMS_REPORT.md`](docs/ADBMS_REPORT.md)**.

---

## 📄 License

This project is developed for Advanced Database Management Systems (ADBMS) academic research and demonstration purposes. Licensed under the MIT License.
