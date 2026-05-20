import { useMemo } from 'react'

import AppFrame from '../components/AppFrame'
import { useFlights } from '../lib/useFlights'

function buildAirports(flights) {
  const map = new Map()
  for (const f of flights) {
    for (const a of [f.from, f.to]) {
      if (!a?.iata) continue
      const key = a.iata
      const prev = map.get(key) || { ...a, departures: 0, arrivals: 0, total: 0 }
      map.set(key, prev)
    }

    if (f.from?.iata) {
      const item = map.get(f.from.iata)
      item.departures += 1
      item.total += 1
    }
    if (f.to?.iata) {
      const item = map.get(f.to.iata)
      item.arrivals += 1
      item.total += 1
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}

export default function AirportsPage() {
  const { flights, loading } = useFlights({ pollMs: 8000 })
  const airports = useMemo(() => buildAirports(flights), [flights])

  return (
    <AppFrame flights={flights}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Airports</div>
          <div className="text-xs text-white/55">Derived from the current demo flights</div>
        </div>
        <div className="text-xs text-white/55">{loading ? 'Loading…' : `${airports.length} airports`}</div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stroke bg-panel">
        <div className="min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 divide-y divide-white/5">
            {airports.map((a) => (
              <div key={a.iata} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">{a.iata}</div>
                  <div className="text-xs text-white/55">{a.city || a.name || '—'}</div>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/70">
                  <div>
                    <div className="text-white/55">Departures</div>
                    <div className="font-semibold text-white/85">{a.departures}</div>
                  </div>
                  <div>
                    <div className="text-white/55">Arrivals</div>
                    <div className="font-semibold text-white/85">{a.arrivals}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppFrame>
  )
}
