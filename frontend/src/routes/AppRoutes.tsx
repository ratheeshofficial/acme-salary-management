import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { AppShell } from '../components/AppShell.tsx'
import { LoginPage } from '../features/auth/LoginPage.tsx'
import { DashboardPage } from '../features/dashboard/DashboardPage.tsx'
import { EmployeeDetailPage } from '../features/employees/EmployeeDetailPage.tsx'
import { EmployeeListPage } from '../features/employees/EmployeeListPage.tsx'
import { useAuthStore } from '../store/authStore.ts'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="employees" element={<EmployeeListPage />} />
          <Route path="employees/:id" element={<EmployeeDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

function GuestRoute() {
  const token = useAuthStore((state) => state.token)
  if (token) {
    return <Navigate to="/" replace />
  }
  return <LoginPage />
}
