import { request, app, loginAs, prisma, pool } from './helpers.js';

describe('SIMULATED PAYMENTS & WALLET INTEGRITY SUITE', () => {
  let clientToken;
  let clientId;

  beforeAll(async () => {
    const c = await loginAs('techstart@example.com');
    clientToken = c.token;
    clientId = c.user.id;
  });

  test('POST /api/payments/deposit - Successfully deposit funds into client wallet', async () => {
    const res = await request(app)
      .post('/api/payments/deposit')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        amount: 2500,
        description: 'Test simulated deposit for project funding',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(parseFloat(res.body.wallet.available_balance)).toBeGreaterThanOrEqual(2500);

    // Verify ledger entry
    const tx = await prisma.wallet_transactions.findFirst({
      where: {
        wallet_id: res.body.wallet.id,
        transaction_type: 'DEPOSIT',
      },
      orderBy: { created_at: 'desc' },
    });
    expect(tx).toBeDefined();
    expect(parseFloat(tx.amount)).toBe(2500);
  });

  test('POST /api/payments/withdraw - Rejects withdrawal exceeding available balance', async () => {
    const res = await request(app)
      .post('/api/payments/withdraw')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        amount: 9999999, // Way more than available
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Insufficient funds');
  });

  test('DATABASE TRIGGER & CONSTRAINT: Database forbids negative balance on wallet update', async () => {
    const wallet = await prisma.wallets.findUnique({ where: { user_id: clientId } });
    
    // Attempting raw SQL direct update to negative balance
    await expect(
      pool.query(`UPDATE wallets SET available_balance = -500 WHERE id = $1;`, [wallet.id])
    ).rejects.toThrow();
  });
});
