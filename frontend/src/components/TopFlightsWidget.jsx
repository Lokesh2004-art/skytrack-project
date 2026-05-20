import { motion } from 'framer-motion'

function StatusPill({ status }) {
  const cls =
    status === 'delayed'
      ? 'border-orange-400/20 bg-orange-500/10 text-orange-200'
      : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'

  return <span className={`rounded-xl border px-2 py-1 text-[11px] ${cls}`}>{status === 'delayed' ? 'Delayed' : 'On Time'}</span>
}

export default function TopFlightsWidget({ flights, onSelectFlight }) {
  const top = [...flights]
    .sort((a, b) => (b.distanceKm ?? 0) - (a.distanceKm ?? 0))
    .slice(0, 5)

  return (
    <div className="rounded-2xl border border-stroke bg-panel p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Top Flights</div>
        <button type="button" className="text-xs text-white/55 hover:text-white/75">
          View all
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {top.map((f, idx) => (
          <motion.button
            key={f.id}
            type="button"
            whileHover={{ x: 3 }}
            onClick={() => onSelectFlight(f.id)}
            className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-left hover:border-white/10 hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 text-xs text-white/45">{idx + 1}</div>
              <div>
                <div className="text-sm font-semibold">{f.flightNumber}</div>
                <div className="text-xs text-white/55">
                  {f.from.iata} → {f.to.iata}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={f.status} />
              <div className="text-xs text-white/55">{Math.round(f.speedKts)} kts</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
