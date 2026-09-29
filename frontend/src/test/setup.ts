import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { useAuthStore } from '../store/authStore.ts'
import { server } from './server.ts'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
  useAuthStore.setState({ token: null, user: null })
})

afterAll(() => server.close())
