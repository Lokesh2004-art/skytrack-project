import { motion } from 'framer-motion'

const items = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'live-map', label: 'Live Map' },
  { key: 'flights', label: 'Flights' },
  { key: 'airports', label: 'Airports' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'settings', label: 'Settings' },
]

export default function Sidebar({ activeKey = 'dashboard', onNavigate }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-stroke bg-black/20 p-4 backdrop-blur">
      <div className="flex items-center gap-3 rounded-2xl border border-stroke bg-panel px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-glowCyan/30 to-glowPurple/30 shadow-glow">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-white/85"
          >
            <path
              d="M3 12h5l6-9 2 1-3 8h5l2-2 2 1-2 3 2 3-2 1-2-2h-5l3 8-2 1-6-9H3v-4Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">SkyTrack</div>
          <div className="text-xs text-white/55">Live Flight Tracker</div>
        </div>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-2">
        {items.map((item) => (
          <motion.button
            key={item.key}
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={
              item.key === activeKey
                ? 'rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm'
                : 'rounded-xl border border-transparent px-4 py-3 text-left text-sm text-white/70 hover:border-white/10 hover:bg-white/5'
            }
            type="button"
            onClick={() => onNavigate?.(item.key)}
          >
            {item.label}
          </motion.button>
        ))}
      </nav>
    </aside>
  )
}
