import L from 'leaflet'

// Leaflet default marker assets do not resolve well in Vite.
// We use a DivIcon with glowing ✈︎ text for the premium radar feel.
export function createFlightDivIcon({ status, bearingDeg = 0 }) {
  const svg = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
    </svg>
  `.trim()

  const html = `<div class="skytrack-flight-marker" data-status="${status}"><div class="ring"></div><div class="planeWrap" style="transform: rotate(${bearingDeg}deg)"><div class="plane">${svg}</div></div></div>`
  return L.divIcon({
    className: '',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

export function createEndpointDivIcon({ kind = 'from' } = {}) {
  const html = `
    <div class="skytrack-endpoint-marker" data-kind="${kind}">
      <div class="dot"></div>
    </div>
  `.trim()

  return L.divIcon({
    className: '',
    html,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}
