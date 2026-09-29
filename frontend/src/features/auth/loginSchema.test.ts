import { describe, expect, it } from 'vitest'

import { loginSchema } from './loginSchema.ts'

describe('loginSchema', () => {
  it('requires email and password', () => {
    const result = loginSchema.safeParse({ email: '  ', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining(['Email is required', 'Password is required']),
      )
    }
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'Enter a valid email')).toBe(true)
    }
  })

  it('accepts the seeded HR account', () => {
    const result = loginSchema.safeParse({ email: ' hr@acme.com ', password: 'Password123' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('hr@acme.com')
    }
  })
})
