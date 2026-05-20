import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'

import AppFrame from '../components/AppFrame'
import FlightDetailsPanel from '../features/flights/FlightDetailsPanel'
import { useFlights } from '../lib/useFlights'

function isCriticalFlight(f) {
  if (!f) return false
  if (f.critical === true) return true

  const status = f.status
  const alt = typeof f.altitudeFt === 'number' ? f.altitudeFt : null
  const spd = typeof f.speedKts === 'number' ? f.speedKts : null

  if (status === 'landed') return false
  if (alt == null || spd == null) return false

  // Heuristic fallback when backend doesn't mark it:
  // low altitude + relatively low speed while not landed.
  return alt < 2500 && spd < 220
}

function criticalReason(f) {
  if (f?.criticalReason) return String(f.criticalReason)
  return 'Critical flight condition detected'
}

export default function AlertsPage() {
  const { flights, loading } = useFlights({ pollMs: 8000 })
  const [selectedFlightId, setSelectedFlightId] = useState(null)

  const criticalFlights = useMemo(() => {
    return (flights || []).filter(isCriticalFlight)
  }, [flights])

  const selectedFlight = useMemo(
    () => flights.find((f) => f.id === selectedFlightId) || null,
    [flights, selectedFlightId]
  )

  return (
    <AppFrame flights={flights} onSelectFlight={setSelectedFlightId}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Alerts</div>
          <div className="text-xs text-white/55">Critical conditions and safety warnings</div>
        </div>
        <div className="text-xs text-white/55">
          {loading ? 'Loading…' : `${criticalFlights.length} critical`}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stroke bg-panel">
        <div className="border-b border-white/10 px-4 py-3">
          <div className="text-sm font-semibold">Critical Alerts</div>
          <div className="mt-1 text-xs text-white/55">Tap an alert to open full flight details</div>
        </div>

        <div className="min-h-0 overflow-y-auto">
          {criticalFlights.length ? (
            <div className="grid grid-cols-1 divide-y divide-white/5">
              {criticalFlights.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFlightId(f.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">{f.flightNumber}</div>
                      <div className="rounded-full border border-orange-200/25 bg-orange-500/10 px-2 py-0.5 text-[11px] text-orange-100">
                        Critical
                      </div>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-white/60">{criticalReason(f)}</div>
                    <div className="mt-1 text-xs text-white/55">
                      {f.from.iata} → {f.to.iata} · {f.airline}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xs text-white/70">
                      {typeof f.speedKts === 'number' ? `${Math.round(f.speedKts)} kts` : '—'}
                    </div>
                    <div className="text-xs text-white/55">
                      {typeof f.altitudeFt === 'number' ? `${Math.round(f.altitudeFt).toLocaleString()} ft` : '—'}
                    </div>
                    <div className="mt-1 text-[11px] text-white/50">
                      Updated {typeof f.updatedSecondsAgo === 'number' ? `${f.updatedSecondsAgo}s` : '—'} ago
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-5 text-sm text-white/70">
              No critical alerts right now.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedFlight ? (
          <FlightDetailsPanel
            key={selectedFlight.id}
            flight={selectedFlight}
            onClose={() => setSelectedFlightId(null)}
          />
        ) : null}
      </AnimatePresence>
    </AppFrame>
  )
}
