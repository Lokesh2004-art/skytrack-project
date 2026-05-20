import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { authApi } from '../lib/api'
import { setToken, setUser } from '../lib/auth'
import flightBg from '../assets/flight-bg.svg'

function Icon({ children }) {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 shadow-glow backdrop-blur">
      {children}
    </div>
  )
}

function InputRow({ icon, type = 'text', value, onChange, placeholder, autoComplete, right }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/55">
        {icon}
      </div>
      <input
        value={value}
        onChange={onChange}
        type={type}
        className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 pl-10 pr-10 text-[16px] text-white placeholder:text-white/35 outline-none backdrop-blur focus:border-white/20 focus:bg-black/30 sm:text-sm"
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {right ? <div className="absolute inset-y-0 right-2 flex items-center">{right}</div> : null}
    </div>
  )
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.2 12c2.2-4.8 6-7.2 9.8-7.2S19.6 7.2 21.8 12c-2.2 4.8-6 7.2-9.8 7.2S4.4 16.8 2.2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12c2.2-4.8 6-7.2 9-7.2 3 0 6.8 2.4 9 7.2-2.2 4.8-6 7.2-9 7.2-3 0-6.8-2.4-9-7.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const PlaneBadge = () => (
  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-glowCyan/25 to-glowPurple/25 shadow-glow2 backdrop-blur">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/85">
      <path
        d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2v4l-2 1.3V21l3-1 3 1v-1.7L13 18v-4l8 2Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  </div>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('demo@skytrack.ai')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('demo123')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [photoBgUrl, setPhotoBgUrl] = useState('')

  useEffect(() => {
    let cancelled = false

    async function checkPhotoBg() {
      try {
        const candidates = ['/auth-bg.jpg', '/auth-bg.jpeg', '/auth-bg.png', '/auth-bg.webp']
        for (const url of candidates) {
          // Some environments block HEAD requests; use an image preload instead.
          // Add a probe param so a newly replaced file is picked up immediately.
          // eslint-disable-next-line no-await-in-loop
          const ok = await new Promise((resolve) => {
            const img = new Image()
            img.onload = () => resolve(true)
            img.onerror = () => resolve(false)
            img.src = `${url}?probe=${Date.now()}`
          })

          if (ok) {
            // Cache-bust so replacing the file updates immediately.
            if (!cancelled) setPhotoBgUrl(`${url}?v=${Date.now()}`)
            return
          }
        }
      } catch {
        // ignore
      }
    }

    checkPhotoBg()
    return () => {
      cancelled = true
    }
  }, [])

  const effectiveBg = useMemo(() => {
    // If a public auth background exists, it should win over any previously stored custom upload.
    if (photoBgUrl) return { url: photoBgUrl, isPhoto: true }
    return { url: flightBg, isPhoto: false }
  }, [photoBgUrl])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup' && password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }
      const data =
        mode === 'signup'
          ? await authApi.signup({ email, password, name })
          : await authApi.login({ email, password })
      if (!data?.token) throw new Error('Invalid login response')
      setToken(data.token)
      setUser(data.user || { email, name: name || 'New User' })
      navigate('/', { replace: true })
    } catch {
      setError(
        mode === 'signup'
          ? 'Sign up failed. Check your details and try again.'
          : 'Login failed. Use demo@skytrack.ai / demo123'
      )
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      title: 'Real-time Tracking',
      desc: 'Track flights in real-time across the globe.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-glowCyan">
          <path
            d="M12 22a10 10 0 1 0-10-10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 8v4l3 2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: 'AI-Powered Insights',
      desc: 'Smart predictions and delay analysis with AI.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-glowCyan">
          <path
            d="M9 3h6v4H9V3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M6 10h12v11H6V10Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M9 14h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: 'Analytics Dashboard',
      desc: 'Visualize flight data and performance metrics.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-glowPurple">
          <path
            d="M4 19V5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M8 19v-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 19v-10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M16 19v-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M20 19V9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: 'Smart Alerts',
      desc: 'Get instant notifications for updates that matter.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-glowPurple">
          <path
            d="M12 22a2.2 2.2 0 0 0 2.2-2.2H9.8A2.2 2.2 0 0 0 12 22Z"
            fill="currentColor"
            opacity="0.55"
          />
          <path
            d="M18 10a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ]

  const isSignup = mode === 'signup'

  return (
    <div className="relative min-h-screen w-full bg-ink text-white">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: effectiveBg.url === flightBg ? `url(${flightBg})` : `url(${effectiveBg.url}), url(${flightBg})`,
          backgroundSize: 'cover',
          // Slightly favor the top-center area so brand/logo text in real photos stays visible.
          backgroundPosition: effectiveBg.isPhoto ? '55% 22%' : 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/78 via-ink/42 to-ink/14" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-[520px] w-[520px] rounded-full bg-glowCyan/10 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-[520px] w-[520px] rounded-full bg-glowPurple/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-6 px-4 py-10 lg:gap-0">
        {/* Left marketing column */}
        <div className="order-1 w-full max-w-xl lg:absolute lg:left-6 lg:top-1/2 lg:w-[420px] lg:-translate-y-1/2 lg:max-w-none">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-6 shadow-glow2 backdrop-blur-2xl sm:p-7">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-glowCyan/15 blur-3xl" />
              <div className="absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-glowPurple/15 blur-3xl" />
            </div>

            <div className="relative flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 shadow-glow backdrop-blur">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-glowCyan/40 to-glowPurple/40" />
                </div>
                <div>
                  <div className="text-xl font-semibold tracking-tight">SkyTrack</div>
                  <div className="text-xs text-white/55">Next-Gen Flight Intelligence</div>
                </div>
              </div>

              <div className="space-y-3">
                {features.map((f) => (
                  <div
                    key={f.title}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 shadow-glow backdrop-blur"
                  >
                    <Icon>{f.icon}</Icon>
                    <div>
                      <div className="text-sm font-semibold">{f.title}</div>
                      <div className="mt-0.5 text-xs text-white/55">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="max-w-sm text-sm text-white/60">
                <div className="italic">“The best way to predict the future is to build it.”</div>
                <div className="mt-1 text-xs text-glowPurple/80">— Alan Kay</div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/50">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/55">
                    <path
                      d="M7 11V8a5 5 0 0 1 10 0v3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6 11h12v10H6V11Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Secure & Encrypted</span>
                </div>
                <span className="text-white/35">|</span>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/55">
                    <path
                      d="M12 2 19 6v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth card */}
        <div className="order-2 mx-auto w-full max-w-xl lg:absolute lg:bottom-10 lg:left-1/2 lg:mx-0 lg:-translate-x-1/2">
          <div className="relative origin-bottom overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 shadow-glow backdrop-blur-2xl transition-transform duration-200 ease-out focus-within:scale-[1.04] sm:focus-within:scale-[1.05] lg:focus-within:scale-[1.06]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-glowCyan/15 blur-3xl" />
              <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-glowPurple/15 blur-3xl" />
            </div>

            <div className="relative border-b border-white/10 bg-black/10 px-7 py-7">
              <div className="flex items-start gap-4">
                <PlaneBadge />
                <div className="flex-1">
                  <div className="text-2xl font-semibold tracking-tight">
                    {isSignup ? 'Create Your Account' : 'Welcome to SkyTrack'}
                  </div>
                  <div className="mt-1 text-sm text-white/55">
                    {isSignup ? 'Join SkyTrack and elevate your journey.' : 'Sign in to continue to SkyTrack.'}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs text-white/70 opacity-70"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-white/10">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M21.6 12.3c0-.7-.1-1.3-.2-2H12v3.7h5.4a4.7 4.7 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.2Z"
                        fill="currentColor"
                        opacity="0.9"
                      />
                      <path
                        d="M12 22c2.7 0 5-0.9 6.6-2.5l-3.3-2.5c-.9.6-2 1-3.3 1a6 6 0 0 1-5.6-4H3v2.6A10 10 0 0 0 12 22Z"
                        fill="currentColor"
                        opacity="0.7"
                      />
                      <path
                        d="M6.4 14a6 6 0 0 1 0-4V7.4H3A10 10 0 0 0 3 16.6L6.4 14Z"
                        fill="currentColor"
                        opacity="0.55"
                      />
                      <path
                        d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 12 2 10 10 0 0 0 3 7.4L6.4 10A6 6 0 0 1 12 6.1Z"
                        fill="currentColor"
                        opacity="0.85"
                      />
                    </svg>
                  </span>
                  Continue with Google
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <div className="text-xs text-white/45">or</div>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            </div>

            <form className="relative space-y-3 px-7 py-7" onSubmit={onSubmit}>
              <InputRow
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 7h16v10H4V7Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m4 7 8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
              />

              {isSignup ? (
                <InputRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M4 21a8 8 0 0 1 16 0"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              ) : null}

              <InputRow
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M7 11V8a5 5 0 0 1 10 0v3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6 11h12v10H6V11Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? 'Create a password' : 'Enter your password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-2 text-white/65 hover:bg-black/30"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                }
              />

              {isSignup ? (
                <InputRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M7 11V8a5 5 0 0 1 10 0v3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M6 11h12v10H6V11Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 16.2 11.4 17.6 14.8 14.2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  right={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-2 text-white/65 hover:bg-black/30"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showConfirmPassword} />
                    </button>
                  }
                />
              ) : null}

              {error ? <div className="pt-1 text-sm text-orange-200">{error}</div> : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-glowCyan/70 to-glowPurple/70 text-sm font-semibold shadow-glow disabled:opacity-60"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/90">
                  <path
                    d="M5 12h14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="m13 6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {loading ? 'Please wait…' : isSignup ? 'Create Account' : 'Sign In'}
              </button>

              <div className="text-center text-xs text-white/50">
                {isSignup ? (
                  <>
                    By creating an account, you agree to our <span className="text-white/70">Terms of Service</span> and{' '}
                    <span className="text-white/70">Privacy Policy</span>.
                  </>
                ) : (
                  <>
                    Demo creds: <span className="text-white/75">demo@skytrack.ai / demo123</span>
                  </>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 border-t border-white/10 pt-5 sm:grid-cols-3">
                {[
                  { title: 'Lightning Fast', sub: 'Blazing performance', key: 'speed' },
                  { title: 'Modern Tech', sub: 'Built with future in mind', key: 'tech' },
                  { title: 'Cloud Sync', sub: 'Access anywhere', key: 'cloud' },
                ].map((b) => (
                  <div key={b.key} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                    <div className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5">
                      <div className="h-3 w-3 rounded-full bg-gradient-to-br from-glowCyan/40 to-glowPurple/40" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white/80">{b.title}</div>
                      <div className="truncate text-[11px] text-white/45">{b.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>

          <div className="mt-5 flex flex-col items-center gap-3 text-xs text-white/55">
            <button
              type="button"
              onClick={() => {
                const next = isSignup ? 'login' : 'signup'
                setMode(next)
                setError('')
                setShowPassword(false)
                setShowConfirmPassword(false)
                if (next === 'signup') {
                  setEmail('')
                  setName('')
                  setPassword('')
                  setConfirmPassword('')
                } else {
                  setEmail('demo@skytrack.ai')
                  setPassword('demo123')
                  setConfirmPassword('')
                }
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur hover:bg-white/10"
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
