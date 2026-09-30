/**
 * Application environment configuration
 */

export const APP_BASE_URL: string = (
  import.meta.env.APP_BASE_URL ||
  import.meta.env.VITE_APP_BASE_URL ||
  ''
).trim().replace(/\/+$/, '')

/**
 * Resolves an API path (e.g. `/api/employees`) against APP_BASE_URL.
 * If APP_BASE_URL is not set, returns the original relative path (which uses the Vite proxy).
 */
export function resolveApiUrl(path: string): string {
  if (!APP_BASE_URL) {
    return path
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`

  // Prevent duplicate `/api` if APP_BASE_URL already includes `/api`
  if (APP_BASE_URL.endsWith('/api') && cleanPath.startsWith('/api')) {
    return `${APP_BASE_URL}${cleanPath.slice(4)}`
  }

  return `${APP_BASE_URL}${cleanPath}`
}
