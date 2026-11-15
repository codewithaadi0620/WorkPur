import { request, app, loginAs, prisma } from './helpers.js';

describe('PROJECT MANAGEMENT SUITE', () => {
  let clientToken;
  let freelancerToken;
  let createdProjectId;
  let categoryId;
  let skillId;

  beforeAll(async () => {
    const clientAuth = await loginAs('acme.corp@example.com');
    clientToken = clientAuth.token;

    const freelancerAuth = await loginAs('alex.fullstack@example.com');
    freelancerToken = freelancerAuth.token;

    const cat = await prisma.categories.findFirst();
    categoryId = cat.id;

    const skill = await prisma.skills.findFirst();
    skillId = skill.id;
  });

  afterAll(async () => {
    if (createdProjectId) {
      await prisma.project_skills.deleteMany({ where: { project_id: createdProjectId } });
      await prisma.projects.deleteMany({ where: { id: createdProjectId } });
    }
  });

  test('POST /api/projects - Client successfully creates a new project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Real-Time Telemetry Tracking API',
        description: 'Need an advanced Node.js and PostgreSQL backend with WebSocket support for live fleet telemetry.',
        categoryId,
        projectType: 'FIXED_PRICE',
        experienceLevel: 'EXPERT',
        minBudget: 1500,
        maxBudget: 3000,
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        skillIds: [skillId],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Real-Time Telemetry Tracking API');
    expect(res.body.data.status).toBe('OPEN');
    createdProjectId = res.body.data.id;
  });

  test('POST /api/projects - Rejects project creation by FREELANCER role', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({
        title: 'Unauthorized Project Attempt',
        description: 'Freelancers are not permitted to create projects on the platform.',
        categoryId,
        minBudget: 1000,
        maxBudget: 2000,
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        skillIds: [skillId],
      });

    expect(res.status).toBe(403);
  });

  test('GET /api/projects - Publicly retrieves filtered projects', async () => {
    const res = await request(app)
      .get('/api/projects')
      .query({ search: 'Telemetry', status: 'OPEN' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
  });

  test('PUT /api/projects/:id - Client successfully updates own project', async () => {
    const res = await request(app)
      .put(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Real-Time Telemetry API (Updated Scope)',
        maxBudget: 3500,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Real-Time Telemetry API (Updated Scope)');
  });

  test('GET /api/projects/:id/smart-matches - Computes rule-based freelancer match scores', async () => {
    const res = await request(app)
      .get(`/api/projects/${createdProjectId}/smart-matches`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].matchScore).toBeDefined();
    expect(res.body.data[0].matchBreakdown).toBeDefined();
    expect(res.body.data[0].matchBreakdown.skillScore).toBeDefined();
  });
});
