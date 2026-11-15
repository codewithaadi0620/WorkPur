-- ============================================================================
-- FreelanceHub Database Triggers (ADBMS Module)
-- Engine: PostgreSQL 18
-- ============================================================================

-- 1. GENERIC TRIGGER FUNCTION FOR updated_at TIMESTAMPS
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_client_profiles_updated_at ON client_profiles;
CREATE TRIGGER trg_client_profiles_updated_at
BEFORE UPDATE ON client_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_freelancer_profiles_updated_at ON freelancer_profiles;
CREATE TRIGGER trg_freelancer_profiles_updated_at
BEFORE UPDATE ON freelancer_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_proposals_updated_at ON proposals;
CREATE TRIGGER trg_proposals_updated_at
BEFORE UPDATE ON proposals
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_contracts_updated_at ON contracts;
CREATE TRIGGER trg_contracts_updated_at
BEFORE UPDATE ON contracts
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_milestones_updated_at ON milestones;
CREATE TRIGGER trg_milestones_updated_at
BEFORE UPDATE ON milestones
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_wallets_updated_at ON wallets;
CREATE TRIGGER trg_wallets_updated_at
BEFORE UPDATE ON wallets
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();


-- 2. TRIGGER: Milestone Status Transition Validation
CREATE OR REPLACE FUNCTION validate_milestone_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Prevent modifying paid milestones
    IF OLD.status = 'PAID' AND NEW.status <> 'PAID' THEN
        RAISE EXCEPTION 'A paid milestone cannot have its status altered.';
    END IF;

    -- Prevent altering milestone amount once submitted or approved
    IF (OLD.status IN ('SUBMITTED', 'APPROVED', 'PAID')) AND (OLD.amount <> NEW.amount) THEN
        RAISE EXCEPTION 'Cannot modify milestone amount after submission.';
    END IF;

    -- Valid state transitions:
    -- PENDING -> SUBMITTED
    -- SUBMITTED -> APPROVED or REJECTED or PENDING
    -- APPROVED -> PAID
    IF OLD.status = 'PENDING' AND NEW.status NOT IN ('PENDING', 'SUBMITTED') THEN
        RAISE EXCEPTION 'Invalid transition from PENDING to %. Must be SUBMITTED first.', NEW.status;
    END IF;

    IF OLD.status = 'SUBMITTED' AND NEW.status NOT IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'PENDING') THEN
        RAISE EXCEPTION 'Invalid transition from SUBMITTED to %.', NEW.status;
    END IF;

    IF OLD.status = 'APPROVED' AND NEW.status NOT IN ('APPROVED', 'PAID') THEN
        RAISE EXCEPTION 'Invalid transition from APPROVED to %. Milestone is locked for payment.', NEW.status;
    END IF;

    -- Set timestamps automatically
    IF NEW.status = 'SUBMITTED' AND OLD.status <> 'SUBMITTED' THEN
        NEW.submitted_at = CURRENT_TIMESTAMP;
    END IF;

    IF NEW.status = 'APPROVED' AND OLD.status <> 'APPROVED' THEN
        NEW.approved_at = CURRENT_TIMESTAMP;
    END IF;

    IF NEW.status = 'PAID' AND OLD.status <> 'PAID' THEN
        NEW.paid_at = CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_milestone_validation ON milestones;
CREATE TRIGGER trg_milestone_validation
BEFORE UPDATE ON milestones
FOR EACH ROW EXECUTE FUNCTION validate_milestone_status_transition();


-- 3. TRIGGER: Wallet Balance Integrity Validation
CREATE OR REPLACE FUNCTION validate_wallet_balance_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.available_balance < 0 THEN
        RAISE EXCEPTION 'Wallet constraint violation: available balance cannot be negative (current: %)', NEW.available_balance;
    END IF;

    IF NEW.reserved_balance < 0 THEN
        RAISE EXCEPTION 'Wallet constraint violation: reserved balance cannot be negative (current: %)', NEW.reserved_balance;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wallet_balance_integrity ON wallets;
CREATE TRIGGER trg_wallet_balance_integrity
BEFORE INSERT OR UPDATE ON wallets
FOR EACH ROW EXECUTE FUNCTION validate_wallet_balance_integrity();


-- 4. TRIGGER: Automatic Review Rating Synchronization
CREATE OR REPLACE FUNCTION sync_freelancer_review_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_rating NUMERIC(3, 2);
BEGIN
    -- Recalculate average rating for reviewee
    SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0.00)
    INTO v_new_rating
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id;

    -- Update profile if reviewee is freelancer
    UPDATE freelancer_profiles
    SET average_rating = v_new_rating,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.reviewee_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_review_rating ON reviews;
CREATE TRIGGER trg_sync_review_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION sync_freelancer_review_rating();


-- 5. TRIGGER: Audit Log Trigger on User Status Changes
CREATE OR REPLACE FUNCTION audit_user_status_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, details)
        VALUES (
            NEW.id,
            'STATUS_CHANGE',
            'users',
            NEW.id::TEXT,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'email', NEW.email
            )
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_user_status ON users;
CREATE TRIGGER trg_audit_user_status
AFTER UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION audit_user_status_changes();
