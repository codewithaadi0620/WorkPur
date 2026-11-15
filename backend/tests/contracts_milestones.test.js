import { request, app, loginAs, prisma, pool } from './helpers.js';

describe('CONTRACTS & MILESTONES LIFECYCLE SUITE', () => {
  let clientToken;
  let freelancerToken;
  let contractId;
  let milestoneId;
  let clientId;
  let freelancerId;

  beforeAll(async () => {
    const c = await loginAs('acme.corp@example.com');
    clientToken = c.token;
    clientId = c.user.id;

    const f = await loginAs('alex.fullstack@example.com');
    freelancerToken = f.token;
    freelancerId = f.user.id;

    // Fetch Contract 1 created during seed
    const contract = await prisma.contracts.findFirst({
      where: { client_id: clientId, freelancer_id: freelancerId, status: 'ACTIVE' },
    });
    contractId = contract.id;
  });

  test('POST /api/milestones/contract/:contractId - Client creates a new milestone', async () => {
    const res = await request(app)
      .post(`/api/milestones/contract/${contractId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Milestone: Integration Testing & Verification',
        description: 'Verify all end-to-end user workflows and concurrency checks.',
        amount: 500,
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING');
    milestoneId = res.body.data.id;
  });

  test('POST /api/milestones/:id/fund-escrow - Client funds escrow for milestone', async () => {
    const res = await request(app)
      .post(`/api/milestones/${milestoneId}/fund-escrow`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify client wallet reserved_balance increased
    const wallet = await prisma.wallets.findUnique({ where: { user_id: clientId } });
    expect(parseFloat(wallet.reserved_balance)).toBeGreaterThanOrEqual(500);
  });

  test('POST /api/milestones/:id/submit-work - Freelancer submits milestone deliverables', async () => {
    const res = await request(app)
      .post(`/api/milestones/${milestoneId}/submit-work`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({
        submissionNotes: 'Completed test coverage suite and verified database transaction integrity.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUBMITTED');
  });

  test('POST /api/milestones/:id/approve - Client approves submitted work', async () => {
    const res = await request(app)
      .post(`/api/milestones/${milestoneId}/approve`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
  });

  test('POST /api/milestones/:id/release-payment - Client releases payment via release_milestone_payment() procedure', async () => {
    const freeWalletBefore = await prisma.wallets.findUnique({ where: { user_id: freelancerId } });
    const freeBalBefore = parseFloat(freeWalletBefore.available_balance);

    const res = await request(app)
      .post(`/api/milestones/${milestoneId}/release-payment`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify milestone is now PAID
    const milestone = await prisma.milestones.findUnique({ where: { id: milestoneId } });
    expect(milestone.status).toBe('PAID');

    // Verify freelancer wallet was credited
    const freeWalletAfter = await prisma.wallets.findUnique({ where: { user_id: freelancerId } });
    const freeBalAfter = parseFloat(freeWalletAfter.available_balance);
    expect(freeBalAfter).toBe(freeBalBefore + 500);

    // Verify ledger entry exists
    const tx = await prisma.wallet_transactions.findFirst({
      where: { milestone_id: milestoneId, transaction_type: 'PAYMENT_RELEASE' },
    });
    expect(tx).toBeDefined();
  });

  test('DATABASE TRIGGER: Rejects altering status of an already PAID milestone', async () => {
    await expect(
      pool.query(`UPDATE milestones SET status = 'PENDING' WHERE id = $1;`, [milestoneId])
    ).rejects.toThrow(/paid milestone cannot have its status altered/);
  });
});
