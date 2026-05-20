import { useEffect, useState } from 'react'

import { flightsApi } from './api'

export function useFlights({ pollMs = 8000, source } = {}) {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)

  const effectiveSource = source ?? import.meta.env.VITE_FLIGHTS_SOURCE

  useEffect(() => {
    let cancelled = false
    let intervalId = null

    const canPoll = () => typeof document === 'undefined' || document.visibilityState === 'visible'

    async function load() {
      if (!canPoll()) return
      try {
        setError(null)
        const res = await flightsApi.list({ source: effectiveSource })
        if (!cancelled) {
          setFlights(res)
          setLastUpdatedAt(Date.now())
        }
      } catch (e) {
        if (!cancelled) {
          setFlights([])
          setError(e)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    function start() {
      if (!pollMs) return
      if (intervalId) return
      intervalId = setInterval(load, pollMs)
    }

    function stop() {
      if (intervalId) clearInterval(intervalId)
      intervalId = null
    }

    function onVisibility() {
      if (canPoll()) {
        load()
        start()
      } else {
        stop()
      }
    }

    load()
    if (pollMs && canPoll()) start()

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility)
    }

    return () => {
      cancelled = true
      stop()
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility)
      }
    }
  }, [pollMs, effectiveSource])

  return { flights, loading, error, lastUpdatedAt }
}
