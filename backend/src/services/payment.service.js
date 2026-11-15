import { prisma, query, getClient } from '../config/database.js';

export async function getUserWallet(userId) {
  let wallet = await prisma.wallets.findUnique({
    where: { user_id: userId },
  });

  if (!wallet) {
    // Lazy creation if missing
    wallet = await prisma.wallets.create({
      data: {
        user_id: userId,
        available_balance: 0.00,
        reserved_balance: 0.00,
      },
    });
  }

  // Fetch recent ledger transactions
  const transactions = await prisma.wallet_transactions.findMany({
    where: { wallet_id: wallet.id },
    include: {
      milestones: {
        select: { id: true, title: true, contract_id: true },
      },
    },
    orderBy: { created_at: 'desc' },
    take: 50,
  });

  return {
    wallet,
    transactions,
  };
}

/**
 * Deposit simulated funds into wallet
 */
export async function depositFunds(userId, amount, description = 'Simulated funds deposit') {
  if (amount <= 0) {
    const error = new Error('Deposit amount must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Lock wallet FOR UPDATE
    const wRes = await client.query(
      `SELECT id, available_balance
       FROM wallets
       WHERE user_id = $1
       FOR UPDATE;`,
      [userId]
    );

    if (wRes.rows.length === 0) {
      throw new Error('Wallet not found.');
    }

    const wallet = wRes.rows[0];

    // Credit available balance
    const updated = await client.query(
      `UPDATE wallets
       SET available_balance = available_balance + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *;`,
      [amount, wallet.id]
    );

    // Record ledger entry
    await client.query(
      `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, description)
       VALUES ($1, 'DEPOSIT', $2, $3);`,
      [wallet.id, amount, description]
    );

    await client.query('COMMIT');

    return {
      success: true,
      message: `Successfully deposited $${parseFloat(amount).toFixed(2)} into simulated wallet.`,
      wallet: updated.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Withdraw / Simulated transfer out
 */
export async function withdrawFunds(userId, amount) {
  if (amount <= 0) {
    const error = new Error('Withdrawal amount must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const wRes = await client.query(
      `SELECT id, available_balance
       FROM wallets
       WHERE user_id = $1
       FOR UPDATE;`,
      [userId]
    );

    if (wRes.rows.length === 0) {
      throw new Error('Wallet not found.');
    }

    const wallet = wRes.rows[0];
    const available = parseFloat(wallet.available_balance);

    if (available < amount) {
      const err = new Error(`Insufficient funds. Available: $${available.toFixed(2)}, Requested: $${parseFloat(amount).toFixed(2)}.`);
      err.statusCode = 400;
      throw err;
    }

    const updated = await client.query(
      `UPDATE wallets
       SET available_balance = available_balance - $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *;`,
      [amount, wallet.id]
    );

    await client.query(
      `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, description)
       VALUES ($1, 'REFUND', $2, 'Simulated funds withdrawal');`,
      [wallet.id, amount]
    );

    await client.query('COMMIT');

    return {
      success: true,
      message: `Successfully withdrawn $${parseFloat(amount).toFixed(2)} from wallet.`,
      wallet: updated.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
