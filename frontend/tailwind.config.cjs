/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0F19',
        panel: 'rgba(255,255,255,0.06)',
        panel2: 'rgba(255,255,255,0.08)',
        stroke: 'rgba(255,255,255,0.10)',
        glowCyan: '#22d3ee',
        glowPurple: '#a855f7'
      },
      boxShadow: {
        glow: '0 0 24px rgba(34, 211, 238, 0.25)',
        glow2: '0 0 32px rgba(168, 85, 247, 0.22)'
      }
    },
  },
  plugins: [],
}
