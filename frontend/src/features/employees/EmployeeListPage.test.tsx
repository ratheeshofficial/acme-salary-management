import { HttpResponse, http } from 'msw'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { useAuthStore } from '../../store/authStore.ts'
import { makeEmployee } from '../../test/fixtures.ts'
import { renderRoutes } from '../../test/renderApp.tsx'
import { server } from '../../test/server.ts'

function signIn() {
  useAuthStore.getState().setSession('token', {
    id: 'user-1',
    email: 'hr@acme.com',
    role: 'HR_MANAGER',
  })
}

describe('EmployeeListPage', () => {
  it('requests one page and does not ask for the full employee set', async () => {
    const user = userEvent.setup()
    const requests: string[] = []
    signIn()
    server.use(
      http.get('*/api/employees/filters', () =>
        HttpResponse.json({
          success: true,
          message: 'ok',
          data: { countries: ['India', 'Germany'], departments: ['Engineering', 'Sales'] },
        }),
      ),
      http.get('*/api/employees', ({ request }) => {
        requests.push(request.url)
        const page = Number(new URL(request.url).searchParams.get('page') ?? '1')
        const employee =
          page === 1
            ? makeEmployee()
            : makeEmployee({
                id: '44444444-4444-4444-8444-444444444444',
                employeeCode: 'EMP00002',
                firstName: 'Grace',
                lastName: 'Hopper',
              })
        return HttpResponse.json({
          success: true,
          message: 'ok',
          data: { items: [employee], page, limit: 20, total: 40 },
        })
      }),
    )

    renderRoutes('/employees')
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument()

    expect(requests.some((url) => new URL(url).searchParams.get('page') === '2')).toBe(true)
    expect(requests.every((url) => new URL(url).searchParams.get('limit') === '20')).toBe(true)
    expect(requests.some((url) => url.includes('10000'))).toBe(false)
  })

  it('sends search and country filters to the API', async () => {
    const user = userEvent.setup()
    const requests: string[] = []
    signIn()
    server.use(
      http.get('*/api/employees/filters', () =>
        HttpResponse.json({
          success: true,
          message: 'ok',
          data: { countries: ['India'], departments: ['Engineering'] },
        }),
      ),
      http.get('*/api/employees', ({ request }) => {
        requests.push(request.url)
        return HttpResponse.json({
          success: true,
          message: 'ok',
          data: { items: [makeEmployee()], page: 1, limit: 20, total: 1 },
        })
      }),
    )

    renderRoutes('/employees')
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Country'), 'India')
    await user.type(screen.getByLabelText('Search'), 'Ada')

    await waitFor(() => {
      const matched = requests.map((url) => new URL(url))
      expect(matched.some((url) => url.searchParams.get('country') === 'India')).toBe(true)
      expect(matched.some((url) => url.searchParams.get('search') === 'Ada')).toBe(true)
    })
  })
})
