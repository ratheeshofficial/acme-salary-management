import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  app,
  closeTestDb,
  createEmployee,
  createSalary,
  initTestDb,
  login,
  resetDb,
  today,
} from './helpers';

beforeAll(initTestDb);
beforeEach(resetDb);
afterAll(closeTestDb);

describe('salaries', () => {
  it('keeps history and changes the current salary only for the latest effective date', async () => {
    const employee = await createEmployee({
      employee_code: 'E-100',
      email: 'salary@acme.com',
    });
    await createSalary(employee.id, 100000, 'INR', '2024-01-01');
    const token = await login();
    const auth = { Authorization: `Bearer ${token}` };

    const older = await request(app)
      .post(`/api/employees/${employee.id}/salaries`)
      .set(auth)
      .send({ amount: 50000, currency: 'INR', effectiveFrom: '2020-01-01' });
    expect(older.status).toBe(201);

    const afterOlder = await request(app).get(`/api/employees/${employee.id}`).set(auth);
    expect(afterOlder.body.data.currentSalary.amount).toBe(100000);
    expect(afterOlder.body.data.currentSalary.effectiveFrom).toBe('2024-01-01');

    const current = await request(app)
      .post(`/api/employees/${employee.id}/salaries`)
      .set(auth)
      .send({ amount: 150000, currency: 'INR', effectiveFrom: today() });
    expect(current.status).toBe(201);

    const afterCurrent = await request(app).get(`/api/employees/${employee.id}`).set(auth);
    expect(afterCurrent.body.data.currentSalary.amount).toBe(150000);
    expect(afterCurrent.body.data.currentSalary.effectiveFrom).toBe(today());

    const history = await request(app).get(`/api/employees/${employee.id}/salaries`).set(auth);
    expect(history.status).toBe(200);
    expect(history.body.data).toHaveLength(3);
    expect(history.body.data[0].effectiveFrom).toBe(today());
  });

  it('rejects a duplicate effective date, a non-positive amount, and an unknown employee', async () => {
    const employee = await createEmployee({
      employee_code: 'E-101',
      email: 'dup@acme.com',
    });
    await createSalary(employee.id, 100000, 'INR', '2024-01-01');
    const token = await login();
    const auth = { Authorization: `Bearer ${token}` };

    const duplicate = await request(app)
      .post(`/api/employees/${employee.id}/salaries`)
      .set(auth)
      .send({ amount: 110000, currency: 'INR', effectiveFrom: '2024-01-01' });
    expect(duplicate.status).toBe(409);

    const invalid = await request(app)
      .post(`/api/employees/${employee.id}/salaries`)
      .set(auth)
      .send({ amount: 0, currency: 'INR', effectiveFrom: '2025-01-01' });
    expect(invalid.status).toBe(400);

    const missing = await request(app)
      .post('/api/employees/00000000-0000-4000-8000-000000000000/salaries')
      .set(auth)
      .send({ amount: 1000, currency: 'USD', effectiveFrom: '2025-01-01' });
    expect(missing.status).toBe(404);
  });
});
