import { HttpResponse, http } from 'msw'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { employeeId } from '../../test/fixtures.ts'
import { renderWithProviders } from '../../test/renderApp.tsx'
import { server } from '../../test/server.ts'
import { SalaryForm } from './SalaryForm.tsx'

describe('SalaryForm', () => {
  it('blocks an invalid submit', async () => {
    const user = userEvent.setup()
    let posted = false
    server.use(
      http.post('*/api/employees/:id/salaries', () => {
        posted = true
        return HttpResponse.json({ success: true, data: {} })
      }),
    )

    renderWithProviders(<SalaryForm employeeId={employeeId} existingDates={['2026-01-01']} />)
    await user.click(screen.getByRole('button', { name: 'Record salary' }))

    expect(await screen.findByText('Amount must be greater than zero')).toBeInTheDocument()
    expect(screen.getByText('effectiveFrom must be a date in YYYY-MM-DD format')).toBeInTheDocument()
    expect(posted).toBe(false)

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '90000' } })
    fireEvent.change(screen.getByLabelText('Effective date'), { target: { value: '2026-01-01' } })
    await user.click(screen.getByRole('button', { name: 'Record salary' }))

    expect(await screen.findByText('A salary already exists for this effective date')).toBeInTheDocument()
    expect(posted).toBe(false)
  })

  it('posts amount, currency, and effective date', async () => {
    const user = userEvent.setup()
    let posted: unknown
    server.use(
      http.post('*/api/employees/:id/salaries', async ({ request }) => {
        posted = await request.json()
        return HttpResponse.json(
          {
            success: true,
            message: 'Salary recorded',
            data: {
              id: 'salary-1',
              employeeId,
              amount: 120000,
              currency: 'INR',
              effectiveFrom: '2026-04-01',
              amountUsd: 1440,
              createdAt: '2026-04-01T00:00:00.000Z',
            },
          },
          { status: 201 },
        )
      }),
    )

    renderWithProviders(<SalaryForm employeeId={employeeId} existingDates={[]} />)
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '120000' } })
    await user.selectOptions(screen.getByLabelText('Currency'), 'INR')
    fireEvent.change(screen.getByLabelText('Effective date'), { target: { value: '2026-04-01' } })
    await user.click(screen.getByRole('button', { name: 'Record salary' }))

    await waitFor(() => {
      expect(posted).toEqual({
        amount: 120000,
        currency: 'INR',
        effectiveFrom: '2026-04-01',
      })
    })
  })

  it('shows a 409 from the API when the date is already taken', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/api/employees/:id/salaries', () =>
        HttpResponse.json(
          { success: false, message: 'A salary already exists for this effective date' },
          { status: 409 },
        ),
      ),
    )

    renderWithProviders(<SalaryForm employeeId={employeeId} existingDates={[]} />)
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '120000' } })
    fireEvent.change(screen.getByLabelText('Effective date'), { target: { value: '2026-04-01' } })
    await user.click(screen.getByRole('button', { name: 'Record salary' }))

    expect(await screen.findByText('A salary already exists for this effective date')).toBeInTheDocument()
  })
})
