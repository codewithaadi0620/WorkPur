import request from 'supertest';
import { app } from '../src/app.js';
import { pool, prisma } from '../src/config/database.js';

export async function loginAs(email, password = 'password123') {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return {
    token: res.body.data?.token,
    user: res.body.data?.user,
  };
}

export { request, app, pool, prisma };
