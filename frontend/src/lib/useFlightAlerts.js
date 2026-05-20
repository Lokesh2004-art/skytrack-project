import { useEffect, useMemo, useRef, useState } from 'react'

import { playCriticalAlertSound } from './alertSound'

function nowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
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

function isCriticalFlight(f) {
  if (!f) return false
  if (f.critical === true) return true

  const status = f.status
  const alt = typeof f.altitudeFt === 'number' ? f.altitudeFt : null
  const spd = typeof f.speedKts === 'number' ? f.speedKts : null

  if (status === 'landed') return false
  if (alt == null || spd == null) return false

  return alt < 2500 && spd < 220
}

function criticalReason(f) {
  if (f?.criticalReason) return String(f.criticalReason)
  return 'Critical flight condition detected'
}

export function useFlightAlerts({ flights, watchIds }) {
  const watchSet = useMemo(() => new Set((watchIds || []).map((n) => Number(n))), [watchIds])

  const [toasts, setToasts] = useState([])
  const prevByIdRef = useRef(new Map())
  const seenCriticalRef = useRef(new Set())

  useEffect(() => {
    const prev = prevByIdRef.current
    const next = new Map()

    for (const f of flights || []) {
      next.set(Number(f.id), f)
    }

    // Generate alerts for watched flights only.
    const created = []
    for (const id of watchSet) {
      const before = prev.get(id)
      const after = next.get(id)
      if (!before || !after) continue

      if (before.status !== after.status) {
        created.push({
          id: nowId(),
          title: `${after.flightNumber}`,
          message: `Status: ${statusLabel(before.status)} → ${statusLabel(after.status)}`,
          tone: after.status === 'delayed' ? 'warning' : 'info',
        })
      }

      const bDelay = typeof before.delayMinutes === 'number' ? before.delayMinutes : 0
      const aDelay = typeof after.delayMinutes === 'number' ? after.delayMinutes : 0
      if (bDelay !== aDelay) {
        created.push({
          id: nowId(),
          title: `${after.flightNumber}`,
          message: `Delay updated: ${bDelay}m → ${aDelay}m`,
          tone: aDelay > 0 ? 'warning' : 'info',
        })
      }
    }

    // Generate critical alerts for ANY flight (not only watchlist).
    // Toast once when a flight is seen as critical, and re-toast if it returns to normal and becomes critical again.
    for (const f of flights || []) {
      const id = Number(f.id)
      const before = prev.get(id) || null
      const after = next.get(id) || null
      if (!after) continue

      const wasCritical = before ? isCriticalFlight(before) : false
      const isCritical = isCriticalFlight(after)

      if (isCritical) {
        const alreadyShown = seenCriticalRef.current.has(id)
        if (!wasCritical && !alreadyShown) {
          created.push({
            id: nowId(),
            title: `CRITICAL: ${after.flightNumber}`,
            message: criticalReason(after),
            tone: 'warning',
          })
          seenCriticalRef.current.add(id)
        }
      } else {
        // Reset so a future critical transition toasts again.
        seenCriticalRef.current.delete(id)
      }
    }

    if (created.length) {
      // Sound for critical alerts (best-effort; may require prior user interaction).
      if (created.some((t) => t?.tone === 'warning' && String(t?.title || '').startsWith('CRITICAL:'))) {
        playCriticalAlertSound()
      }

      setToasts((prevToasts) => {
        const merged = [...created, ...prevToasts]
        return merged.slice(0, 4)
      })

      // auto-dismiss
      for (const t of created) {
        window.setTimeout(() => {
          setToasts((prevToasts) => prevToasts.filter((x) => x.id !== t.id))
        }, 6500)
      }
    }

    prevByIdRef.current = next
  }, [flights, watchSet])

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, dismiss }
}
