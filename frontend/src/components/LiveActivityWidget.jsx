import { motion } from 'framer-motion'

function fmtAgo(seconds) {
  if (seconds < 60) return `${seconds}s ago`
  const m = Math.floor(seconds / 60)
  return `${m}m ago`
}

export default function LiveActivityWidget({ flights, onSelectFlight }) {
  const items = [...flights]
    .sort((a, b) => (a.updatedSecondsAgo ?? 9999) - (b.updatedSecondsAgo ?? 9999))
    .slice(0, 5)

  return (
    <div className="rounded-2xl border border-stroke bg-panel p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Live Activity</div>
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200">
          Live
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {items.map((f) => (
          <motion.button
            key={f.id}
            type="button"
            whileHover={{ x: 3 }}
            onClick={() => onSelectFlight(f.id)}
            className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-left hover:border-white/10 hover:bg-white/10"
          >
            <div>
              <div className="text-sm font-semibold">
                {f.flightNumber} · {f.from.iata} → {f.to.iata}
              </div>
              <div className="mt-0.5 text-xs text-white/55">
                {f.status === 'delayed' ? 'Delayed' : 'En Route'} · {Math.round(f.altitudeFt).toLocaleString()} ft
              </div>
            </div>
            <div className="text-xs text-white/55">{fmtAgo(f.updatedSecondsAgo ?? 120)}</div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
