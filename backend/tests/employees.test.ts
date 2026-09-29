import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { app, closeTestDb, createEmployee, initTestDb, login, resetDb } from './helpers';

beforeAll(initTestDb);
beforeEach(resetDb);
afterAll(closeTestDb);

describe('employees', () => {
  it('searches, filters by country, and paginates in the database', async () => {
    await createEmployee({
      employee_code: 'E-001',
      email: 'ada@acme.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      country: 'India',
      department: 'Engineering',
    });
    await createEmployee({
      employee_code: 'E-002',
      email: 'grace@acme.com',
      first_name: 'Grace',
      last_name: 'Hopper',
      country: 'United States',
      department: 'Engineering',
    });
    await createEmployee({
      employee_code: 'E-003',
      email: 'alan@acme.com',
      first_name: 'Alan',
      last_name: 'Turing',
      country: 'United Kingdom',
      department: 'People',
    });

    const token = await login();
    const auth = { Authorization: `Bearer ${token}` };

    const search = await request(app).get('/api/employees').query({ search: 'Ada' }).set(auth);
    expect(search.status).toBe(200);
    expect(search.body.data.total).toBe(1);
    expect(search.body.data.items[0].employeeCode).toBe('E-001');

    const country = await request(app)
      .get('/api/employees')
      .query({ country: 'india' })
      .set(auth);
    expect(country.body.data.total).toBe(1);
    expect(country.body.data.items[0].country).toBe('India');

    const page = await request(app)
      .get('/api/employees')
      .query({ page: 1, limit: 2, sortBy: 'employee_code', sortOrder: 'asc' })
      .set(auth);
    expect(page.body.data.total).toBe(3);
    expect(page.body.data.items).toHaveLength(2);
    expect(page.body.data.items.map((item: { employeeCode: string }) => item.employeeCode)).toEqual([
      'E-001',
      'E-002',
    ]);
  });

  it('returns distinct countries and departments for filters', async () => {
    await createEmployee({
      employee_code: 'E-001',
      email: 'ada@acme.com',
      country: 'India',
      department: 'Engineering',
    });
    await createEmployee({
      employee_code: 'E-002',
      email: 'grace@acme.com',
      country: 'United States',
      department: 'Engineering',
    });
    await createEmployee({
      employee_code: 'E-003',
      email: 'alan@acme.com',
      country: 'United Kingdom',
      department: 'People',
    });

    const token = await login();
    const response = await request(app)
      .get('/api/employees/filters')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.countries).toEqual(['India', 'United Kingdom', 'United States']);
    expect(response.body.data.departments).toEqual(['Engineering', 'People']);
  });

  it('returns 404 for an unknown employee', async () => {
    const token = await login();
    const response = await request(app)
      .get('/api/employees/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
