import { HttpResponse, http } from 'msw'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { useAuthStore } from '../../store/authStore.ts'
import { emptyDashboard } from '../../test/fixtures.ts'
import { renderRoutes } from '../../test/renderApp.tsx'
import { server } from '../../test/server.ts'

describe('LoginPage', () => {
  it('shows validation errors and does not call the API', async () => {
    const user = userEvent.setup()
    let called = false
    server.use(
      http.post('*/api/auth/login', () => {
        called = true
        return HttpResponse.json({ success: true, data: {} })
      }),
    )

    renderRoutes('/login')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('shows the API error for invalid credentials', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/api/auth/login', () =>
        HttpResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 }),
      ),
    )

    renderRoutes('/login')
    await user.type(screen.getByLabelText('Email'), 'hr@acme.com')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('stores the token after a successful login', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/api/auth/login', () =>
        HttpResponse.json({
          success: true,
          message: 'Logged in',
          data: {
            token: 'jwt-token',
            user: { id: 'user-1', email: 'hr@acme.com', role: 'HR_MANAGER' },
          },
        }),
      ),
      http.get('*/api/dashboard', () =>
        HttpResponse.json({ success: true, message: 'ok', data: emptyDashboard }),
      ),
    )

    renderRoutes('/login')
    await user.type(screen.getByLabelText('Email'), 'hr@acme.com')
    await user.type(screen.getByLabelText('Password'), 'Password123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('heading', { name: 'Salary insights' })).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBe('jwt-token')
    expect(localStorage.getItem('acme.salary.session')).toContain('jwt-token')
  })
})
