import type { Dashboard, Employee, Salary } from '../types/api.ts'

export const employeeId = '11111111-1111-4111-8111-111111111111'

export function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: employeeId,
    employeeCode: 'EMP00001',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada.lovelace@acme.test',
    country: 'India',
    department: 'Engineering',
    designation: 'Software Engineer',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    currentSalary: {
      id: '22222222-2222-4222-8222-222222222222',
      amount: 1200000,
      currency: 'INR',
      effectiveFrom: '2024-01-01',
      amountUsd: 14400,
    },
    ...overrides,
  }
}

export function makeSalary(overrides: Partial<Salary> = {}): Salary {
  return {
    id: '33333333-3333-4333-8333-333333333333',
    employeeId,
    amount: 1200000,
    currency: 'INR',
    effectiveFrom: '2024-01-01',
    amountUsd: 14400,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export const dashboardFixture: Dashboard = {
  totalEmployees: 10000,
  averageSalaryUsd: 84250.5,
  totalExpenditureUsd: 1200000,
  byCountry: [{ name: 'India', employeeCount: 2500, totalExpenditureUsd: 300000 }],
  byDepartment: [{ name: 'Engineering', employeeCount: 2000, totalExpenditureUsd: 400000 }],
  distribution: [
    { band: 'under_50000', label: 'Under 50,000 USD', count: 1000 },
    { band: '50000_to_99999', label: '50,000 to 99,999 USD', count: 4000 },
    { band: '100000_and_above', label: '100,000 USD and above', count: 5000 },
  ],
}

export const emptyDashboard: Dashboard = {
  totalEmployees: 0,
  averageSalaryUsd: 0,
  totalExpenditureUsd: 0,
  byCountry: [],
  byDepartment: [],
  distribution: dashboardFixture.distribution.map((band) => ({ ...band, count: 0 })),
}
