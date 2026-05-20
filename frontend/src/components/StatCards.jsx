import { motion } from 'framer-motion'

function StatCard({ title, value, sub, tone = 'cyan' }) {
  const toneClass =
    tone === 'purple'
      ? 'from-glowPurple/30 to-glowCyan/10 shadow-glow2'
      : 'from-glowCyan/30 to-glowPurple/10 shadow-glow'

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      className={`rounded-2xl border border-stroke bg-gradient-to-br ${toneClass} p-4`}
    >
      <div className="text-xs text-white/60">{title}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-white/55">{sub}</div>
    </motion.div>
  )
}

export default function StatCards({ flights }) {
  const live = flights.length
  const delayedFlights = flights.filter((f) => f.status === 'delayed')
  const delays = delayedFlights.length

  const onTimePct = live ? Math.round(((live - delays) / live) * 100) : 0
  const avgDelay = delays
    ? Math.round(
        delayedFlights.reduce((acc, f) => acc + (typeof f.delayMinutes === 'number' ? f.delayMinutes : 0), 0) /
          delays
      )
    : 0

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Live Flights" value={live.toLocaleString()} sub="Active now" tone="cyan" />
      <StatCard title="Delays" value={delays.toLocaleString()} sub="Flagged flights" tone="purple" />
      <StatCard title="On-Time Rate" value={`${onTimePct}%`} sub="Across live flights" tone="cyan" />
      <StatCard title="Avg Delay" value={`${avgDelay}m`} sub="Delayed flights only" tone="purple" />
    </section>
  )
}
