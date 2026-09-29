import type { EmployeeQuery } from '../features/employees/employeeQuery.ts'

export const queryKeys = {
  employees: (query: EmployeeQuery) => ['employees', query] as const,
  employee: (id: string) => ['employee', id] as const,
  salaries: (id: string) => ['salaries', id] as const,
  filters: ['employee-filters'] as const,
  dashboard: ['dashboard'] as const,
}
