import { create } from 'zustand'

import type { SessionUser } from '../types/api.ts'

const STORAGE_KEY = 'acme.salary.session'

type AuthState = {
  token: string | null
  user: SessionUser | null
  setSession: (token: string, user: SessionUser) => void
  clearSession: () => void
}

function readSession(): Pick<AuthState, 'token' | 'user'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { token: null, user: null }
    }
    const parsed = JSON.parse(raw) as { token?: string; user?: SessionUser }
    if (!parsed.token || !parsed.user?.email) {
      return { token: null, user: null }
    }
    return { token: parsed.token, user: parsed.user }
  } catch {
    return { token: null, user: null }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...readSession(),
  setSession: (token, user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
    set({ token, user })
  },
  clearSession: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ token: null, user: null })
  },
}))
