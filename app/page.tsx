import Link from 'next/link';

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    label: 'VISUAL FORM CORRECTION',
    title: 'It sees every angle.',
    body: 'Raven-1 analyzes your posture, range of motion, and muscle engagement in real-time. No more guessing if your form is right.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    label: 'FATIGUE DETECTION',
    title: "Knows when you're done.",
    body: 'The coach reads facial expressions, movement speed, and posture changes to detect fatigue — pushing you just past the edge.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: 'REP INTELLIGENCE',
    title: 'Every rep tracked.',
    body: 'Visual rep counting combined with quality scoring. Know not just how many — but how good.',
  },
];

const coaches = [
  { name: 'DRILL SERGEANT', color: '#ff4444', desc: 'Military precision. Zero tolerance for bad form.' },
  { name: 'HYPE BEAST', color: '#ff6b35', desc: 'Explosive energy. Hypes every rep like a concert.' },
  { name: 'ZEN MASTER', color: '#7dd3fc', desc: 'Mindful movement. Breathwork over brute force.' },
];

const tickers = [
  'FORM CORRECTION', 'REP COUNTING', 'FATIGUE DETECTION', 'REAL-TIME VISION',
  'VOICE COACHING', 'PERSONALIZED PLANS', 'POSTURE ANALYSIS', 'BREATHING CUES',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg overflow-x-hidden">
      {/* ── Nav ──────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-border/40 backdrop-blur-sm bg-bg/80">
        <span className="font-display text-xl tracking-widest text-white">
          FIT<span className="text-accent">COACH</span> AI
        </span>
        <Link
          href="/onboard"
          className="btn-accent text-sm font-semibold px-5 py-2 rounded-sm font-body tracking-wide"
        >
          START FREE →
        </Link>
      </nav>

      {/* ── Hero ─────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 bg-grid overflow-hidden">
        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)' }}
        />

        {/* Scanning reticle decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div
            className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full border border-accent/10"
            style={{ animation: 'reticle 4s ease-in-out infinite' }}
          />
          <div
            className="absolute inset-8 rounded-full border border-accent/8"
            style={{ animation: 'reticle 4s ease-in-out infinite 0.8s' }}
          />
          <div
            className="absolute inset-16 rounded-full border border-accent/6"
            style={{ animation: 'reticle 4s ease-in-out infinite 1.6s' }}
          />
        </div>

        {/* Corner brackets */}
        <div className="absolute top-28 left-6 md:left-16 w-12 h-12 border-t-2 border-l-2 border-accent/40" />
        <div className="absolute top-28 right-6 md:right-16 w-12 h-12 border-t-2 border-r-2 border-accent/40" />
        <div className="absolute bottom-12 left-6 md:left-16 w-12 h-12 border-b-2 border-l-2 border-accent/40" />
        <div className="absolute bottom-12 right-6 md:right-16 w-12 h-12 border-b-2 border-r-2 border-accent/40" />

        {/* Live indicator */}
        <div className="mb-8 flex items-center gap-2 px-4 py-2 rounded-sm border border-accent/30 bg-accent/5"
          style={{ animation: 'fadeUp 0.6s ease forwards' }}>
          <div
            className="w-2 h-2 rounded-full bg-accent"
            style={{ animation: 'pulseAccent 1.5s ease-in-out infinite' }}
          />
          <span className="font-mono-data text-xs text-accent tracking-widest">RAVEN-1 VISION ACTIVE</span>
        </div>

        {/* Main headline */}
        <div className="text-center relative z-10">
          <h1 className="font-display leading-none tracking-wider text-center"
            style={{ animation: 'fadeUp 0.6s ease 0.1s forwards', opacity: 0 }}>
            <span className="block text-[clamp(3.5rem,12vw,9rem)] text-white">YOUR AI</span>
            <span className="block text-[clamp(3.5rem,12vw,9rem)] text-accent" style={{ textShadow: '0 0 40px rgba(0,255,136,0.4)' }}>COACH</span>
            <span className="block text-[clamp(3.5rem,12vw,9rem)] text-white">SEES EVERY</span>
            <span className="block text-[clamp(3.5rem,12vw,9rem)] text-white">REP.</span>
          </h1>

          <p className="mt-6 text-muted text-base md:text-lg max-w-lg mx-auto font-body"
            style={{ animation: 'fadeUp 0.6s ease 0.2s forwards', opacity: 0 }}>
            Real-time visual AI coaching. Form correction, fatigue detection, and rep counting —
            all because your coach can actually <em>see</em> you.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animation: 'fadeUp 0.6s ease 0.3s forwards', opacity: 0 }}>
            <Link
              href="/onboard"
              className="btn-accent inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-sm font-body w-full sm:w-auto justify-center"
            >
              START YOUR JOURNEY
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <span className="font-mono-data text-xs text-dim tracking-widest">NO SIGNUP REQUIRED</span>
          </div>

          <p className="mt-4 font-mono-data text-xs text-dim tracking-widest"
            style={{ animation: 'fadeUp 0.6s ease 0.4s forwards', opacity: 0 }}>
            POWERED BY TAVUS PHOENIX-4 · RAVEN-1 · SPARROW-1
          </p>
        </div>
      </section>

      {/* ── Ticker ───────────────────────────── */}
      <div className="border-y border-border bg-surface py-3 overflow-hidden">
        <div className="ticker-wrap">
          <div className="ticker-content">
            {[...tickers, ...tickers].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-4 mx-6">
                <span className="font-mono-data text-xs tracking-widest text-dim">{t}</span>
                <span className="text-accent/40">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ─────────────────────────── */}
      <section className="px-6 md:px-10 py-24 max-w-6xl mx-auto">
        <div className="mb-16 text-center">
          <p className="font-mono-data text-xs text-accent tracking-widest mb-3">WHY THIS EXISTS</p>
          <h2 className="font-display text-[clamp(2rem,6vw,4.5rem)] text-white leading-none">
            VOICE-ONLY AI IS BLIND.
          </h2>
          <p className="mt-4 text-muted max-w-xl mx-auto font-body">
            A coach that cannot see you cannot correct your form. We fixed that.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {features.map((f) => (
            <div key={f.label} className="bg-bg p-8 group hover:bg-surface transition-colors duration-300">
              <div className="text-accent mb-5 group-hover:scale-110 transition-transform duration-300 inline-block">
                {f.icon}
              </div>
              <p className="font-mono-data text-[10px] text-dim tracking-widest mb-2">{f.label}</p>
              <h3 className="font-display text-2xl text-white mb-3">{f.title}</h3>
              <p className="text-muted text-sm font-body leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Coach selector preview ────────────── */}
      <section className="px-6 md:px-10 py-24 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <p className="font-mono-data text-xs text-accent tracking-widest mb-3">CHOOSE YOUR STYLE</p>
            <h2 className="font-display text-[clamp(2rem,6vw,4rem)] text-white leading-none">
              THREE COACHES.<br />ONE GOAL.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coaches.map((c) => (
              <div
                key={c.name}
                className="card-base card-hover rounded-sm p-6 group cursor-default"
                style={{ borderTop: `2px solid ${c.color}55` }}
              >
                <div
                  className="w-2 h-2 rounded-full mb-5"
                  style={{ background: c.color, boxShadow: `0 0 12px ${c.color}` }}
                />
                <h3
                  className="font-display text-2xl mb-2 group-hover:translate-x-1 transition-transform"
                  style={{ color: c.color }}
                >
                  {c.name}
                </h3>
                <p className="text-muted text-sm font-body">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────── */}
      <section className="px-6 md:px-10 py-24 max-w-6xl mx-auto">
        <div className="mb-16 text-center">
          <p className="font-mono-data text-xs text-accent tracking-widest mb-3">SIMPLE AS 1-2-3</p>
          <h2 className="font-display text-[clamp(2rem,6vw,4.5rem)] text-white leading-none">
            HOW IT WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: '01', title: 'TELL US ABOUT YOU', body: 'Share your fitness level, goals, and available equipment. Takes 60 seconds.' },
            { n: '02', title: 'GET YOUR PLAN', body: 'AI generates a personalized weekly workout plan with your first session recommendation.' },
            { n: '03', title: 'COACH SEES YOU', body: 'Join a live session. Your AI coach watches your form and coaches in real-time.' },
          ].map((step) => (
            <div key={step.n} className="flex gap-6">
              <span className="font-display text-6xl text-border leading-none flex-shrink-0">{step.n}</span>
              <div className="pt-2">
                <h3 className="font-display text-xl text-white mb-2">{step.title}</h3>
                <p className="text-muted text-sm font-body leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────── */}
      <section className="px-6 md:px-10 py-20 bg-accent-dim border-t border-b border-accent/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-[clamp(2.5rem,8vw,6rem)] text-white leading-none mb-6">
            READY TO <span className="text-accent">TRAIN</span>?
          </h2>
          <Link
            href="/onboard"
            className="btn-accent inline-flex items-center gap-3 text-lg font-semibold px-10 py-5 rounded-sm font-body"
          >
            BUILD MY PLAN
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────── */}
      <footer className="px-6 md:px-10 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg tracking-widest text-white/50">
            FIT<span className="text-accent/50">COACH</span> AI
          </span>
          <div className="flex gap-6">
            <span className="font-mono-data text-xs text-dim">POWERED BY TAVUS CVI</span>
            <span className="font-mono-data text-xs text-dim">RAVEN-1 PERCEPTION</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
