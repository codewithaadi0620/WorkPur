import { request, app, prisma } from './helpers.js';

describe('AUTHENTICATION & AUTHORIZATION SUITE', () => {
  const testEmail = `tester_${Date.now()}@example.com`;

  afterAll(async () => {
    // Cleanup created test user
    await prisma.users.deleteMany({
      where: { email: { contains: 'tester_' } },
    });
  });

  test('POST /api/auth/register - Successfully register new client account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Client',
        email: testEmail,
        password: 'password123',
        role: 'CLIENT',
        companyName: 'Test Innovations Ltd',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.role).toBe('CLIENT');
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /api/auth/register - Rejects duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another Client',
        email: testEmail,
        password: 'password123',
        role: 'CLIENT',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - Successfully login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
  });

  test('POST /api/auth/login - Rejects invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Rejects unauthorized request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Successfully retrieves current user profile with token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'password123' });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.wallet).toBeDefined();
  });
});
