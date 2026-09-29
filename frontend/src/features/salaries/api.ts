import { api } from '../../services/api.ts'
import type { Salary, SalaryInput } from '../../types/api.ts'

export function listSalaries(employeeId: string) {
  return api<Salary[]>(`/api/employees/${employeeId}/salaries`)
}

export function createSalary(employeeId: string, payload: SalaryInput) {
  return api<Salary>(`/api/employees/${employeeId}/salaries`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
