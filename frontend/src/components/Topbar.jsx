import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { getUser } from '../lib/auth'

function initialsFromUser(user) {
  const name = (user?.name || '').trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    const a = parts[0]?.[0] || ''
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
    return (a + b).toUpperCase() || 'U'
  }

  const email = (user?.email || '').trim()
  if (email) return email[0]?.toUpperCase() || 'U'
  return 'U'
}

export default function Topbar({ flights, onSelectFlight, onProfileClick }) {
  const [q, setQ] = useState('')
  const user = useMemo(() => getUser(), [])
  const initials = useMemo(() => initialsFromUser(user), [user])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return []
    const norm = (v) => (v == null ? '' : String(v)).trim().toLowerCase()
    return (flights || [])
      .filter((f) => {
        const flightNumber = norm(f?.flightNumber)
        const airline = norm(f?.airline)
        const aircraft = norm(f?.aircraft)
        const status = norm(f?.status)
        const type = norm(f?.type)

        const fromIata = norm(f?.from?.iata)
        const toIata = norm(f?.to?.iata)
        const fromCity = norm(f?.from?.city)
        const toCity = norm(f?.to?.city)
        const fromCountry = norm(f?.from?.country)
        const toCountry = norm(f?.to?.country)

        const id = norm(f?.id)
        const route = `${fromIata}-${toIata}`
        const routeCities = `${fromCity}-${toCity}`

        return (
          flightNumber.includes(query) ||
          airline.includes(query) ||
          aircraft.includes(query) ||
          status.includes(query) ||
          type.includes(query) ||
          fromIata.includes(query) ||
          toIata.includes(query) ||
          route.includes(query) ||
          fromCity.includes(query) ||
          toCity.includes(query) ||
          routeCities.includes(query) ||
          fromCountry.includes(query) ||
          toCountry.includes(query) ||
          id === query
        )
      })
      .slice(0, 6)
  }, [flights, q])

  return (
    <header className="flex items-center gap-4 border-b border-stroke bg-black/20 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
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
        <div className="text-sm font-semibold">SkyTrack</div>
      </div>

      <div className="relative w-full max-w-2xl">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search flight, airport or route…"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20 focus:bg-white/10"
        />

        {filtered.length > 0 ? (
          <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-stroke bg-[#0B0F19]/95 shadow-glow backdrop-blur">
            {filtered.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  onSelectFlight(f.id)
                  setQ('')
                }}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-white/5"
              >
                <div>
                  <div className="text-sm font-semibold">{f.flightNumber || '—'}</div>
                  <div className="text-xs text-white/55">
                    {(f?.from?.iata || '—') + ' → ' + (f?.to?.iata || '—')} · {f.airline || '—'}
                  </div>
                  {(f?.from?.city || f?.to?.city || f?.from?.country || f?.to?.country) && (
                    <div className="mt-0.5 text-[11px] text-white/45">
                      {f?.from?.city || f?.from?.country || '—'} → {f?.to?.city || f?.to?.country || '—'}
                    </div>
                  )}
                </div>
                <div className="text-xs text-white/55">
                  {typeof f?.speedKts === 'number' ? `${Math.round(f.speedKts)} kts` : '—'}
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="ml-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
        title="Profile"
        type="button"
        onClick={() => onProfileClick?.()}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-glowPurple/30 to-glowCyan/30 text-[11px] font-semibold text-white/85">
          {initials}
        </div>
      </motion.button>
    </header>
  )
}
