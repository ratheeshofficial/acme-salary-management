import { HttpError } from '../../common/httpError';
import { asDateString, roundMoney } from '../../common/pagination';
import { AppDataSource } from '../../config/database';
import { SUPPORTED_CURRENCIES, toUsd } from '../../config/exchangeRates';
import { Employee } from '../../entities/Employee';
import { Salary } from '../../entities/Salary';
import { assertUuid } from '../employees/employee.service';

type SalaryInput = {
  amount?: unknown;
  currency?: unknown;
  effectiveFrom?: unknown;
  effective_from?: unknown;
};

export async function listSalaries(employeeId: string) {
  await requireEmployee(employeeId);

  const rows = await AppDataSource.getRepository(Salary).find({
    where: { employee_id: employeeId },
    order: { effective_from: 'DESC' },
  });

  return rows.map(mapSalary);
}

export async function createSalary(employeeId: string, input: SalaryInput) {
  await requireEmployee(employeeId);

  const amount = Number(input.amount);
  const currency = String(input.currency ?? '').trim().toUpperCase();
  const effectiveFrom = String(input.effectiveFrom ?? input.effective_from ?? '').trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, 'Amount must be greater than zero');
  }
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new HttpError(400, `Currency must be one of ${SUPPORTED_CURRENCIES.join(', ')}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom) || Number.isNaN(Date.parse(effectiveFrom))) {
    throw new HttpError(400, 'effectiveFrom must be a date in YYYY-MM-DD format');
  }

  const repo = AppDataSource.getRepository(Salary);
  const duplicates = await AppDataSource.query(
    `SELECT id FROM salaries WHERE employee_id = $1 AND effective_from = $2`,
    [employeeId, effectiveFrom],
  );
  if (duplicates.length > 0) {
    throw new HttpError(409, 'A salary already exists for this effective date');
  }

  try {
    const saved = await repo.save(
      repo.create({
        employee_id: employeeId,
        amount,
        currency,
        effective_from: effectiveFrom,
      }),
    );
    return mapSalary(saved);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new HttpError(409, 'A salary already exists for this effective date');
    }
    throw error;
  }
}

async function requireEmployee(employeeId: string) {
  assertUuid(employeeId);
  const employee = await AppDataSource.getRepository(Employee).findOne({
    where: { id: employeeId },
  });
  if (!employee) {
    throw new HttpError(404, 'Employee not found');
  }
  return employee;
}

function mapSalary(row: Salary) {
  const amount = Number(row.amount);
  return {
    id: row.id,
    employeeId: row.employee_id,
    amount,
    currency: row.currency,
    effectiveFrom: asDateString(row.effective_from),
    amountUsd: roundMoney(toUsd(amount, row.currency)),
    createdAt: row.created_at,
  };
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  ) || (
    typeof error === 'object' &&
    error !== null &&
    'driverError' in error &&
    (error as { driverError?: { code?: string } }).driverError?.code === '23505'
  );
}
