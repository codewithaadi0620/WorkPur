import { request, app, loginAs, prisma, pool } from './helpers.js';

describe('PROPOSAL & TRANSACTIONAL ACCEPTANCE SUITE', () => {
  let clientToken;
  let client2Token;
  let freelancer1Token;
  let freelancer2Token;
  let testProject;
  let prop1Id;
  let prop2Id;

  beforeAll(async () => {
    const c1 = await loginAs('acme.corp@example.com');
    clientToken = c1.token;

    const c2 = await loginAs('techstart@example.com');
    client2Token = c2.token;

    const f1 = await loginAs('alex.fullstack@example.com');
    freelancer1Token = f1.token;

    const f2 = await loginAs('sarah.react@example.com');
    freelancer2Token = f2.token;

    const cat = await prisma.categories.findFirst();

    // Create dedicated project for proposal testing
    testProject = await prisma.projects.create({
      data: {
        client_id: c1.user.id,
        category_id: cat.id,
        title: 'Dedicated Proposal Acceptance Benchmark Project',
        description: 'Test project verifying atomic stored procedure execution and concurrency locks.',
        min_budget: 1000,
        max_budget: 2500,
        deadline: new Date(Date.now() + 20 * 86400000),
        status: 'OPEN',
      },
    });
  });

  afterAll(async () => {
    if (testProject) {
      // Clean up in proper order
      await prisma.milestones.deleteMany({
        where: { contracts: { project_id: testProject.id } },
      });
      await prisma.contracts.deleteMany({ where: { project_id: testProject.id } });
      await prisma.proposals.deleteMany({ where: { project_id: testProject.id } });
      await prisma.projects.deleteMany({ where: { id: testProject.id } });
    }
  });

  test('POST /api/proposals - Freelancer 1 submits proposal successfully', async () => {
    const res = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${freelancer1Token}`)
      .send({
        projectId: testProject.id,
        coverLetter: 'I am highly qualified to complete this architecture with comprehensive database constraints and tests.',
        proposedAmount: 1800,
        estimatedDays: 14,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING');
    prop1Id = res.body.data.id;
  });

  test('POST /api/proposals - Duplicate proposal from same freelancer is rejected', async () => {
    const res = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${freelancer1Token}`)
      .send({
        projectId: testProject.id,
        coverLetter: 'Second proposal attempt which should be rejected by uniqueness constraint.',
        proposedAmount: 1700,
        estimatedDays: 12,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/proposals - Freelancer 2 submits competing proposal', async () => {
    const res = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${freelancer2Token}`)
      .send({
        projectId: testProject.id,
        coverLetter: 'Competing proposal offering rapid delivery and high performance React components.',
        proposedAmount: 1900,
        estimatedDays: 10,
      });

    expect(res.status).toBe(201);
    prop2Id = res.body.data.id;
  });

  test('POST /api/proposals/:id/accept - Non-owner client cannot accept proposal', async () => {
    const res = await request(app)
      .post(`/api/proposals/${prop1Id}/accept`)
      .set('Authorization', `Bearer ${client2Token}`);

    expect(res.status).toBe(400); // Triggered by stored procedure ownership validation
  });

  test('POST /api/proposals/:id/accept - Client accepts Proposal 1 via accept_proposal() stored procedure', async () => {
    const res = await request(app)
      .post(`/api/proposals/${prop1Id}/accept`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify database state:
    // 1. Proposal 1 must be ACCEPTED
    const prop1 = await prisma.proposals.findUnique({ where: { id: prop1Id } });
    expect(prop1.status).toBe('ACCEPTED');

    // 2. Proposal 2 must be automatically REJECTED by stored procedure
    const prop2 = await prisma.proposals.findUnique({ where: { id: prop2Id } });
    expect(prop2.status).toBe('REJECTED');

    // 3. Project status must be IN_PROGRESS
    const proj = await prisma.projects.findUnique({ where: { id: testProject.id } });
    expect(proj.status).toBe('IN_PROGRESS');

    // 4. Contract must be created atomically
    const contract = await prisma.contracts.findUnique({ where: { proposal_id: prop1Id } });
    expect(contract).toBeDefined();
    expect(contract.status).toBe('ACTIVE');
    expect(parseFloat(contract.agreed_amount)).toBe(1800);
  });
});
