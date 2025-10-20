import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
// import photo88 from './assets/88.jpg'
import image from './assets/img.png'

const photos = [
  image,
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524386540876-3a573db47a4d?q=80&w=1600&auto=format&fit=crop'
]

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7089'
const RSVP_OPTIONS = ['Happily attending', 'Regretfully declines'] as const
type RsvpOption = (typeof RSVP_OPTIONS)[number]

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false

  try {
    const storedPreference = window.localStorage.getItem('theme')
    if (storedPreference === 'dark') return true
    if (storedPreference === 'light') return false
  } catch {
    // Ignore storage access errors (e.g., privacy modes)
  }

  const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
  return !!mediaQuery?.matches
}

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('reveal')
      })
    }, { threshold: 0.15 })
    el.querySelectorAll('[data-reveal]').forEach(n => obs.observe(n))
    return () => obs.disconnect()
  }, [])
  return ref
}

export default function App() {
  const revealRef = useReveal()

  // Calculate days left using only dates (not time)
  const weddingDate = new Date('2026-01-30')
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to midnight
  weddingDate.setHours(0, 0, 0, 0) // Reset time to midnight
  const daysLeft = Math.max(0, Math.ceil((weddingDate.getTime() - today.getTime()) / (1000*60*60*24)))

  // Theme toggle state
  const [dark, setDark] = useState<boolean>(getInitialDarkMode)
  const toggleDark = useCallback(() => setDark((prev) => !prev), [])

  const [codeInput, setCodeInput] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [guestName, setGuestName] = useState<string | null>(null)
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<RsvpOption | ''>('')
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    root.classList.toggle('dark', dark)

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('theme', dark ? 'dark' : 'light')
      } catch {
        // Ignore storage write failures to avoid breaking the UI
      }
    }
  }, [dark])

  const handleCodeLookup = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedCode = codeInput.trim()
    if (!trimmedCode) return

    setLookupLoading(true)
    setLookupError(null)
    setSubmitState('idle')
    setSubmitError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmedCode })
      })
      const payload: { name?: string; message?: string } | null = await response.json().catch(() => null)

      if (!response.ok) {
        const message = payload?.message ?? 'Unable to verify code. Please try again.'
        throw new Error(message)
      }

      const name = payload?.name
      if (!name) {
        throw new Error('Code lookup succeeded but did not return a guest name.')
      }

      setGuestName(name)
      setVerifiedCode(trimmedCode)
      setSelectedStatus('')
      setCodeInput('')
    } catch (error) {
      console.error('Code lookup failed', error)
      setLookupError(error instanceof Error ? error.message : 'Unable to verify code. Please try again.')
    } finally {
      setLookupLoading(false)
    }
  }, [codeInput])

  const handleRsvpSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!verifiedCode || !selectedStatus) return

    setSubmitState('loading')
    setSubmitError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifiedCode, status: selectedStatus })
      })
      const payload: { message?: string; name?: string; status?: string } | null = await response.json().catch(() => null)

      if (!response.ok) {
        const message = payload?.message ?? 'Unable to submit RSVP. Please try again.'
        throw new Error(message)
      }

      if (payload?.name) {
        setGuestName(payload.name)
      }
      if (payload?.status && RSVP_OPTIONS.includes(payload.status as RsvpOption)) {
        setSelectedStatus(payload.status as RsvpOption)
      }

      setSubmitError(null)
      setSubmitState('success')
    } catch (error) {
      console.error('RSVP submission failed', error)
      setSubmitState('error')
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit RSVP. Please try again.')
    }
  }, [selectedStatus, verifiedCode])

  const resetGuest = useCallback(() => {
    setGuestName(null)
    setVerifiedCode(null)
    setSelectedStatus('')
    setSubmitState('idle')
    setSubmitError(null)
    setLookupError(null)
    setCodeInput('')
  }, [])

  return (
    <main ref={revealRef} className="min-h-screen">
      {/* Theme toggle */}
      <button
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleDark}
        className="fixed top-6 right-6 z-50 inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white/80 backdrop-blur px-4 shadow-md hover:shadow-lg transition-all dark:bg-[rgb(var(--surface))]"
      >
        <span className="mr-2 text-sm font-medium">{dark ? 'Dark' : 'Light'}</span>
        <span className="grid size-7 place-items-center rounded-full bg-[rgb(var(--primary))] text-white">{dark ? '🌙' : '☀️'}</span>
      </button>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={photos[0]} alt="" className="h-full w-full object-cover object-center fade-edges" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[rgb(var(--bg))]" />
        </div>
        <div className="grain absolute inset-0 -z-10" />

        <div className="container pt-24 pb-20 sm:pt-28 sm:pb-28">
          <div className="max-w-3xl text-white">
            <span className="tag mb-4 bg-white/20 text-white border-white/30" data-reveal>Save the Date</span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif" data-reveal>
              <span className="block font-script text-6xl sm:text-7xl md:text-8xl leading-none">Randel & Gem</span>
            </h1>
            <p className="mt-6 text-lg/7 sm:text-xl/8 max-w-2xl text-white/90" data-reveal>
              Join us as we celebrate our wedding in beautiful Tagaytay on January 30, 2026.
            </p>
            <div className="mt-10 text-sm text-white/80" data-reveal>
              {daysLeft > 0 ? `${daysLeft} days to go` : 'Today is the day!'}
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="container py-8 sm:py-12">
        <div className="flex justify-center">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4" data-reveal>
            <a href="#details" className="btn-primary text-center">View Details</a>
            <a href="#rsvp" className="btn-ghost text-center">RSVP</a>
          </div>
        </div>
      </section>

      {/* Details */}
      <section id="details" className="container py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-serif">The Celebration</h2>
            <p className="text-[rgb(var(--muted))] max-w-prose">
              We can't wait to share this special day with our family and friends. Please find the
              schedule and locations below. Feel free to explore the gallery and RSVP when you're ready.
            </p>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm" data-reveal>
                <div className="size-10 shrink-0 rounded-full bg-[rgb(var(--primary)/.1)] grid place-items-center text-[rgb(var(--primary))]">⛪</div>
                <div>
                  <p className="font-semibold">Church Ceremony</p>
                  <p className="text-sm text-[rgb(var(--muted))]">Our Lady of Lourdes, Tagaytay — 1:30 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm" data-reveal>
                <div className="size-10 shrink-0 rounded-full bg-[rgb(var(--primary)/.1)] grid place-items-center text-[rgb(var(--primary))]">🌿</div>
                <div>
                  <p className="font-semibold">Reception</p>
                  <p className="text-sm text-[rgb(var(--muted))]">Farm Hills Garden, Tagaytay — 4:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm" data-reveal>
                <div className="size-10 shrink-0 rounded-full bg-[rgb(var(--primary)/.1)] grid place-items-center text-[rgb(var(--primary))]">📅</div>
                <div>
                  <p className="font-semibold">Date</p>
                  <p className="text-sm text-[rgb(var(--muted))]">January 30, 2026</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="relative" data-reveal>
            <div className="aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
              <img src={photos[1]} alt="Wedding details" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-lg border border-black/5" data-reveal>
              <span className="font-script text-3xl text-[rgb(var(--primary))]">See you there</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white/60 py-20 sm:py-28">
        <div className="container">
          <div className="max-w-2xl" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-serif">A glimpse of the day</h2>
            <p className="mt-3 text-[rgb(var(--muted))]">Stock photos for now — replace with your favorites later.</p>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[photos[0], photos[2], photos[1], photos[2], photos[1], photos[0]].map((src, i) => (
              <div key={`${i}-${src.split('/').pop()}`} className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white" data-reveal>
                <img src={src} alt="Gallery" className="h-48 md:h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Maps */}
      <section id="map" className="container py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-4" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-serif">How to get there</h2>
            <p className="text-[rgb(var(--muted))]">Tap a card to open the location.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <a target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=Our+Lady+of+Lourdes+Parish+Church+Tagaytay" className="block rounded-2xl border border-black/5 bg-white p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold">Our Lady of Lourdes</p>
                <p className="text-sm text-[rgb(var(--muted))]">Tagaytay — 1:30 PM</p>
              </a>
              <a target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=Farm+Hills+Garden+Tagaytay" className="block rounded-2xl border border-black/5 bg-white p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold">Farm Hills Garden</p>
                <p className="text-sm text-[rgb(var(--muted))]">Tagaytay — 4:00 PM</p>
              </a>
            </div>
          </div>
          <div className="relative" data-reveal>
            <div className="aspect-[16/10] overflow-hidden rounded-3xl border border-black/5 bg-white shadow-lg">
              <iframe
                src="https://embed.waze.com/iframe?zoom=16&lat=14.111042&lon=120.957108&ct=livemap"
                className="h-full w-full"
                allowFullScreen
                title="Waze map"
              />
            </div>
          </div>
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp" className="relative py-20 sm:py-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-[rgb(var(--accent)/.25)]" />
        <div className="container">
          <div className="mx-auto max-w-xl rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-8 sm:p-10 shadow-xl" data-reveal>
            <h2 className="text-3xl font-serif text-center">RSVP</h2>
            <p className="mt-2 text-center text-[rgb(var(--muted))]">
              {guestName ? 'Update your RSVP below.' : 'Enter your RSVP code to continue.'}
            </p>
            {!guestName ? (
              <form onSubmit={handleCodeLookup} className="mt-6 grid gap-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="rsvp-code"
                    value={codeInput}
                    onChange={(event) => setCodeInput(event.target.value)}
                    placeholder="Enter your RSVP code"
                    className="flex-1 rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                    required
                    disabled={lookupLoading}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="btn-primary whitespace-nowrap"
                    disabled={lookupLoading}
                  >
                    {lookupLoading ? 'Checking…' : 'Enter code'}
                  </button>
                </div>
                {lookupError && (
                  <p className="text-center text-sm text-red-600">{lookupError}</p>
                )}
              </form>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="mt-6 grid gap-5">
                <div className="text-center space-y-1">
                  <p className="text-lg font-semibold">Hi! {guestName}</p>
                  <p className="text-sm text-[rgb(var(--muted))]">We're excited to celebrate with you.</p>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="rsvp-status" className="text-sm font-medium text-[rgb(var(--muted))]">
                    Select your RSVP
                  </label>
                  <select
                    id="rsvp-status"
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value as RsvpOption)}
                    className="rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                    required
                  >
                    <option value="" disabled>
                      Choose an option
                    </option>
                    {RSVP_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                {submitError && (
                  <p className="text-center text-sm text-red-600">{submitError}</p>
                )}
                {submitState === 'success' && (
                  <p className="text-center text-sm text-emerald-600">
                    Thank you! Your RSVP has been recorded.
                  </p>
                )}
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto"
                    disabled={selectedStatus === '' || submitState === 'loading'}
                  >
                    {submitState === 'loading' ? 'Submitting…' : 'Submit RSVP'}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost w-full sm:w-auto"
                    onClick={resetGuest}
                    disabled={submitState === 'loading'}
                  >
                    Use a different code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10">
        <div className="container text-center text-sm text-[rgb(var(--muted))]">
          <p className="font-script text-2xl text-[rgb(var(--primary))]">Randel & Gem</p>
          <p className="mt-1">January 30, 2026 · Tagaytay</p>
        </div>
      </footer>
    </main>
  )
}
