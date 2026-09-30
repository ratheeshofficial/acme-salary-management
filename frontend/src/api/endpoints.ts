/**
 * Shared API route endpoints configuration
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  employees: {
    list: (searchParams?: string) => (searchParams ? `/api/employees?${searchParams}` : '/api/employees'),
    byId: (id: string) => `/api/employees/${id}`,
    filters: '/api/employees/filters',
  },
  salaries: {
    byEmployeeId: (employeeId: string) => `/api/employees/${employeeId}/salaries`,
  },
  dashboard: {
    get: '/api/dashboard',
  },
} as const
