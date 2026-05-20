function classifyRegion(lat, lng) {
  // Very simple demo classifier for the dashboard donut.
  if (lat > 10 && lng > 60) return 'Asia Pacific'
  if (lat > 35 && lng > -20 && lng < 60) return 'Europe'
  if (lat > 10 && lng < -20) return 'North America'
  if (lat < 10 && lng > -20 && lng < 60) return 'Middle East / Africa'
  return 'Others'
}

function Donut({ values }) {
  const total = Object.values(values).reduce((a, b) => a + b, 0) || 1
  const segments = [
    { key: 'Asia Pacific', color: '#22d3ee' },
    { key: 'Europe', color: '#a855f7' },
    { key: 'North America', color: '#60a5fa' },
    { key: 'Middle East / Africa', color: '#34d399' },
    { key: 'Others', color: '#94a3b8' },
  ]

  let start = 0
  const stops = segments.map((s) => {
    const v = values[s.key] ?? 0
    const pct = (v / total) * 100
    const entry = { ...s, from: start, to: start + pct, value: v, pct }
    start += pct
    return entry
  })

  const background = `conic-gradient(${stops
    .filter((x) => x.pct > 0)
    .map((x) => `${x.color} ${x.from.toFixed(2)}% ${x.to.toFixed(2)}%`)
    .join(', ')})`

  return (
    <div className="relative h-36 w-36">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background, boxShadow: '0 0 24px rgba(34,211,238,0.15)' }}
      />
      <div className="absolute inset-[14px] rounded-full border border-white/10 bg-[#0B0F19]/70" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-xl font-semibold">{total.toLocaleString()}</div>
          <div className="text-xs text-white/55">Total</div>
        </div>
      </div>
    </div>
  )
}

export default function TrafficByRegionWidget({ flights }) {
  const values = flights.reduce((acc, f) => {
    const region = classifyRegion(f.position?.lat ?? 0, f.position?.lng ?? 0)
    acc[region] = (acc[region] || 0) + 1
    return acc
  }, {})

  const order = ['Asia Pacific', 'Europe', 'North America', 'Middle East / Africa', 'Others']

  return (
    <div className="rounded-2xl border border-stroke bg-panel p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Traffic by Region</div>
        <button type="button" className="text-xs text-white/55 hover:text-white/75">
          View all
        </button>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <Donut values={values} />

        <div className="min-w-0 flex-1 space-y-2">
          {order.map((k) => {
            const v = values[k] || 0
            const total = flights.length || 1
            const pct = Math.round((v / total) * 100)
            return (
              <div key={k} className="flex items-center justify-between gap-3 text-xs">
                <div className="truncate text-white/70">{k}</div>
                <div className="text-white/55">{pct}%</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
