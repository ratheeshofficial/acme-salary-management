import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { roundMoney } from '../src/common/pagination';
import { USD_RATES } from '../src/config/exchangeRates';
import {
  app,
  closeTestDb,
  createEmployee,
  createSalary,
  initTestDb,
  login,
  resetDb,
} from './helpers';

beforeAll(initTestDb);
beforeEach(resetDb);
afterAll(closeTestDb);

describe('dashboard', () => {
  it('aggregates current salaries into USD using the rate table', async () => {
    const ada = await createEmployee({
      employee_code: 'E-201',
      email: 'ada@acme.com',
      first_name: 'Ada',
      country: 'India',
      department: 'Engineering',
    });
    const grace = await createEmployee({
      employee_code: 'E-202',
      email: 'grace@acme.com',
      first_name: 'Grace',
      country: 'United States',
      department: 'Engineering',
    });
    const alan = await createEmployee({
      employee_code: 'E-203',
      email: 'alan@acme.com',
      first_name: 'Alan',
      country: 'United Kingdom',
      department: 'People',
    });

    const salaries = [
      { employeeId: ada.id, amount: 100000, currency: 'INR' },
      { employeeId: grace.id, amount: 120000, currency: 'USD' },
      { employeeId: alan.id, amount: 80000, currency: 'GBP' },
    ];
    for (const salary of salaries) {
      await createSalary(salary.employeeId, salary.amount, salary.currency, '2024-01-01');
    }

    const expectedTotal = roundMoney(
      salaries.reduce((sum, salary) => sum + salary.amount * USD_RATES[salary.currency], 0),
    );
    const token = await login();
    const response = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.totalEmployees).toBe(3);
    expect(response.body.data.totalExpenditureUsd).toBe(expectedTotal);
    expect(response.body.data.averageSalaryUsd).toBe(roundMoney(expectedTotal / 3));
    expect(response.body.data.byCountry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'India', employeeCount: 1 }),
        expect.objectContaining({ name: 'United States', employeeCount: 1 }),
        expect.objectContaining({ name: 'United Kingdom', employeeCount: 1 }),
      ]),
    );
    expect(response.body.data.distribution.reduce(
      (sum: number, band: { count: number }) => sum + band.count,
      0,
    )).toBe(3);
  });
});
