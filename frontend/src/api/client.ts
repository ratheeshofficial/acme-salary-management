import { APP_BASE_URL, resolveApiUrl } from '../config/env.ts'
import { useAuthStore } from '../store/authStore.ts'

export { APP_BASE_URL, resolveApiUrl }

export type ApiBody<T> = {
  success: boolean
  message?: string
  data?: T
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = useAuthStore.getState().token
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = resolveApiUrl(path)
  const response = await fetch(url, { ...options, headers })
  const body = (await response.json().catch(() => ({}))) as ApiBody<T>
  const isLogin = path.includes('/api/auth/login')

  if (response.status === 401 && !isLogin) {
    useAuthStore.getState().clearSession()
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(response.status, body.message || 'Request failed')
  }

  return body.data as T
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) => api<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    api<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    }),
  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    api<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    }),
  delete: <T>(path: string, options?: RequestInit) => api<T>(path, { ...options, method: 'DELETE' }),
}
