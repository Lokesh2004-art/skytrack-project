import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'

import AppFrame from '../components/AppFrame'
import FlightMap from '../features/flights/FlightMap'
import FlightDetailsPanel from '../features/flights/FlightDetailsPanel'
import { useFlights } from '../lib/useFlights'

export default function LiveMapPage() {
  const { flights } = useFlights({ pollMs: 8000 })
  const [selectedFlightId, setSelectedFlightId] = useState(null)
  const [flightTypeFilter, setFlightTypeFilter] = useState('all')
  const [showRoutes, setShowRoutes] = useState(true)
  const [mapOptionsOpen, setMapOptionsOpen] = useState(false)

  const selectedFlight = useMemo(
    () => flights.find((f) => f.id === selectedFlightId) || null,
    [flights, selectedFlightId]
  )

  const filteredFlights = useMemo(() => {
    if (flightTypeFilter === 'all') return flights
    return flights.filter((f) => (f.type || 'commercial') === flightTypeFilter)
  }, [flights, flightTypeFilter])

  const mapFlights = useMemo(() => {
    if (selectedFlight) return [selectedFlight]
    return filteredFlights
  }, [filteredFlights, selectedFlight])

  return (
    <AppFrame flights={flights} onSelectFlight={setSelectedFlightId}>
      <div className="relative min-h-[680px] overflow-hidden rounded-2xl border border-stroke bg-panel">
        <FlightMap
          flights={mapFlights}
          selectedFlightId={selectedFlightId}
          onSelectFlight={setSelectedFlightId}
          showRoutes={showRoutes}
        />

        <div className="pointer-events-none absolute left-4 top-4 z-[900] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMapOptionsOpen((v) => !v)}
            className="pointer-events-auto rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/75 backdrop-blur hover:bg-black/35"
          >
            Map Options
          </button>

          {mapOptionsOpen ? (
            <div className="pointer-events-auto rounded-2xl border border-white/10 bg-[#0B0F19]/85 p-2 text-xs text-white/75 shadow-glow backdrop-blur">
              <button
                type="button"
                onClick={() => setShowRoutes((s) => !s)}
                className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2 hover:bg-white/5"
              >
                <span>Routes</span>
                <span className={showRoutes ? 'text-emerald-200' : 'text-white/55'}>
                  {showRoutes ? 'On' : 'Off'}
                </span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="pointer-events-none absolute bottom-4 left-1/2 z-[900] -translate-x-1/2">
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 p-1 text-xs backdrop-blur">
            {[
              { key: 'all', label: 'All Flights' },
              { key: 'commercial', label: 'Commercial' },
              { key: 'cargo', label: 'Cargo' },
              { key: 'private', label: 'Private' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFlightTypeFilter(opt.key)}
                className={
                  flightTypeFilter === opt.key
                    ? 'rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white'
                    : 'rounded-xl border border-transparent px-3 py-2 text-white/70 hover:border-white/10 hover:bg-white/5'
                }
              >
                {opt.label}
              </button>
            ))}
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
      </div>
    </AppFrame>
  )
}
