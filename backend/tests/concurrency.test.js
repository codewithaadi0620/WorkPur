import { request, app, loginAs, prisma } from './helpers.js';

describe('CONCURRENCY & TRANSACTION ISOLATION SUITE', () => {
  let clientToken;
  let testProject;
  let propAId;
  let propBId;

  beforeAll(async () => {
    const c = await loginAs('acme.corp@example.com');
    clientToken = c.token;

    const cat = await prisma.categories.findFirst();
    const f1 = await prisma.users.findUnique({ where: { email: 'alex.fullstack@example.com' } });
    const f2 = await prisma.users.findUnique({ where: { email: 'sarah.react@example.com' } });

    // Create a fresh project for concurrency test
    testProject = await prisma.projects.create({
      data: {
        client_id: c.user.id,
        category_id: cat.id,
        title: 'High-Concurrency Proposal Race Condition Project',
        description: 'Simulating simultaneous competing requests to accept proposals.',
        min_budget: 1000,
        max_budget: 3000,
        deadline: new Date(Date.now() + 15 * 86400000),
        status: 'OPEN',
      },
    });

    const propA = await prisma.proposals.create({
      data: {
        project_id: testProject.id,
        freelancer_id: f1.id,
        cover_letter: 'Proposal A competing in race condition test.',
        proposed_amount: 1500,
        estimated_days: 10,
        status: 'PENDING',
      },
    });
    propAId = propA.id;

    const propB = await prisma.proposals.create({
      data: {
        project_id: testProject.id,
        freelancer_id: f2.id,
        cover_letter: 'Proposal B competing in race condition test.',
        proposed_amount: 1600,
        estimated_days: 12,
        status: 'PENDING',
      },
    });
    propBId = propB.id;
  });

  afterAll(async () => {
    if (testProject) {
      await prisma.contracts.deleteMany({ where: { project_id: testProject.id } });
      await prisma.proposals.deleteMany({ where: { project_id: testProject.id } });
      await prisma.projects.deleteMany({ where: { id: testProject.id } });
    }
  });

  test('CONCURRENCY: Simultaneous acceptance of competing proposals on same project - Exactly ONE succeeds', async () => {
    // Fire two simultaneous HTTP requests to accept Proposal A and Proposal B
    const [responseA, responseB] = await Promise.all([
      request(app)
        .post(`/api/proposals/${propAId}/accept`)
        .set('Authorization', `Bearer ${clientToken}`),
      request(app)
        .post(`/api/proposals/${propBId}/accept`)
        .set('Authorization', `Bearer ${clientToken}`),
    ]);

    const statuses = [responseA.status, responseB.status];

    // One must succeed with 200, the other must fail with 400
    expect(statuses).toContain(200);
    expect(statuses).toContain(400);

    // Verify only ONE contract was generated
    const contracts = await prisma.contracts.findMany({
      where: { project_id: testProject.id },
    });
    expect(contracts.length).toBe(1);

    // Verify project is in IN_PROGRESS status
    const updatedProject = await prisma.projects.findUnique({
      where: { id: testProject.id },
    });
    expect(updatedProject.status).toBe('IN_PROGRESS');
  });
});
