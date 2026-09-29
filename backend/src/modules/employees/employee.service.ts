import { HttpError } from '../../common/httpError';
import { asDateString, escapeLike, parsePagination, roundMoney } from '../../common/pagination';
import { AppDataSource } from '../../config/database';
import { toUsd } from '../../config/exchangeRates';

const SORT_COLUMNS: Record<string, string> = {
  employee_code: 'e.employee_code',
  first_name: 'e.first_name',
  last_name: 'e.last_name',
  email: 'e.email',
  country: 'e.country',
  department: 'e.department',
  designation: 'e.designation',
  created_at: 'e.created_at',
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type EmployeeRow = {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  department: string;
  designation: string;
  created_at: Date | string;
  updated_at: Date | string;
  salary_id: string | null;
  amount: string | null;
  currency: string | null;
  effective_from: Date | string | null;
};

export async function listEmployees(query: Record<string, unknown>) {
  const { page, limit, skip } = parsePagination(query);
  const sortColumn = SORT_COLUMNS[String(query.sortBy ?? 'employee_code')] ?? SORT_COLUMNS.employee_code;
  const sortOrder = String(query.sortOrder ?? 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const { whereSql, params } = buildFilters(query);

  const countRows = await AppDataSource.query(
    `SELECT COUNT(*)::int AS total FROM employees e WHERE ${whereSql}`,
    params,
  );

  const rows = (await AppDataSource.query(
    `${employeeSelect()}
     WHERE ${whereSql}
     ORDER BY ${sortColumn} ${sortOrder}
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, skip],
  )) as EmployeeRow[];

  return {
    items: rows.map(mapEmployee),
    page,
    limit,
    total: countRows[0].total as number,
  };
}

export async function getEmployee(id: string) {
  assertUuid(id);
  const rows = (await AppDataSource.query(
    `${employeeSelect()} WHERE e.id = $1`,
    [id],
  )) as EmployeeRow[];

  if (!rows[0]) {
    throw new HttpError(404, 'Employee not found');
  }

  return mapEmployee(rows[0]);
}

export async function listFilters() {
  const countries = (await AppDataSource.query(
    `SELECT DISTINCT country AS name FROM employees ORDER BY country`,
  )) as Array<{ name: string }>;
  const departments = (await AppDataSource.query(
    `SELECT DISTINCT department AS name FROM employees ORDER BY department`,
  )) as Array<{ name: string }>;

  return {
    countries: countries.map((row) => row.name),
    departments: departments.map((row) => row.name),
  };
}

export function assertUuid(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new HttpError(404, 'Employee not found');
  }
}

function buildFilters(query: Record<string, unknown>) {
  const params: unknown[] = [];
  const where = ['TRUE'];

  const search = String(query.search ?? '').trim();
  if (search) {
    params.push(`%${escapeLike(search)}%`);
    const placeholder = `$${params.length}`;
    where.push(`(
      e.first_name ILIKE ${placeholder} ESCAPE '\\'
      OR e.last_name ILIKE ${placeholder} ESCAPE '\\'
      OR e.email ILIKE ${placeholder} ESCAPE '\\'
      OR e.employee_code ILIKE ${placeholder} ESCAPE '\\'
      OR (e.first_name || ' ' || e.last_name) ILIKE ${placeholder} ESCAPE '\\'
    )`);
  }

  const country = String(query.country ?? '').trim();
  if (country) {
    params.push(country);
    where.push(`LOWER(e.country) = LOWER($${params.length})`);
  }

  const department = String(query.department ?? '').trim();
  if (department) {
    params.push(department);
    where.push(`LOWER(e.department) = LOWER($${params.length})`);
  }

  return { whereSql: where.join(' AND '), params };
}

function employeeSelect() {
  return `SELECT e.id, e.employee_code, e.first_name, e.last_name, e.email,
            e.country, e.department, e.designation, e.created_at, e.updated_at,
            cs.id AS salary_id, cs.amount, cs.currency, cs.effective_from
     FROM employees e
     LEFT JOIN LATERAL (
       SELECT s.id, s.amount, s.currency, s.effective_from
       FROM salaries s
       WHERE s.employee_id = e.id AND s.effective_from <= CURRENT_DATE
       ORDER BY s.effective_from DESC
       LIMIT 1
     ) cs ON TRUE`;
}

function mapEmployee(row: EmployeeRow) {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    country: row.country,
    department: row.department,
    designation: row.designation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    currentSalary: mapCurrentSalary(row),
  };
}

function mapCurrentSalary(row: EmployeeRow) {
  if (!row.salary_id || row.amount === null || !row.currency || !row.effective_from) {
    return null;
  }

  const amount = Number(row.amount);
  return {
    id: row.salary_id,
    amount,
    currency: row.currency,
    effectiveFrom: asDateString(row.effective_from),
    amountUsd: roundMoney(toUsd(amount, row.currency)),
  };
}
