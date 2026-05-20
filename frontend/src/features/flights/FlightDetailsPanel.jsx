import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { weatherApi } from '../../lib/api'
import flightBg from '../../assets/flight-bg.svg'

function pct(n) {
  const v = Math.max(0, Math.min(1, n ?? 0))
  return Math.round(v * 100)
}

function statusLabel(status) {
  switch (status) {
    case 'delayed':
      return 'Delayed'
    case 'landed':
      return 'Landed'
    case 'enroute':
    default:
      return 'En Route'
  }
}

function fmt(n, digits = 0) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—'
  return digits ? n.toFixed(digits) : Math.round(n).toLocaleString()
}

function fmtTime(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function titleCase(s) {
  if (!s) return '—'
  return String(s)
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function AirplaneGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M3 12h5l6-9 2 1-3 8h5l2-2 2 1-2 3 2 3-2 1-2-2h-5l3 8-2 1-6-9H3v-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function FlightDetailsPanel({ flight, onClose }) {
  const pos = flight?.position
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)

  const lat = typeof pos?.lat === 'number' ? pos.lat : null
  const lng = typeof pos?.lng === 'number' ? pos.lng : null

  const delayMinutes = typeof flight?.delayMinutes === 'number' ? flight.delayMinutes : 0

  useEffect(() => {
    let cancelled = false

    async function loadWeather() {
      if (lat == null || lng == null) {
        setWeather(null)
        return
      }

      try {
        setWeatherLoading(true)
        const data = await weatherApi.current({ lat, lng })
        if (!cancelled) setWeather(data)
      } catch {
        if (!cancelled) setWeather(null)
      } finally {
        if (!cancelled) setWeatherLoading(false)
      }
    }

    loadWeather()
    return () => {
      cancelled = true
    }
  }, [lat, lng])

  const statusChip = useMemo(() => {
    if (flight.status === 'delayed') {
      return `Delayed${delayMinutes ? ` (+${delayMinutes}m)` : ''}`
    }
    return statusLabel(flight.status)
  }, [flight.status, delayMinutes])

  const timing = useMemo(() => {
    const nowMs = Date.now()
    const pRaw = flight?.progress
    const p = typeof pRaw === 'number' && Number.isFinite(pRaw) ? Math.max(0, Math.min(1, pRaw)) : null

    if (flight?.status === 'landed') {
      return {
        remainingMinutes: 0,
        startAt: null,
        arriveAt: new Date(nowMs),
      }
    }

    let remainingMinutes = null

    const distanceKm = typeof flight?.distanceKm === 'number' && Number.isFinite(flight.distanceKm) ? flight.distanceKm : null
    const speedKts = typeof flight?.speedKts === 'number' && Number.isFinite(flight.speedKts) ? flight.speedKts : null
    const speedKph = speedKts != null ? speedKts * 1.852 : null

    if (p != null && distanceKm != null && speedKph != null && speedKph > 30) {
      const remainingKm = Math.max(0, (1 - p) * distanceKm)
      const hours = remainingKm / speedKph
      if (Number.isFinite(hours)) remainingMinutes = Math.max(0, hours * 60)
    }

    // Fallback: dummy feed uses ~420 minutes as a consistent route duration.
    if (remainingMinutes == null && p != null) {
      remainingMinutes = Math.max(0, (1 - p) * 420)
    }

    if (remainingMinutes == null || !Number.isFinite(remainingMinutes)) {
      return { remainingMinutes: null, startAt: null, arriveAt: null }
    }

    remainingMinutes = Math.max(0, Math.round(remainingMinutes))
    const arriveAt = new Date(nowMs + remainingMinutes * 60_000)

    let startAt = null
    if (p != null && p > 0.001 && p < 0.999) {
      const totalMinutes = remainingMinutes / (1 - p)
      if (Number.isFinite(totalMinutes) && totalMinutes > 1) {
        const elapsedMinutes = totalMinutes * p
        startAt = new Date(nowMs - elapsedMinutes * 60_000)
      }
    }

    return { remainingMinutes, startAt, arriveAt }
  }, [flight?.distanceKm, flight?.progress, flight?.speedKts, flight?.status])

  return (
    <motion.aside
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="absolute bottom-4 right-4 top-4 z-[1000] flex w-[360px] flex-col overflow-hidden rounded-2xl border border-stroke bg-[#0B0F19]/80 shadow-glow backdrop-blur"
    >
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div>
          <div className="text-xs text-white/60">Flight Details</div>
          <div className="mt-1 text-lg font-semibold tracking-tight">{flight.flightNumber}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75 hover:bg-white/10"
        >
          Close
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="rounded-2xl border border-stroke bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/60">3D Preview</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75">
              {statusChip}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { key: 'front', label: 'Front', style: { transform: 'perspective(900px) rotateX(18deg) rotateY(-18deg)' } },
              { key: 'side', label: 'Side', style: { transform: 'perspective(900px) rotateX(12deg) rotateY(22deg)' } },
              { key: 'top', label: 'Top', style: { transform: 'perspective(900px) rotateX(36deg) rotateY(0deg)' } },
            ].map((v) => (
              <div
                key={v.key}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-2"
              >
                <img
                  src={flightBg}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-35"
                  draggable={false}
                />
                <div className="relative flex h-16 items-center justify-center text-white/85">
                  <div style={v.style} className="will-change-transform">
                    <AirplaneGlyph className="h-8 w-8" />
                  </div>
                </div>
                <div className="relative mt-1 text-center text-[10px] text-white/55">{v.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-white/60">Route</div>
            <div className="mt-1 text-sm font-semibold">
              {flight?.from?.iata || '—'} → {flight?.to?.iata || '—'}
            </div>
            <div className="mt-1 text-xs text-white/55">
              {flight?.from?.city || '—'} · {flight?.to?.city || '—'}
            </div>
            {(flight?.from?.country || flight?.to?.country) && (
              <div className="mt-1 text-[11px] text-white/45">
                {flight?.from?.country || '—'} → {flight?.to?.country || '—'}
              </div>
            )}
            <div className="mt-2 text-[11px] text-white/50">
              {flight?.airline || '—'} · {flight?.aircraft || '—'}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-stroke bg-white/5 p-3">
            <div className="text-xs text-white/55">Speed</div>
            <div className="mt-1 text-base font-semibold">{fmt(flight.speedKts)} kts</div>
          </div>
          <div className="rounded-2xl border border-stroke bg-white/5 p-3">
            <div className="text-xs text-white/55">Altitude</div>
            <div className="mt-1 text-base font-semibold">{fmt(flight.altitudeFt)} ft</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-stroke bg-white/5 p-3">
            <div className="text-xs text-white/55">Position</div>
            <div className="mt-1 text-sm font-semibold">
              {lat == null || lng == null ? '—' : `${lat.toFixed(2)}, ${lng.toFixed(2)}`}
            </div>
            <div className="mt-1 text-[11px] text-white/50">
              Updated {typeof flight.updatedSecondsAgo === 'number' ? `${flight.updatedSecondsAgo}s` : '—'} ago
            </div>
          </div>
          <div className="rounded-2xl border border-stroke bg-white/5 p-3">
            <div className="text-xs text-white/55">Weather (Now)</div>
            <div className="mt-1 text-sm font-semibold">
              {weatherLoading ? 'Loading…' : weather?.temperatureC == null ? '—' : `${fmt(weather.temperatureC)}°C`}
            </div>
            <div className="mt-1 text-[11px] text-white/50">
              Wind {weatherLoading ? '—' : weather?.windSpeedKph == null ? '—' : `${fmt(weather.windSpeedKph)} km/h`}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-stroke bg-white/5 p-3">
            <div className="text-xs text-white/55">Started</div>
            <div className="mt-1 text-sm font-semibold">{timing.startAt ? fmtTime(timing.startAt) : '—'}</div>
            <div className="mt-1 text-[11px] text-white/50">Estimated</div>
          </div>
          <div className="rounded-2xl border border-stroke bg-white/5 p-3">
            <div className="text-xs text-white/55">Arrives</div>
            <div className="mt-1 text-sm font-semibold">{timing.arriveAt ? fmtTime(timing.arriveAt) : '—'}</div>
            <div className="mt-1 text-[11px] text-white/50">Local time</div>
          </div>
          <div className="rounded-2xl border border-stroke bg-white/5 p-3">
            <div className="text-xs text-white/55">To Destination</div>
            <div className="mt-1 text-sm font-semibold">
              {timing.remainingMinutes == null ? '—' : `${timing.remainingMinutes} mins`}
            </div>
            <div className="mt-1 text-[11px] text-white/50">Remaining</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-stroke bg-white/5 p-3">
            <div className="text-xs text-white/55">Type</div>
            <div className="mt-1 text-sm font-semibold">{titleCase(flight.type)}</div>
          </div>
          <div className="rounded-2xl border border-stroke bg-white/5 p-3">
            <div className="text-xs text-white/55">Distance</div>
            <div className="mt-1 text-sm font-semibold">{fmt(flight.distanceKm)} km</div>
            <div className="mt-1 text-[11px] text-white/50">Efficiency {fmt(flight.efficiencyPct)}%</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-stroke bg-white/5 p-3">
          <div className="flex items-center justify-between text-xs text-white/60">
            <div>Progress</div>
            <div>{pct(flight.progress)}%</div>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-glowCyan/80 to-glowPurple/80"
              style={{ width: `${pct(flight.progress)}%` }}
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-stroke bg-white/5 p-3">
          <div className="text-xs text-white/60">ETA</div>
          <div className="mt-1 text-sm font-semibold">{timing.arriveAt ? fmtTime(timing.arriveAt) : flight.etaLocal}</div>
          <div className="mt-1 text-xs text-white/55">{flight?.to?.iata || '—'} local time (estimated)</div>
        </div>
      </div>
    </motion.aside>
  )
}
