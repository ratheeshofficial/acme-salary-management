import { describe, expect, it } from 'vitest'

import { createSalarySchema, salarySchema } from './salarySchema.ts'

describe('salarySchema', () => {
  it('rejects a non-positive amount, an unknown currency, and a bad date', () => {
    const result = salarySchema.safeParse({
      amount: 0,
      currency: 'JPY',
      effectiveFrom: '04/01/2026',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message)
      expect(messages).toContain('Amount must be greater than zero')
      expect(messages).toContain('Currency must be one of USD, EUR, GBP, INR')
      expect(messages).toContain('effectiveFrom must be a date in YYYY-MM-DD format')
    }
  })

  it('rejects an amount that is not a number', () => {
    const result = salarySchema.safeParse({
      amount: 'abc',
      currency: 'INR',
      effectiveFrom: '2026-04-01',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a calendar date that does not exist', () => {
    const result = salarySchema.safeParse({
      amount: 120000,
      currency: 'INR',
      effectiveFrom: '2026-13-01',
    })
    expect(result.success).toBe(false)
  })

  it('parses a valid salary', () => {
    const result = salarySchema.safeParse({
      amount: '120000',
      currency: 'INR',
      effectiveFrom: '2026-04-01',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        amount: 120000,
        currency: 'INR',
        effectiveFrom: '2026-04-01',
      })
    }
  })

  it('blocks an effective date that is already in history', () => {
    const result = createSalarySchema(['2026-01-01']).safeParse({
      amount: 90000,
      currency: 'USD',
      effectiveFrom: '2026-01-01',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('A salary already exists for this effective date')
    }
  })
})
