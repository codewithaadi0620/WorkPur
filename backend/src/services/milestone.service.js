import { prisma, query, getClient } from '../config/database.js';

export async function createMilestone(clientId, contractId, { title, description, amount, dueDate, due_date }) {
  const contract = await prisma.contracts.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    const error = new Error('Contract not found.');
    error.statusCode = 404;
    throw error;
  }

  if (contract.client_id !== clientId) {
    const error = new Error('Unauthorized to add milestones to this contract.');
    error.statusCode = 403;
    throw error;
  }

  if (contract.status !== 'ACTIVE') {
    const error = new Error(`Cannot add milestones to a contract in ${contract.status} status.`);
    error.statusCode = 400;
    throw error;
  }

  const rawDate = dueDate || due_date;
  let parsedDueDate = null;
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      parsedDueDate = d;
    }
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  const milestone = await prisma.milestones.create({
    data: {
      contract_id: contractId,
      title: (title || 'Milestone Deliverable').trim(),
      description: description || '',
      amount: numericAmount,
      due_date: parsedDueDate,
      status: 'PENDING',
    },
  });

  return milestone;
}

/**
 * Fund Milestone into Escrow:
 * Moves funds from Client Available Balance to Client Reserved Escrow Balance atomically.
 */
export async function fundMilestoneEscrow(clientId, milestoneId) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Fetch milestone and contract
    const mRes = await client.query(
      `SELECT m.id, m.amount, m.status, c.client_id, c.id AS contract_id
       FROM milestones m
       JOIN contracts c ON m.contract_id = c.id
       WHERE m.id = $1
       FOR UPDATE OF m;`,
      [milestoneId]
    );

    if (mRes.rows.length === 0) {
      throw new Error('Milestone not found.');
    }

    const milestone = mRes.rows[0];
    if (milestone.client_id !== clientId) {
      throw new Error('Unauthorized to fund this milestone.');
    }

    const amount = parseFloat(milestone.amount);

    // 2. Ensure client wallet exists and lock FOR UPDATE
    await client.query(
      `INSERT INTO wallets (user_id, available_balance, reserved_balance)
       VALUES ($1, 0.00, 0.00)
       ON CONFLICT (user_id) DO NOTHING;`,
      [clientId]
    );

    const wRes = await client.query(
      `SELECT id, available_balance, reserved_balance
       FROM wallets
       WHERE user_id = $1
       FOR UPDATE;`,
      [clientId]
    );

    if (wRes.rows.length === 0) {
      throw new Error('Client wallet not found.');
    }

    const wallet = wRes.rows[0];
    const available = parseFloat(wallet.available_balance);

    if (available < amount) {
      const err = new Error(`Insufficient wallet balance. Required: $${amount.toFixed(2)}, Available: $${available.toFixed(2)}.`);
      err.statusCode = 400;
      throw err;
    }

    // 3. Move amount from available to reserved
    await client.query(
      `UPDATE wallets
       SET available_balance = available_balance - $1,
           reserved_balance = reserved_balance + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2;`,
      [amount, wallet.id]
    );

    // 4. Record ESCROW_FUND transaction
    await client.query(
      `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, description, milestone_id)
       VALUES ($1, 'ESCROW_FUND', $2, $3, $4);`,
      [
        wallet.id,
        amount,
        `Funded escrow for milestone "${milestoneId}" on contract ${milestone.contract_id}`,
        milestoneId,
      ]
    );

    await client.query('COMMIT');

    return {
      success: true,
      message: `Successfully funded $${amount.toFixed(2)} into escrow for milestone.`,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function submitMilestoneWork(freelancerId, milestoneId, submissionNotes) {
  const milestone = await prisma.milestones.findUnique({
    where: { id: milestoneId },
    include: {
      contracts: true,
    },
  });

  if (!milestone) {
    const error = new Error('Milestone not found.');
    error.statusCode = 404;
    throw error;
  }

  if (milestone.contracts.freelancer_id !== freelancerId) {
    const error = new Error('Unauthorized.');
    error.statusCode = 403;
    throw error;
  }

  if (milestone.status !== 'PENDING' && milestone.status !== 'REJECTED') {
    const error = new Error(`Cannot submit work for milestone currently in ${milestone.status} status.`);
    error.statusCode = 400;
    throw error;
  }

  // Update milestone status (Triggers will validate transitions and set submitted_at)
  const updated = await prisma.milestones.update({
    where: { id: milestoneId },
    data: {
      status: 'SUBMITTED',
      submission_notes: submissionNotes,
    },
  });

  // Notify client
  await prisma.notifications.create({
    data: {
      user_id: milestone.contracts.client_id,
      title: 'Milestone Work Submitted',
      message: `Work has been submitted for milestone "${milestone.title}". Please review and approve.`,
      type: 'MILESTONE',
      link: `/client/contracts/${milestone.contract_id}`,
    },
  });

  return updated;
}

export async function approveMilestone(clientId, milestoneId) {
  const milestone = await prisma.milestones.findUnique({
    where: { id: milestoneId },
    include: { contracts: true },
  });

  if (!milestone) {
    const error = new Error('Milestone not found.');
    error.statusCode = 404;
    throw error;
  }

  if (milestone.contracts.client_id !== clientId) {
    const error = new Error('Unauthorized.');
    error.statusCode = 403;
    throw error;
  }

  if (milestone.status !== 'SUBMITTED') {
    const error = new Error(`Cannot approve milestone in ${milestone.status} status. It must be SUBMITTED first.`);
    error.statusCode = 400;
    throw error;
  }

  const updated = await prisma.milestones.update({
    where: { id: milestoneId },
    data: { status: 'APPROVED' },
  });

  // Notify freelancer
  await prisma.notifications.create({
    data: {
      user_id: milestone.contracts.freelancer_id,
      title: 'Milestone Work Approved',
      message: `Your work for milestone "${milestone.title}" was approved by the client! Payment release is pending.`,
      type: 'MILESTONE',
      link: `/freelancer/contracts/${milestone.contract_id}`,
    },
  });

  return updated;
}

export async function rejectMilestone(clientId, milestoneId, reason) {
  const milestone = await prisma.milestones.findUnique({
    where: { id: milestoneId },
    include: { contracts: true },
  });

  if (!milestone) {
    const error = new Error('Milestone not found.');
    error.statusCode = 404;
    throw error;
  }

  if (milestone.contracts.client_id !== clientId) {
    const error = new Error('Unauthorized.');
    error.statusCode = 403;
    throw error;
  }

  if (milestone.status !== 'SUBMITTED') {
    const error = new Error(`Cannot reject milestone in ${milestone.status} status.`);
    error.statusCode = 400;
    throw error;
  }

  const updated = await prisma.milestones.update({
    where: { id: milestoneId },
    data: {
      status: 'REJECTED',
      submission_notes: milestone.submission_notes ? `${milestone.submission_notes}\n[Client Feedback]: ${reason}` : `[Client Feedback]: ${reason}`,
    },
  });

  // Notify freelancer
  await prisma.notifications.create({
    data: {
      user_id: milestone.contracts.freelancer_id,
      title: 'Milestone Revisions Requested',
      message: `Client requested revisions for milestone "${milestone.title}": ${reason}`,
      type: 'MILESTONE',
      link: `/freelancer/contracts/${milestone.contract_id}`,
    },
  });

  return updated;
}

/**
 * Release Milestone Payment:
 * Invokes PostgreSQL stored procedure release_milestone_payment(p_milestone_id, p_client_id)
 * Validates APPROVED status, escrow balance, transfers money, creates ledger entries, and marks PAID.
 */
export async function releasePayment(clientId, milestoneId) {
  const milestone = await prisma.milestones.findUnique({
    where: { id: milestoneId },
    include: { contracts: true },
  });

  if (!milestone) {
    const error = new Error('Milestone not found.');
    error.statusCode = 404;
    throw error;
  }

  // Ensure wallets exist for both parties
  await query(
    `INSERT INTO wallets (user_id, available_balance, reserved_balance)
     VALUES ($1, 0.00, 0.00), ($2, 0.00, 0.00)
     ON CONFLICT (user_id) DO NOTHING;`,
    [clientId, milestone.contracts.freelancer_id]
  );

  await query('CALL release_milestone_payment($1, $2);', [milestoneId, clientId]);

  // Notify freelancer of payment receipt
  await prisma.notifications.create({
    data: {
      user_id: milestone.contracts.freelancer_id,
      title: 'Payment Released!',
      message: `You received $${milestone.amount} for milestone "${milestone.title}". Funds are available in your wallet.`,
      type: 'PAYMENT',
      link: '/freelancer/wallet',
    },
  });

  return {
    success: true,
    message: 'Milestone payment released successfully.',
    milestone,
  };
}
