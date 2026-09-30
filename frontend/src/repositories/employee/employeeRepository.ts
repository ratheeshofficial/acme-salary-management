import { api } from '../../api/client.ts'
import { API_ENDPOINTS } from '../../api/endpoints.ts'
import { toEmployeeSearchParams, type EmployeeQuery } from '../../features/employees/employeeQuery.ts'
import type { Employee, EmployeeFilters, EmployeePage } from '../../types/api.ts'

export function listEmployees(query: EmployeeQuery): Promise<EmployeePage> {
  const searchParams = toEmployeeSearchParams(query).toString()
  return api<EmployeePage>(API_ENDPOINTS.employees.list(searchParams))
}

export function getEmployee(id: string): Promise<Employee> {
  return api<Employee>(API_ENDPOINTS.employees.byId(id))
}

export function listFilters(): Promise<EmployeeFilters> {
  return api<EmployeeFilters>(API_ENDPOINTS.employees.filters)
}

export const employeeRepository = {
  list: listEmployees,
  getById: getEmployee,
  getFilters: listFilters,
  listEmployees,
  getEmployee,
  listFilters,
}
