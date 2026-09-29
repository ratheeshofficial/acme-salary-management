import { z } from 'zod'

export const SORT_FIELDS = [
  'employee_code',
  'first_name',
  'last_name',
  'email',
  'country',
  'department',
  'designation',
  'created_at',
] as const

export type SortField = (typeof SORT_FIELDS)[number]
export type SortOrder = 'asc' | 'desc'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function readInt(value: unknown, fallback: number, max?: number) {
  if (value === undefined || value === null || value === '') {
    return fallback
  }
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }
  return max === undefined ? parsed : Math.min(parsed, max)
}

function readText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export const employeeQuerySchema = z
  .object({
    page: z.unknown().optional(),
    limit: z.unknown().optional(),
    search: z.unknown().optional(),
    country: z.unknown().optional(),
    department: z.unknown().optional(),
    sortBy: z.unknown().optional(),
    sortOrder: z.unknown().optional(),
  })
  .transform((value) => ({
    page: readInt(value.page, 1),
    limit: readInt(value.limit, DEFAULT_LIMIT, MAX_LIMIT),
    search: readText(value.search),
    country: readText(value.country),
    department: readText(value.department),
    sortBy: SORT_FIELDS.includes(value.sortBy as SortField)
      ? (value.sortBy as SortField)
      : 'employee_code',
    sortOrder: value.sortOrder === 'desc' ? ('desc' as const) : ('asc' as const),
  }))

export type EmployeeQuery = z.infer<typeof employeeQuerySchema>

export function parseEmployeeQuery(params: URLSearchParams): EmployeeQuery {
  return employeeQuerySchema.parse({
    page: params.get('page') ?? undefined,
    limit: params.get('limit') ?? undefined,
    search: params.get('search') ?? undefined,
    country: params.get('country') ?? undefined,
    department: params.get('department') ?? undefined,
    sortBy: params.get('sortBy') ?? undefined,
    sortOrder: params.get('sortOrder') ?? undefined,
  })
}

export function toEmployeeSearchParams(query: EmployeeQuery) {
  const params = new URLSearchParams()
  params.set('page', String(query.page))
  params.set('limit', String(query.limit))
  params.set('sortBy', query.sortBy)
  params.set('sortOrder', query.sortOrder)
  if (query.search) {
    params.set('search', query.search)
  }
  if (query.country) {
    params.set('country', query.country)
  }
  if (query.department) {
    params.set('department', query.department)
  }
  return params
}
