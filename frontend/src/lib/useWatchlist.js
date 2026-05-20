import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'skytrack.watchlist'
const EVENT_NAME = 'skytrack-watchlist'

function readIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map((n) => Number(n)).filter((n) => Number.isFinite(n)) : []
  } catch {
    return []
  }
}

function writeIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new Event(EVENT_NAME))
  } catch {
    // ignore
  }
}

export function useWatchlist() {
  const [ids, setIds] = useState(() => (typeof window === 'undefined' ? [] : readIds()))

  useEffect(() => {
    function sync() {
      setIds(readIds())
    }

    window.addEventListener('storage', sync)
    window.addEventListener(EVENT_NAME, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(EVENT_NAME, sync)
    }
  }, [])

  const idSet = useMemo(() => new Set(ids), [ids])

  const isWatched = useCallback((flightId) => idSet.has(Number(flightId)), [idSet])

  const toggleWatch = useCallback(
    (flightId) => {
      const id = Number(flightId)
      if (!Number.isFinite(id)) return
      setIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        writeIds(next)
        return next
      })
    },
    [setIds]
  )

  const clearWatchlist = useCallback(() => {
    setIds([])
    writeIds([])
  }, [])

  return { watchIds: ids, isWatched, toggleWatch, clearWatchlist }
}
