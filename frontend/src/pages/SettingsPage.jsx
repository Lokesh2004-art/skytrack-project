import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import AppFrame from '../components/AppFrame'
import { getUser, logout } from '../lib/auth'
import { useFlights } from '../lib/useFlights'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { flights } = useFlights({ pollMs: 8000 })
  const user = useMemo(() => getUser(), [])

  return (
    <AppFrame flights={flights}>
      <div className="text-lg font-semibold">Settings</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-stroke bg-panel p-5">
          <div className="text-sm font-semibold">Account</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-glowPurple/30 to-glowCyan/30 text-sm font-semibold text-white/85 shadow-glow">
              {(user?.name || user?.email || 'U').trim().slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-sm text-white/70">Signed in as</div>
              <div className="mt-0.5 text-sm font-semibold">{user?.email || '—'}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Log out
          </button>
        </div>

        <div className="rounded-2xl border border-stroke bg-panel p-5">
          <div className="text-sm font-semibold">About</div>
          <div className="mt-2 text-sm text-white/70">
            Demo project: React + Leaflet + Flask API.
          </div>
        </div>
      </div>
    </AppFrame>
  )
}
