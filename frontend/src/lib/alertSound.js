let _didInit = false
let _audioCtx = null

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  if (_audioCtx) return _audioCtx
  _audioCtx = new Ctx()
  return _audioCtx
}

export function initAlertSound() {
  if (_didInit) return
  _didInit = true

  // Unlock audio on first user interaction (autoplay policy).
  const unlock = async () => {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      if (ctx.state === 'suspended') await ctx.resume()
    } catch {
      // ignore
    }
  }

  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('keydown', unlock)
}

export async function playCriticalAlertSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      // Might still be blocked; this will work after a user gesture.
      await ctx.resume()
    }

    const now = ctx.currentTime

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)
    gain.connect(ctx.destination)

    const osc1 = ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now)
    osc1.connect(gain)

    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(660, now + 0.16)
    osc2.connect(gain)

    osc1.start(now)
    osc1.stop(now + 0.18)

    osc2.start(now + 0.16)
    osc2.stop(now + 0.34)
  } catch {
    // ignore
  }
}
