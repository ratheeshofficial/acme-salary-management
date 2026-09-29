import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '../../store/authStore.ts'
import { dashboardFixture } from '../../test/fixtures.ts'
import { renderRoutes } from '../../test/renderApp.tsx'
import { server } from '../../test/server.ts'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}))

describe('DashboardPage', () => {
  it('renders USD summary figures and salary bands', async () => {
    useAuthStore.getState().setSession('token', {
      id: 'user-1',
      email: 'hr@acme.com',
      role: 'HR_MANAGER',
    })
    server.use(
      http.get('*/api/dashboard', () =>
        HttpResponse.json({ success: true, message: 'ok', data: dashboardFixture }),
      ),
    )

    renderRoutes('/')

    expect(await screen.findByText('10,000')).toBeInTheDocument()
    expect(screen.getByText('$84,250.50')).toBeInTheDocument()
    expect(screen.getByText('$1,200,000.00')).toBeInTheDocument()
    expect(screen.getByText(/Under 50,000 USD/)).toBeInTheDocument()
    expect(screen.getByText(/50,000 to 99,999 USD/)).toBeInTheDocument()
    expect(screen.getByText(/100,000 USD and above/)).toBeInTheDocument()
  })
})
