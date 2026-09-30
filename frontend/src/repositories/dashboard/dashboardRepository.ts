import { api } from '../../api/client.ts'
import { API_ENDPOINTS } from '../../api/endpoints.ts'
import type { Dashboard } from '../../types/api.ts'

export function getDashboard(): Promise<Dashboard> {
  return api<Dashboard>(API_ENDPOINTS.dashboard.get)
}

export const dashboardRepository = {
  get: getDashboard,
  getDashboard,
}
