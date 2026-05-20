import { Navigate, Route, Routes } from 'react-router-dom'

import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import LiveMapPage from './pages/LiveMapPage'
import FlightsPage from './pages/FlightsPage'
import AirportsPage from './pages/AirportsPage'
import AlertsPage from './pages/AlertsPage'
import SettingsPage from './pages/SettingsPage'
import { isAuthed } from './lib/auth'

function RequireAuth({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/live-map"
        element={
          <RequireAuth>
            <LiveMapPage />
          </RequireAuth>
        }
      />
      <Route
        path="/flights"
        element={
          <RequireAuth>
            <FlightsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/airports"
        element={
          <RequireAuth>
            <AirportsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/alerts"
        element={
          <RequireAuth>
            <AlertsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
