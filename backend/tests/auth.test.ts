import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { HR_SEED } from '../src/config/env';
import { app, closeTestDb, initTestDb, resetDb } from './helpers';

beforeAll(initTestDb);
beforeEach(resetDb);
afterAll(closeTestDb);

describe('auth', () => {
  it('logs in the HR manager and returns a token', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: HR_SEED.email,
      password: HR_SEED.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user.email).toBe(HR_SEED.email);
  });

  it('rejects a wrong password', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: HR_SEED.email,
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('rejects protected routes without a token', async () => {
    const response = await request(app).get('/api/employees');

    expect(response.status).toBe(401);
  });

  it('accepts logout when the token is valid', async () => {
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: HR_SEED.email,
      password: HR_SEED.password,
    });

    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${loginResponse.body.data.token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
