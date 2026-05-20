import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'

import { createEndpointDivIcon, createFlightDivIcon } from './leafletIcons'

function bearingDeg(from, to) {
  const lat1 = (from.lat * Math.PI) / 180
  const lat2 = (to.lat * Math.PI) / 180
  const dLon = ((to.lng - from.lng) * Math.PI) / 180

  const y = Math.sin(dLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  const brng = (Math.atan2(y, x) * 180) / Math.PI

  // Our SVG plane points "up"; add 90deg to feel natural on the map.
  return (brng + 90 + 360) % 360
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function lerpPos(from, to, t) {
  return {
    lat: lerp(from.lat, to.lat, t),
    lng: lerp(from.lng, to.lng, t),
  }
}

function bezierPoints(p0, p1, p2, steps = 12) {
  const pts = []
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const u = 1 - t
    const lat = u * u * p0.lat + 2 * u * t * p1.lat + t * t * p2.lat
    const lng = u * u * p0.lng + 2 * u * t * p1.lng + t * t * p2.lng
    pts.push([lat, lng])
  }
  return pts
}

function normalizeLngsForShortestPath(from, to) {
  const a = { ...from }
  const b = { ...to }
  let d = b.lng - a.lng
  if (d > 180) {
    b.lng -= 360
    d = b.lng - a.lng
  } else if (d < -180) {
    b.lng += 360
    d = b.lng - a.lng
  }
  return { from: a, to: b, dLng: d }
}

function routeCurvePoints(fromRaw, toRaw, selected) {
  // Full route arc (solid neon curve, like the reference screenshot).
  const { from, to, dLng } = normalizeLngsForShortestPath(fromRaw, toRaw)

  const mid = { lat: (from.lat + to.lat) / 2, lng: (from.lng + to.lng) / 2 }
  const dLat = to.lat - from.lat

  // Curvature proportional to span; clamp so it doesn't get too wild.
  const span = Math.min(1, Math.max(0.25, (Math.abs(dLng) + Math.abs(dLat)) / 220))
  const curvature = (selected ? 0.26 : 0.22) * span
  const ctrl = {
    lat: mid.lat + -dLng * curvature,
    lng: mid.lng + dLat * curvature,
  }

  // More steps for long arcs for smoothness.
  const steps = selected ? 70 : 56
  return bezierPoints(from, ctrl, to, steps)
}

function segmentCurvePoints(fromRaw, toRaw, progress, selected) {
  // Short curved segment near the current plane position (separate per-flight, like the screenshot).
  const { from, to, dLng } = normalizeLngsForShortestPath(fromRaw, toRaw)
  const p = Math.max(0, Math.min(1, progress ?? 0.22))

  // Very short length so it never becomes a long connected arc.
  const back = selected ? 0.055 : 0.042
  const ahead = selected ? 0.020 : 0.014

  const t0 = Math.max(0, p - back)
  const t2 = Math.min(1, p + ahead)
  const start = lerpPos(from, to, t0)
  const end = lerpPos(from, to, t2)

  const mid = { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 }
  const dLatSeg = end.lat - start.lat
  const dLngSeg = end.lng - start.lng

  // Subtle curvature based on heading; keep it tight.
  const span = Math.min(1, Math.max(0.22, (Math.abs(dLng) + Math.abs(to.lat - from.lat)) / 240))
  const curvature = (selected ? 0.19 : 0.16) * span
  const ctrl = {
    lat: mid.lat + -dLngSeg * curvature,
    lng: mid.lng + dLatSeg * curvature,
  }

  return bezierPoints(start, ctrl, end, selected ? 16 : 13)
}

function routeColors(f) {
  if (f.status === 'delayed') {
    return {
      outer: 'rgba(249,115,22,0.18)',
      mid: 'rgba(249,115,22,0.34)',
      core: 'rgba(249,115,22,0.96)',
    }
  }

  switch (f.type) {
    case 'cargo':
      return {
        outer: 'rgba(168,85,247,0.18)',
        mid: 'rgba(168,85,247,0.34)',
        core: 'rgba(196,133,255,0.95)',
      }
    case 'private':
      return {
        outer: 'rgba(34,197,94,0.18)',
        mid: 'rgba(34,197,94,0.34)',
        core: 'rgba(74,222,128,0.95)',
      }
    case 'commercial':
    default:
      return {
        outer: 'rgba(34,211,238,0.18)',
        mid: 'rgba(34,211,238,0.34)',
        core: 'rgba(34,211,238,0.96)',
      }
  }
}

function FitOnFirstLoad({ flights }) {
  const map = useMap()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    if (!flights.length) return

    const bounds = flights.map((f) => [f.position.lat, f.position.lng])
    map.fitBounds(bounds, { padding: [60, 60] })
    setDone(true)
  }, [done, flights, map])

  return null
}

export default function FlightMap({ flights, selectedFlightId, onSelectFlight, showRoutes = true }) {
  const center = useMemo(() => [20, 0], [])
  const [localFlights, setLocalFlights] = useState(flights)

  useEffect(() => setLocalFlights(flights), [flights])

  // Local animation: move planes slightly for a "live" feel.
  useEffect(() => {
    if (!flights.length) return
    const t = setInterval(() => {
      setLocalFlights((prev) =>
        prev.map((f) => {
          const p = Math.min(1, (f.progress ?? 0.2) + 0.0018)
          const lat = f.from.lat + (f.to.lat - f.from.lat) * p
          const lng = f.from.lng + (f.to.lng - f.from.lng) * p
          return { ...f, progress: p, position: { lat, lng } }
        })
      )
    }, 160)
    return () => clearInterval(t)
  }, [flights.length])

  const [glowPhase, setGlowPhase] = useState(0)
  useEffect(() => {
    if (!showRoutes) return
    const t = setInterval(() => setGlowPhase((p) => (p + 1) % 1000), 260)
    return () => clearInterval(t)
  }, [showRoutes])

  const selectedFlight = useMemo(() => {
    if (selectedFlightId == null) return null
    return localFlights.find((f) => f.id === selectedFlightId) || null
  }, [localFlights, selectedFlightId])

  const displayFlights = useMemo(() => {
    if (!selectedFlight) return localFlights
    return [selectedFlight]
  }, [localFlights, selectedFlight])

  const focusSelected = Boolean(selectedFlight)

  return (
    <div className="absolute inset-0">
      <MapContainer
        center={center}
        zoom={2}
        minZoom={2}
        worldCopyJump
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          className="skytrack-basemap"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Night city-lights glow (matches the reference world-map feel) */}
        <TileLayer
          url="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/2012-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg"
          attribution='&copy; <a href="https://earthdata.nasa.gov/">NASA Earthdata</a>'
          opacity={0.45}
          className="skytrack-citylights"
          maxZoom={8}
        />

        <FitOnFirstLoad flights={localFlights} />

        {displayFlights.map((f) => {
          const isSelected = selectedFlightId === f.id
          const segmentPositions = segmentCurvePoints(f.from, f.to, f.progress, isSelected)
          const { outer: cOuter, mid: cMid, core: cCore } = routeColors(f)
          const fullPositions = isSelected ? routeCurvePoints(f.from, f.to, true) : null

          const canShowEndpoints =
            isSelected &&
            typeof f?.from?.lat === 'number' &&
            typeof f?.from?.lng === 'number' &&
            typeof f?.to?.lat === 'number' &&
            typeof f?.to?.lng === 'number'

          return (
            <div key={f.id}>
              {showRoutes && !focusSelected ? (
                <>
                  <Polyline
                    positions={segmentPositions}
                    pathOptions={{
                      color: cOuter,
                      weight: isSelected ? 13 : 11,
                      opacity: isSelected ? 0.34 : 0.22,
                      lineCap: 'butt',
                      lineJoin: 'miter',
                    }}
                  />
                  <Polyline
                    positions={segmentPositions}
                    pathOptions={{
                      color: cMid,
                      weight: isSelected ? 8 : 7,
                      opacity: isSelected ? 0.52 : 0.40,
                      lineCap: 'butt',
                      lineJoin: 'miter',
                    }}
                  />
                  <Polyline
                    positions={segmentPositions}
                    pathOptions={{
                      color: cCore,
                      weight: isSelected ? 3.2 : 2.8,
                      opacity: (isSelected ? 0.92 : 0.78) + Math.sin(glowPhase / 18) * 0.05,
                      lineCap: 'butt',
                      lineJoin: 'miter',
                    }}
                  />
                </>
              ) : null}

              {showRoutes && focusSelected && isSelected && fullPositions ? (
                <>
                  <Polyline
                    positions={fullPositions}
                    pathOptions={{
                      color: cOuter,
                      weight: 13,
                      opacity: 0.30,
                      dashArray: '4 10',
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                  <Polyline
                    positions={fullPositions}
                    pathOptions={{
                      color: cMid,
                      weight: 8,
                      opacity: 0.48,
                      dashArray: '4 10',
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                  <Polyline
                    positions={fullPositions}
                    pathOptions={{
                      color: cCore,
                      weight: 3.2,
                      opacity: 0.88 + Math.sin(glowPhase / 18) * 0.06,
                      dashArray: '4 10',
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                </>
              ) : null}

              {canShowEndpoints ? (
                <>
                  <Marker position={[f.from.lat, f.from.lng]} icon={createEndpointDivIcon({ kind: 'from' })}>
                    <Tooltip direction="top" offset={[0, -8]} opacity={0.9} className="skytrack-tooltip">
                      <div style={{ minWidth: 120 }}>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>Start</div>
                        <div style={{ fontSize: 11, opacity: 0.85 }}>
                          {f.from.iata} · {f.from.city || f.from.country || '—'}
                        </div>
                      </div>
                    </Tooltip>
                  </Marker>
                  <Marker position={[f.to.lat, f.to.lng]} icon={createEndpointDivIcon({ kind: 'to' })}>
                    <Tooltip direction="top" offset={[0, -8]} opacity={0.9} className="skytrack-tooltip">
                      <div style={{ minWidth: 120 }}>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>Destination</div>
                        <div style={{ fontSize: 11, opacity: 0.85 }}>
                          {f.to.iata} · {f.to.city || f.to.country || '—'}
                        </div>
                      </div>
                    </Tooltip>
                  </Marker>
                </>
              ) : null}

              <Marker
                position={[f.position.lat, f.position.lng]}
                icon={createFlightDivIcon({ status: f.status, bearingDeg: bearingDeg(f.from, f.to) })}
                eventHandlers={{
                  click: () => onSelectFlight(f.id),
                }}
              >
                <Tooltip
                  permanent
                  direction="right"
                  offset={[14, 0]}
                  opacity={0.9}
                  className="skytrack-tooltip"
                >
                  <div style={{ minWidth: 120 }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{f.flightNumber}</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>
                      {f.from.iata} → {f.to.iata}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>
                      {Math.round(f.speedKts)} kts · {Math.round(f.altitudeFt).toLocaleString()} ft
                    </div>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="min-w-[180px] text-sm">
                    <div className="font-semibold">{f.flightNumber}</div>
                    <div className="mt-1 text-xs text-white/70">
                      {f.from.iata} → {f.to.iata}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-white/55">Speed</div>
                        <div className="font-semibold">{Math.round(f.speedKts)} kts</div>
                      </div>
                      <div>
                        <div className="text-white/55">Altitude</div>
                        <div className="font-semibold">{Math.round(f.altitudeFt).toLocaleString()} ft</div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          )
        })}
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/70 backdrop-blur">
        Dark world map · Carto
      </div>
    </div>
  )
}
