import request from 'supertest';

import app from '../src/app';
import { AppDataSource } from '../src/config/database';
import { HR_SEED } from '../src/config/env';
import { Employee } from '../src/entities/Employee';
import { Salary } from '../src/entities/Salary';
import { ensureHrManager } from '../src/modules/auth/auth.service';

export async function initTestDb() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

export async function closeTestDb() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}

export async function resetDb() {
  await AppDataSource.query(
    'TRUNCATE TABLE "salaries", "employees", "users" RESTART IDENTITY CASCADE',
  );
  await ensureHrManager();
}

export async function login() {
  const response = await request(app).post('/api/auth/login').send({
    email: HR_SEED.email,
    password: HR_SEED.password,
  });
  return response.body.data.token as string;
}

export async function createEmployee(
  input: Partial<Employee> & Pick<Employee, 'employee_code' | 'email'>,
) {
  const repo = AppDataSource.getRepository(Employee);
  return repo.save(
    repo.create({
      first_name: 'Test',
      last_name: 'User',
      country: 'India',
      department: 'Engineering',
      designation: 'Engineer',
      ...input,
    }),
  );
}

export async function createSalary(
  employeeId: string,
  amount: number,
  currency: string,
  effectiveFrom: string,
) {
  const repo = AppDataSource.getRepository(Salary);
  return repo.save(
    repo.create({
      employee_id: employeeId,
      amount,
      currency,
      effective_from: effectiveFrom,
    }),
  );
}

export function today() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export { app };
