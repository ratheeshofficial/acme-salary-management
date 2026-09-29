import 'dotenv/config';

import { AppDataSource } from './config/database';
import { HR_SEED } from './config/env';
import { ensureHrManager } from './modules/auth/auth.service';

const EMPLOYEE_COUNT = 10_000;
const BATCH_SIZE = 1_000;

const FIRST_NAMES = [
  'Ava', 'Liam', 'Noah', 'Emma', 'Olivia', 'Mia', 'Ethan', 'Sofia',
  'Arjun', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Meera', 'Kabir', 'Isha',
  'James', 'Charlotte', 'Henry', 'Amelia', 'George', 'Isla', 'Oscar', 'Freya',
  'Luca', 'Elena', 'Mateo', 'Clara', 'Hugo', 'Ines', 'Jonas', 'Mila',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Iyer', 'Nair', 'Reddy', 'Singh', 'Gupta', 'Das',
  'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
  'Smith', 'Jones', 'Walker', 'Hughes', 'Evans', 'Clarke', 'Wright', 'Hall',
  'Schmidt', 'Mueller', 'Weber', 'Fischer', 'Becker', 'Hoffmann', 'Keller', 'Wolf',
];

const LOCATIONS = [
  { country: 'India', currency: 'INR', salaryMin: 400_000, salaryMax: 4_500_000 },
  { country: 'United States', currency: 'USD', salaryMin: 55_000, salaryMax: 220_000 },
  { country: 'United Kingdom', currency: 'GBP', salaryMin: 35_000, salaryMax: 140_000 },
  { country: 'Germany', currency: 'EUR', salaryMin: 40_000, salaryMax: 130_000 },
] as const;

const DEPARTMENTS = [
  { name: 'Engineering', titles: ['Software Engineer', 'Senior Engineer', 'Engineering Manager', 'QA Engineer'] },
  { name: 'Product', titles: ['Product Manager', 'Product Designer', 'Product Analyst'] },
  { name: 'Sales', titles: ['Account Executive', 'Sales Manager', 'Business Development'] },
  { name: 'Marketing', titles: ['Marketing Specialist', 'Content Strategist', 'Marketing Manager'] },
  { name: 'Finance', titles: ['Accountant', 'Financial Analyst', 'Finance Manager'] },
  { name: 'Human Resources', titles: ['HR Specialist', 'Recruiter', 'HR Manager'] },
  { name: 'Operations', titles: ['Operations Analyst', 'Operations Manager'] },
  { name: 'Customer Support', titles: ['Support Specialist', 'Support Lead'] },
] as const;

type SeedEmployee = {
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  department: string;
  designation: string;
  amount: string;
  currency: string;
  effective_from: string;
};

function buildEmployee(index: number): SeedEmployee {
  const sequence = index + 1;
  const location = LOCATIONS[index % LOCATIONS.length];
  const department = DEPARTMENTS[Math.floor(index / LOCATIONS.length) % DEPARTMENTS.length];
  const designation = department.titles[index % department.titles.length];
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  const employeeCode = `EMP${String(sequence).padStart(5, '0')}`;
  const span = location.salaryMax - location.salaryMin;
  const amount = location.salaryMin + ((index * 97) % span);
  const year = 2023 + (index % 4);
  const month = String((index % 12) + 1).padStart(2, '0');
  const day = String((index % 27) + 1).padStart(2, '0');

  return {
    employee_code: employeeCode,
    first_name: firstName,
    last_name: lastName,
    email: `${firstName}.${lastName}.${employeeCode}@acme.test`.toLowerCase(),
    country: location.country,
    department: department.name,
    designation,
    amount: amount.toFixed(2),
    currency: location.currency,
    effective_from: `${year}-${month}-${day}`,
  };
}

async function insertEmployeeBatch(rows: SeedEmployee[]) {
  const inserted = (await AppDataSource.query(
    `INSERT INTO employees (
       employee_code, first_name, last_name, email, country, department, designation
     )
     SELECT * FROM UNNEST(
       $1::varchar[], $2::varchar[], $3::varchar[], $4::varchar[],
       $5::varchar[], $6::varchar[], $7::varchar[]
     )
     ON CONFLICT (employee_code) DO NOTHING
     RETURNING employee_code`,
    [
      rows.map((row) => row.employee_code),
      rows.map((row) => row.first_name),
      rows.map((row) => row.last_name),
      rows.map((row) => row.email),
      rows.map((row) => row.country),
      rows.map((row) => row.department),
      rows.map((row) => row.designation),
    ],
  )) as unknown[];

  const salaries = (await AppDataSource.query(
    `INSERT INTO salaries (employee_id, amount, currency, effective_from)
     SELECT e.id, v.amount, v.currency, v.effective_from
     FROM UNNEST($1::varchar[], $2::numeric[], $3::varchar[], $4::date[])
       AS v(employee_code, amount, currency, effective_from)
     JOIN employees e ON e.employee_code = v.employee_code
     WHERE NOT EXISTS (
       SELECT 1 FROM salaries s WHERE s.employee_id = e.id
     )
     RETURNING id`,
    [
      rows.map((row) => row.employee_code),
      rows.map((row) => row.amount),
      rows.map((row) => row.currency),
      rows.map((row) => row.effective_from),
    ],
  )) as unknown[];

  return {
    employees: inserted.length,
    salaries: salaries.length,
  };
}

async function seedEmployees() {
  const employees = Array.from({ length: EMPLOYEE_COUNT }, (_, index) => buildEmployee(index));
  let insertedEmployees = 0;
  let insertedSalaries = 0;

  for (let offset = 0; offset < employees.length; offset += BATCH_SIZE) {
    const batch = employees.slice(offset, offset + BATCH_SIZE);
    const result = await insertEmployeeBatch(batch);
    insertedEmployees += result.employees;
    insertedSalaries += result.salaries;
    console.log(
      `Seeded ${Math.min(offset + BATCH_SIZE, employees.length)} / ${EMPLOYEE_COUNT}`,
    );
  }

  const [{ count }] = await AppDataSource.query(
    `SELECT COUNT(*)::int AS count
     FROM employees
     WHERE employee_code LIKE 'EMP%'`,
  );

  console.log(
    `Employees ready: ${count} (inserted ${insertedEmployees}, salaries inserted ${insertedSalaries})`,
  );
}

async function seed() {
  await AppDataSource.initialize();
  await ensureHrManager();
  console.log(`HR Manager ready: ${HR_SEED.email}`);
  await seedEmployees();
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
