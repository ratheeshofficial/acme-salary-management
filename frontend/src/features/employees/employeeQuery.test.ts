import { describe, expect, it } from 'vitest'

import { employeeQuerySchema, parseEmployeeQuery } from './employeeQuery.ts'

describe('employeeQuerySchema', () => {
  it('applies page, limit, and sort defaults', () => {
    expect(employeeQuerySchema.parse({})).toEqual({
      page: 1,
      limit: 20,
      search: '',
      country: '',
      department: '',
      sortBy: 'employee_code',
      sortOrder: 'asc',
    })
  })

  it('keeps a valid query and clamps the page size to 100', () => {
    expect(
      employeeQuerySchema.parse({
        page: '2',
        limit: '500',
        search: '  ada ',
        country: 'India',
        department: 'Engineering',
        sortBy: 'country',
        sortOrder: 'desc',
      }),
    ).toEqual({
      page: 2,
      limit: 100,
      search: 'ada',
      country: 'India',
      department: 'Engineering',
      sortBy: 'country',
      sortOrder: 'desc',
    })
  })

  it('falls back when page, limit, or sort fields are invalid', () => {
    expect(
      parseEmployeeQuery(
        new URLSearchParams({
          page: '0',
          limit: 'nope',
          sortBy: 'salary',
          sortOrder: 'sideways',
        }),
      ),
    ).toMatchObject({
      page: 1,
      limit: 20,
      sortBy: 'employee_code',
      sortOrder: 'asc',
    })
  })
})
