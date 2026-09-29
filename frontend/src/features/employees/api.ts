import { api } from '../../services/api.ts'
import type { Employee, EmployeeFilters, EmployeePage } from '../../types/api.ts'
import { toEmployeeSearchParams, type EmployeeQuery } from './employeeQuery.ts'

export function listEmployees(query: EmployeeQuery) {
  return api<EmployeePage>(`/api/employees?${toEmployeeSearchParams(query).toString()}`)
}

export function getEmployee(id: string) {
  return api<Employee>(`/api/employees/${id}`)
}

export function listFilters() {
  return api<EmployeeFilters>('/api/employees/filters')
}
