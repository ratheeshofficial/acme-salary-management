export type SessionUser = {
  id: string
  email: string
  role: string
}

export type LoginResult = {
  token: string
  user: SessionUser
}

export type CurrentSalary = {
  id: string
  amount: number
  currency: string
  effectiveFrom: string
  amountUsd: number
}

export type Employee = {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  country: string
  department: string
  designation: string
  createdAt: string
  updatedAt: string
  currentSalary: CurrentSalary | null
}

export type EmployeePage = {
  items: Employee[]
  page: number
  limit: number
  total: number
}

export type EmployeeFilters = {
  countries: string[]
  departments: string[]
}

export type Salary = {
  id: string
  employeeId: string
  amount: number
  currency: string
  effectiveFrom: string
  amountUsd: number
  createdAt: string
}

export type SalaryInput = {
  amount: number
  currency: string
  effectiveFrom: string
}

export type SalaryGroup = {
  name: string
  employeeCount: number
  totalExpenditureUsd: number
}

export type SalaryBand = {
  band: string
  label: string
  count: number
}

export type Dashboard = {
  totalEmployees: number
  averageSalaryUsd: number
  totalExpenditureUsd: number
  byCountry: SalaryGroup[]
  byDepartment: SalaryGroup[]
  distribution: SalaryBand[]
}
