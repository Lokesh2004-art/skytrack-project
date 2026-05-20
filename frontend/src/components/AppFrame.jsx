import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { isAuthed } from '../lib/auth'
import { useWatchlist } from '../lib/useWatchlist'
import { useFlightAlerts } from '../lib/useFlightAlerts'
import ToastStack from './ToastStack'
import { initAlertSound } from '../lib/alertSound'

function navKeyFromPath(pathname) {
  if (pathname.startsWith('/live-map')) return 'live-map'
  if (pathname.startsWith('/flights')) return 'flights'
  if (pathname.startsWith('/airports')) return 'airports'
  if (pathname.startsWith('/alerts')) return 'alerts'
  if (pathname.startsWith('/settings')) return 'settings'
  return 'dashboard'
}

function pathFromNavKey(key) {
  switch (key) {
    case 'dashboard':
      return '/'
    case 'live-map':
      return '/live-map'
    case 'flights':
      return '/flights'
    case 'airports':
      return '/airports'
    case 'alerts':
      return '/alerts'
    case 'settings':
      return '/settings'
    default:
      return '/'
  }
}

export default function AppFrame({ flights = [], onSelectFlight, children }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const { watchIds } = useWatchlist()
  const { toasts, dismiss } = useFlightAlerts({ flights, watchIds })

  useEffect(() => {
    initAlertSound()
  }, [])

  const activeKey = useMemo(() => navKeyFromPath(pathname), [pathname])

  const handleNavigate = useCallback(
    (key) => {
      navigate(pathFromNavKey(key))
    },
    [navigate]
  )

  const handleProfileClick = useCallback(() => {
    navigate(isAuthed() ? '/settings' : '/login')
  }, [navigate])

  return (
    <div className="h-full w-full bg-ink text-white">
      <div className="flex h-full">
        <Sidebar activeKey={activeKey} onNavigate={handleNavigate} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Topbar flights={flights} onSelectFlight={onSelectFlight} onProfileClick={handleProfileClick} />

          <main className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4">
            <ToastStack toasts={toasts} onDismiss={dismiss} />
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
