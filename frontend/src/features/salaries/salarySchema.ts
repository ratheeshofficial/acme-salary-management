import { z } from 'zod'

import type { SalaryInput } from '../../types/api.ts'

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'] as const

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function createSalarySchema(existingDates: string[]) {
  return z
    .object({
      amount: z.union([z.string(), z.number()]),
      currency: z.string(),
      effectiveFrom: z.string(),
    })
    .superRefine((value, ctx) => {
      const amount = typeof value.amount === 'number' ? value.amount : Number(value.amount)
      if (value.amount === '' || !Number.isFinite(amount) || amount <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Amount must be greater than zero',
          path: ['amount'],
        })
      }

      if (!CURRENCIES.includes(value.currency as (typeof CURRENCIES)[number])) {
        ctx.addIssue({
          code: 'custom',
          message: `Currency must be one of ${CURRENCIES.join(', ')}`,
          path: ['currency'],
        })
      }

      const dateIsValid =
        DATE_PATTERN.test(value.effectiveFrom) &&
        !Number.isNaN(Date.parse(`${value.effectiveFrom}T00:00:00`))
      if (!dateIsValid) {
        ctx.addIssue({
          code: 'custom',
          message: 'effectiveFrom must be a date in YYYY-MM-DD format',
          path: ['effectiveFrom'],
        })
        return
      }

      if (existingDates.includes(value.effectiveFrom)) {
        ctx.addIssue({
          code: 'custom',
          message: 'A salary already exists for this effective date',
          path: ['effectiveFrom'],
        })
      }
    })
    .transform((value): SalaryInput => {
      return {
        amount: typeof value.amount === 'number' ? value.amount : Number(value.amount),
        currency: value.currency,
        effectiveFrom: value.effectiveFrom,
      }
    })
}

export const salarySchema = createSalarySchema([])
