import { useAuthStore } from '../store/authStore.ts'

type ApiBody<T> = {
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

  const response = await fetch(path, { ...options, headers })
  const body = (await response.json().catch(() => ({}))) as ApiBody<T>
  const isLogin = path.startsWith('/api/auth/login')

  if (response.status === 401 && !isLogin) {
    useAuthStore.getState().clearSession()
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(response.status, body.message || 'Request failed')
  }

  return body.data as T
}
