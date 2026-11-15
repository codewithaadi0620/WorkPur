-- ============================================================================
-- FreelanceHub Database Stored Procedures (ADBMS Module)
-- Engine: PostgreSQL 18
-- ============================================================================

-- 1. PROCEDURE: accept_proposal
-- Atomically locks project, accepts the chosen proposal, rejects competing
-- proposals, creates the formal contract, updates project status, and writes audit log.
CREATE OR REPLACE PROCEDURE accept_proposal(
    p_proposal_id UUID,
    p_client_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_project_id UUID;
    v_freelancer_id UUID;
    v_proposed_amount NUMERIC(12, 2);
    v_project_client_id UUID;
    v_project_status VARCHAR(30);
    v_contract_id UUID;
BEGIN
    -- Retrieve proposal details
    SELECT project_id, freelancer_id, proposed_amount
    INTO v_project_id, v_freelancer_id, v_proposed_amount
    FROM proposals
    WHERE id = p_proposal_id AND status = 'PENDING';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposal % is invalid, already processed, or not found.', p_proposal_id;
    END IF;

    -- Concurrency control: Lock the project row for update
    SELECT client_id, status
    INTO v_project_client_id, v_project_status
    FROM projects
    WHERE id = v_project_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Project % not found.', v_project_id;
    END IF;

    -- Verify ownership
    IF v_project_client_id <> p_client_id THEN
        RAISE EXCEPTION 'User % is not authorized to accept proposals for project %.', p_client_id, v_project_id;
    END IF;

    -- Verify project status
    IF v_project_status <> 'OPEN' THEN
        RAISE EXCEPTION 'Project % is in % status and cannot accept proposals.', v_project_id, v_project_status;
    END IF;

    -- 1. Update the accepted proposal
    UPDATE proposals
    SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP
    WHERE id = p_proposal_id;

    -- 2. Reject other pending proposals for this project
    UPDATE proposals
    SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP
    WHERE project_id = v_project_id AND id <> p_proposal_id AND status = 'PENDING';

    -- 3. Create the formal contract record
    INSERT INTO contracts (
        project_id,
        client_id,
        freelancer_id,
        proposal_id,
        agreed_amount,
        start_date,
        status
    )
    VALUES (
        v_project_id,
        p_client_id,
        v_freelancer_id,
        p_proposal_id,
        v_proposed_amount,
        CURRENT_TIMESTAMP,
        'ACTIVE'
    )
    RETURNING id INTO v_contract_id;

    -- 4. Update the project status to IN_PROGRESS
    UPDATE projects
    SET status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP
    WHERE id = v_project_id;

    -- 5. Audit Log Entry
    INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details)
    VALUES (
        p_client_id,
        'ACCEPT_PROPOSAL',
        'contracts',
        v_contract_id::TEXT,
        jsonb_build_object(
            'project_id', v_project_id,
            'proposal_id', p_proposal_id,
            'freelancer_id', v_freelancer_id,
            'agreed_amount', v_proposed_amount
        )
    );
END;
$$;


-- 2. PROCEDURE: release_milestone_payment
-- Verifies milestone status, validates and locks client/freelancer wallets,
-- transfers reserved balance to available balance, and logs ledger transactions.
CREATE OR REPLACE PROCEDURE release_milestone_payment(
    p_milestone_id UUID,
    p_client_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_milestone_status VARCHAR(30);
    v_milestone_amount NUMERIC(12, 2);
    v_contract_id UUID;
    v_contract_client_id UUID;
    v_freelancer_id UUID;
    v_client_wallet_id UUID;
    v_client_reserved NUMERIC(14, 2);
    v_freelancer_wallet_id UUID;
BEGIN
    -- 1. Validate milestone and contract
    SELECT m.status, m.amount, m.contract_id, c.client_id, c.freelancer_id
    INTO v_milestone_status, v_milestone_amount, v_contract_id, v_contract_client_id, v_freelancer_id
    FROM milestones m
    JOIN contracts c ON m.contract_id = c.id
    WHERE m.id = p_milestone_id
    FOR UPDATE OF m;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Milestone % not found.', p_milestone_id;
    END IF;

    IF v_contract_client_id <> p_client_id THEN
        RAISE EXCEPTION 'User % is not authorized to release payment for milestone %.', p_client_id, p_milestone_id;
    END IF;

    IF v_milestone_status <> 'APPROVED' THEN
        RAISE EXCEPTION 'Milestone % status is %, but must be APPROVED before payment release.', p_milestone_id, v_milestone_status;
    END IF;

    -- 2. Lock client wallet and verify reserved balance
    SELECT id, reserved_balance
    INTO v_client_wallet_id, v_client_reserved
    FROM wallets
    WHERE user_id = p_client_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Client wallet not found for user %.', p_client_id;
    END IF;

    IF v_client_reserved < v_milestone_amount THEN
        RAISE EXCEPTION 'Insufficient reserved escrow balance. Required: %, Available in escrow: %',
            v_milestone_amount, v_client_reserved;
    END IF;

    -- 3. Lock freelancer wallet
    SELECT id
    INTO v_freelancer_wallet_id
    FROM wallets
    WHERE user_id = v_freelancer_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Freelancer wallet not found for user %.', v_freelancer_id;
    END IF;

    -- 4. Deduct from client reserved balance
    UPDATE wallets
    SET reserved_balance = reserved_balance - v_milestone_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_client_wallet_id;

    -- 5. Credit freelancer available balance
    UPDATE wallets
    SET available_balance = available_balance + v_milestone_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_freelancer_wallet_id;

    -- 6. Update client and freelancer profile aggregates
    UPDATE client_profiles
    SET total_spent = total_spent + v_milestone_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_client_id;

    UPDATE freelancer_profiles
    SET total_earnings = total_earnings + v_milestone_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = v_freelancer_id;

    -- 7. Record transactions in ledger
    INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, description, milestone_id)
    VALUES (
        v_client_wallet_id,
        'PAYMENT_RELEASE',
        v_milestone_amount,
        'Released milestone payment for contract ' || v_contract_id::TEXT,
        p_milestone_id
    );

    INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, description, milestone_id)
    VALUES (
        v_freelancer_wallet_id,
        'PAYMENT_RELEASE',
        v_milestone_amount,
        'Payment received for completed milestone ' || p_milestone_id::TEXT,
        p_milestone_id
    );

    -- 8. Mark milestone as PAID
    UPDATE milestones
    SET status = 'PAID', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_milestone_id;

    -- 9. Audit log entry
    INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details)
    VALUES (
        p_client_id,
        'RELEASE_MILESTONE_PAYMENT',
        'milestones',
        p_milestone_id::TEXT,
        jsonb_build_object(
            'contract_id', v_contract_id,
            'freelancer_id', v_freelancer_id,
            'amount', v_milestone_amount
        )
    );
END;
$$;


-- 3. PROCEDURE: complete_contract
-- Checks that all milestones are fully paid, marks contract completed,
-- updates project status, increments completed projects counter, and records audit log.
CREATE OR REPLACE PROCEDURE complete_contract(
    p_contract_id UUID,
    p_user_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_project_id UUID;
    v_client_id UUID;
    v_freelancer_id UUID;
    v_status VARCHAR(30);
    v_unpaid_count INT;
BEGIN
    SELECT project_id, client_id, freelancer_id, status
    INTO v_project_id, v_client_id, v_freelancer_id, v_status
    FROM contracts
    WHERE id = p_contract_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contract % not found.', p_contract_id;
    END IF;

    IF v_status <> 'ACTIVE' THEN
        RAISE EXCEPTION 'Contract % is currently %, only ACTIVE contracts can be completed.', p_contract_id, v_status;
    END IF;

    -- Check if user is either client, freelancer, or admin
    IF p_user_id <> v_client_id AND p_user_id <> v_freelancer_id THEN
        -- Check if user is admin
        IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND role = 'ADMIN') THEN
            RAISE EXCEPTION 'User % is not authorized to complete contract %.', p_user_id, p_contract_id;
        END IF;
    END IF;

    -- Verify that all milestones are in PAID status
    SELECT COUNT(*)
    INTO v_unpaid_count
    FROM milestones
    WHERE contract_id = p_contract_id AND status <> 'PAID';

    IF v_unpaid_count > 0 THEN
        RAISE EXCEPTION 'Cannot complete contract: % milestone(s) are still unpaid.', v_unpaid_count;
    END IF;

    -- Mark contract completed
    UPDATE contracts
    SET status = 'COMPLETED', end_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_contract_id;

    -- Mark project completed
    UPDATE projects
    SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP
    WHERE id = v_project_id;

    -- Increment freelancer completed projects count
    UPDATE freelancer_profiles
    SET completed_projects_count = completed_projects_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = v_freelancer_id;

    -- Audit log
    INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details)
    VALUES (
        p_user_id,
        'COMPLETE_CONTRACT',
        'contracts',
        p_contract_id::TEXT,
        jsonb_build_object(
            'project_id', v_project_id,
            'client_id', v_client_id,
            'freelancer_id', v_freelancer_id
        )
    );
END;
$$;


-- 4. PROCEDURE: suspend_user
-- Suspends a user account and writes an audit event.
CREATE OR REPLACE PROCEDURE suspend_user(
    p_user_id UUID,
    p_admin_id UUID,
    p_reason TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_admin_role VARCHAR(20);
BEGIN
    -- Verify admin role
    SELECT role INTO v_admin_role FROM users WHERE id = p_admin_id;
    IF v_admin_role <> 'ADMIN' THEN
        RAISE EXCEPTION 'Only platform administrators can suspend users.';
    END IF;

    IF p_user_id = p_admin_id THEN
        RAISE EXCEPTION 'Administrators cannot suspend their own account.';
    END IF;

    UPDATE users
    SET status = 'SUSPENDED', updated_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User % not found.', p_user_id;
    END IF;

    INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details)
    VALUES (
        p_admin_id,
        'SUSPEND_USER',
        'users',
        p_user_id::TEXT,
        jsonb_build_object('reason', p_reason, 'suspended_at', CURRENT_TIMESTAMP)
    );
END;
$$;
