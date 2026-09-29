import { roundMoney } from '../../common/pagination';
import { AppDataSource } from '../../config/database';
import { usdCaseSql } from '../../config/exchangeRates';

const BANDS = [
  { band: 'under_50000', label: 'Under 50,000 USD' },
  { band: '50000_to_99999', label: '50,000 to 99,999 USD' },
  { band: '100000_and_above', label: '100,000 USD and above' },
] as const;

type GroupRow = {
  name: string;
  employee_count: number;
  total_expenditure_usd: string | number;
};

type BandRow = {
  band: string;
  count: number;
};

export async function getDashboard() {
  const amountUsd = usdCaseSql('cs.amount', 'cs.currency');
  const valuedCte = `
    WITH current_salary AS (
      SELECT DISTINCT ON (s.employee_id)
        s.employee_id, s.amount, s.currency
      FROM salaries s
      WHERE s.effective_from <= CURRENT_DATE
      ORDER BY s.employee_id, s.effective_from DESC
    ),
    valued AS (
      SELECT e.country, e.department, ${amountUsd} AS amount_usd
      FROM employees e
      INNER JOIN current_salary cs ON cs.employee_id = e.id
    )
  `;

  const [summary] = await AppDataSource.query(`
    ${valuedCte}
    SELECT
      (SELECT COUNT(*)::int FROM employees) AS total_employees,
      COALESCE((SELECT AVG(amount_usd) FROM valued), 0) AS average_salary_usd,
      COALESCE((SELECT SUM(amount_usd) FROM valued), 0) AS total_expenditure_usd
  `);

  const byCountry = (await AppDataSource.query(`
    ${valuedCte}
    SELECT country AS name, COUNT(*)::int AS employee_count, SUM(amount_usd) AS total_expenditure_usd
    FROM valued
    GROUP BY country
    ORDER BY country
  `)) as GroupRow[];

  const byDepartment = (await AppDataSource.query(`
    ${valuedCte}
    SELECT department AS name, COUNT(*)::int AS employee_count, SUM(amount_usd) AS total_expenditure_usd
    FROM valued
    GROUP BY department
    ORDER BY department
  `)) as GroupRow[];

  const bandRows = (await AppDataSource.query(`
    ${valuedCte}
    SELECT band, COUNT(*)::int AS count
    FROM (
      SELECT CASE
        WHEN amount_usd < 50000 THEN 'under_50000'
        WHEN amount_usd < 100000 THEN '50000_to_99999'
        ELSE '100000_and_above'
      END AS band
      FROM valued
    ) bands
    GROUP BY band
  `)) as BandRow[];

  const counts = new Map(bandRows.map((row) => [row.band, row.count]));

  return {
    totalEmployees: summary.total_employees as number,
    averageSalaryUsd: roundMoney(Number(summary.average_salary_usd)),
    totalExpenditureUsd: roundMoney(Number(summary.total_expenditure_usd)),
    byCountry: byCountry.map(mapGroup),
    byDepartment: byDepartment.map(mapGroup),
    distribution: BANDS.map((band) => ({
      band: band.band,
      label: band.label,
      count: counts.get(band.band) ?? 0,
    })),
  };
}

function mapGroup(row: GroupRow) {
  return {
    name: row.name,
    employeeCount: row.employee_count,
    totalExpenditureUsd: roundMoney(Number(row.total_expenditure_usd)),
  };
}
