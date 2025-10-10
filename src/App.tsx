import { useEffect, useRef, useState } from 'react'
// import photo88 from './assets/88.jpg'
import image from './assets/img.png'

const photos = [
  image,
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524386540876-3a573db47a4d?q=80&w=1600&auto=format&fit=crop'
]

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
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') return true
    if (saved === 'light') return false
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <main ref={revealRef} className="min-h-screen">
      {/* Theme toggle */}
      <button
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setDark(v => !v)}
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
              <img src={photos[2]} alt="Map preview" className="h-full w-full object-cover" />
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
            <p className="mt-2 text-center text-[rgb(var(--muted))]">Let us know if you can make it.</p>
            <form className="mt-6 grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input required placeholder="Full name" className="rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]" />
                <input required type="email" placeholder="Email" className="rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]" />
              </div>
              <select className="rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]">
                <option>Happily attending</option>
                <option>Regretfully declines</option>
              </select>
              <textarea rows={4} placeholder="Message (optional)" className="rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]" />
              <div className="flex justify-center">
                <button type="button" className="btn-primary">Send RSVP</button>
              </div>
              <p className="text-center text-xs text-[rgb(var(--muted))]">This demo form doesn't send yet. Hook it to Google Forms or an API later.</p>
            </form>
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
