import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'

import AppFrame from '../components/AppFrame'
import FlightDetailsPanel from '../features/flights/FlightDetailsPanel'
import { useFlights } from '../lib/useFlights'
import { useWatchlist } from '../lib/useWatchlist'

function StarIcon({ filled }) {
  return filled ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2Z" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function FlightsPage() {
  const { flights, loading } = useFlights({ pollMs: 8000 })
  const [selectedFlightId, setSelectedFlightId] = useState(null)
  const { isWatched, toggleWatch } = useWatchlist()
  const [fromCountry, setFromCountry] = useState('')
  const [toCountry, setToCountry] = useState('')

  const selectedFlight = useMemo(
    () => flights.find((f) => f.id === selectedFlightId) || null,
    [flights, selectedFlightId]
  )

  const countryOptions = useMemo(() => {
    const set = new Set()
    for (const f of flights || []) {
      const a = f?.from?.country
      const b = f?.to?.country
      if (typeof a === 'string' && a.trim()) set.add(a.trim())
      if (typeof b === 'string' && b.trim()) set.add(b.trim())
    }
    return Array.from(set).sort((x, y) => x.localeCompare(y))
  }, [flights])

  const filteredFlights = useMemo(() => {
    const fromQ = fromCountry.trim().toLowerCase()
    const toQ = toCountry.trim().toLowerCase()

    return (flights || []).filter((f) => {
      const a = String(f?.from?.country || '').trim().toLowerCase()
      const b = String(f?.to?.country || '').trim().toLowerCase()
      if (fromQ && a !== fromQ) return false
      if (toQ && b !== toQ) return false
      return true
    })
  }, [flights, fromCountry, toCountry])

  return (
    <AppFrame flights={flights} onSelectFlight={setSelectedFlightId}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Flights</div>
          <div className="text-xs text-white/55">Browse live flights from the demo feed</div>
        </div>
        <div className="text-xs text-white/55">
          {loading ? 'Loading…' : `${filteredFlights.length} flights`}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-stroke bg-panel p-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="text-xs text-white/60">From Country</div>
          <input
            value={fromCountry}
            onChange={(e) => setFromCountry(e.target.value)}
            list="skytrack-country-options"
            placeholder="e.g., India"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20 focus:bg-white/10"
          />
        </div>
        <div className="md:col-span-1">
          <div className="text-xs text-white/60">To Country</div>
          <input
            value={toCountry}
            onChange={(e) => setToCountry(e.target.value)}
            list="skytrack-country-options"
            placeholder="e.g., United States"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20 focus:bg-white/10"
          />
        </div>
        <div className="flex items-end md:col-span-1">
          <button
            type="button"
            onClick={() => {
              setFromCountry('')
              setToCountry('')
            }}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10"
          >
            Clear Filter
          </button>
        </div>

        <datalist id="skytrack-country-options">
          {countryOptions.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stroke bg-panel">
        <div className="min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 divide-y divide-white/5">
            {filteredFlights.map((f) => (
            <div
              key={f.id}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 hover:bg-white/5"
            >
              <button
                type="button"
                onClick={() => setSelectedFlightId(f.id)}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">{f.flightNumber}</div>
                    {f.status === 'delayed' ? (
                      <div className="rounded-full border border-orange-200/25 bg-orange-500/10 px-2 py-0.5 text-[11px] text-orange-100">
                        +{typeof f.delayMinutes === 'number' ? f.delayMinutes : 0}m
                      </div>
                    ) : f.status === 'landed' ? (
                      <div className="rounded-full border border-emerald-200/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-100">
                        Landed
                      </div>
                    ) : null}
                  </div>
                  <div className="truncate text-xs text-white/55">
                    {f.from.iata} ({f.from.country || '—'}) → {f.to.iata} ({f.to.country || '—'}) · {f.airline}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/70">{Math.round(f.speedKts)} kts</div>
                  <div className="text-xs text-white/55">{Math.round(f.altitudeFt).toLocaleString()} ft</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleWatch(f.id)}
                className={
                  isWatched(f.id)
                    ? 'rounded-2xl border border-white/10 bg-white/10 p-2 text-glowCyan hover:bg-white/15'
                    : 'rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10'
                }
                aria-pressed={isWatched(f.id)}
                aria-label={isWatched(f.id) ? 'Remove from watchlist' : 'Add to watchlist'}
                title={isWatched(f.id) ? 'Watching' : 'Watch'}
              >
                <StarIcon filled={isWatched(f.id)} />
              </button>
            </div>
            ))}
          </div>
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
