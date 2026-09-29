import { api } from '../../services/api.ts'
import type { Dashboard } from '../../types/api.ts'

export function getDashboard() {
  return api<Dashboard>('/api/dashboard')
}
