import { api } from '../../api/client.ts'
import { API_ENDPOINTS } from '../../api/endpoints.ts'
import type { LoginInput } from '../../features/auth/loginSchema.ts'
import type { LoginResult } from '../../types/api.ts'

export function login(credentials: LoginInput): Promise<LoginResult> {
  return api<LoginResult>(API_ENDPOINTS.auth.login, {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function logout(): Promise<void> {
  return api<void>(API_ENDPOINTS.auth.logout, {
    method: 'POST',
  })
}

export const authRepository = {
  login,
  logout,
}
