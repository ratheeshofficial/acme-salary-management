import { api } from '../../api/client.ts'
import { API_ENDPOINTS } from '../../api/endpoints.ts'
import type { Salary, SalaryInput } from '../../types/api.ts'

export function listSalaries(employeeId: string): Promise<Salary[]> {
  return api<Salary[]>(API_ENDPOINTS.salaries.byEmployeeId(employeeId))
}

export function createSalary(employeeId: string, payload: SalaryInput): Promise<Salary> {
  return api<Salary>(API_ENDPOINTS.salaries.byEmployeeId(employeeId), {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const salaryRepository = {
  list: listSalaries,
  listByEmployeeId: listSalaries,
  create: createSalary,
  listSalaries,
  createSalary,
}
