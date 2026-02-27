'use client';

import { useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { WorkoutType, CoachPersonality, SessionDuration, UserProfile } from '@/lib/types';
import { WORKOUT_TYPE_LABELS, COACH_LABELS } from '@/lib/types';

const COACH_COLORS: Record<string, string> = {
  'drill-sergeant': '#ff4444',
  'hype-beast': '#ff6b35',
  'zen-master': '#7dd3fc',
};

const COACH_CALL_SIGNS: Record<string, string> = {
  'drill-sergeant': 'SGT. FLEX',
  'hype-beast': 'BLAZE',
  'zen-master': 'SENSEI KAI',
};

const COACH_TAGLINES: Record<string, string> = {
  'drill-sergeant': 'No excuses. No rest. Just results.',
  'hype-beast': "We're about to go absolutely OFF.",
  'zen-master': 'Breathe. Move. Be present.',
};

const COACH_ICONS: Record<string, string> = {
  'drill-sergeant': '⚡',
  'hype-beast': '🔥',
  'zen-master': '☯',
};

const CONNECTING_LINES: Record<string, string[]> = {
  'drill-sergeant': ['ANALYZING YOUR PROFILE...', 'BUILDING YOUR MISSION PLAN...', 'CALIBRATING FORM SENSORS...', 'NO EXCUSES MODE: ON'],
  'hype-beast': ['READING YOUR VIBE...', 'LOADING YOUR PERSONALIZED PLAN...', 'RAVEN-1 ENERGY SCAN ACTIVE...', "IT'S ABOUT TO GO OFF..."],
  'zen-master': ['CENTERING YOUR INTENTION...', 'CRAFTING YOUR PRACTICE...', 'CALIBRATING BREATH SENSORS...', 'FINDING YOUR FLOW STATE...'],
};

type Stage = 'idle' | 'requesting-permissions' | 'permitted' | 'connecting' | 'active' | 'error';

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function SessionContent() {
  const router = useRouter();
  const params = useSearchParams();

  const workoutType = (params.get('type') as WorkoutType) || 'full-body';
  const personality = (params.get('personality') as CoachPersonality) || 'hype-beast';
  const duration = (Number(params.get('duration')) as SessionDuration) || 15;

  const [stage, setStage] = useState<Stage>('idle');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lineRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false); // prevent double-fires

  const coachColor = COACH_COLORS[personality] || '#00ff88';
  const callSign = COACH_CALL_SIGNS[personality] || COACH_LABELS[personality];
  const tagline = COACH_TAGLINES[personality] || '';
  const lines = CONNECTING_LINES[personality] || CONNECTING_LINES['hype-beast'];

  // Step 1: Request camera + mic permissions (browser-native prompt)
  const requestPermissions = useCallback(async () => {
    setStage('requesting-permissions');
    try {
      // This triggers the browser's native permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Stop tracks immediately — we only needed the permission grant
      stream.getTracks().forEach(t => t.stop());
      setStage('permitted');
    } catch {
      setError('Camera & microphone access is required for coaching. Please allow access in your browser settings and try again.');
      setStage('error');
    }
  }, []);

  // Step 2: User explicitly clicks "Talk to Coach" → ONLY NOW do we call the API
  const startSession = useCallback(async () => {
    if (hasStartedRef.current) return; // prevent accidental double-tap
    hasStartedRef.current = true;

    setStage('connecting');

    // Start cycling status lines during connect
    lineRef.current = setInterval(() => setLineIdx(n => (n + 1) % lines.length), 1800);

    const user: UserProfile | null = (() => {
      try { return JSON.parse(localStorage.getItem('fitcoach_user') || 'null'); }
      catch { return null; }
    })();

    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutType, coachPersonality: personality, duration, userProfile: user }),
      });
      const data = await res.json();

      if (data.error) {
        if (lineRef.current) clearInterval(lineRef.current);
        setError(data.error);
        setStage('error');
        hasStartedRef.current = false;
        return;
      }

      setConversationUrl(data.conversation_url);
      setConversationId(data.conversation_id);
      setStage('active');

      // Start session timer
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } catch {
      if (lineRef.current) clearInterval(lineRef.current);
      setError('Failed to connect. Check your API configuration.');
      setStage('error');
      hasStartedRef.current = false;
    }
  }, [workoutType, personality, duration, lines.length]);

  const handleLeave = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (lineRef.current) clearInterval(lineRef.current);
    if (conversationId) {
      fetch('/api/end-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      }).catch(() => {});
    }
    router.push(`/summary?type=${workoutType}&personality=${personality}&duration=${duration}&elapsed=${elapsed}`);
  }, [router, workoutType, personality, duration, elapsed, conversationId]);

  // ── IDLE: Pre-session screen ──
  if (stage === 'idle') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center px-6">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${coachColor}06 0%, transparent 65%)` }}
        />

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: `linear-gradient(${coachColor} 1px, transparent 1px), linear-gradient(90deg, ${coachColor} 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 font-mono-data text-[10px] tracking-widest text-white/30 hover:text-white/60 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
            BACK
          </button>
          <span className="font-mono-data text-[10px] tracking-widest text-white/20">PRE-SESSION CHECK</span>
        </div>

        {/* Main card */}
        <div className="relative w-full max-w-sm">
          {/* Coach badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm mb-4"
              style={{ border: `1px solid ${coachColor}30`, background: `${coachColor}08` }}>
              <span className="font-mono-data text-[10px] tracking-[0.25em]" style={{ color: `${coachColor}80` }}>YOUR COACH TONIGHT</span>
            </div>
            <h1 className="font-display text-6xl tracking-widest mb-1" style={{ color: coachColor }}>{callSign}</h1>
            <p className="font-body text-sm text-white/40 italic">{tagline}</p>
          </div>

          {/* Session details */}
          <div className="grid grid-cols-2 gap-2 mb-8">
            <div className="p-3 rounded-sm" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="font-mono-data text-[9px] tracking-widest text-white/25 mb-1">WORKOUT</p>
              <p className="font-mono-data text-xs text-white/70">{WORKOUT_TYPE_LABELS[workoutType].toUpperCase()}</p>
            </div>
            <div className="p-3 rounded-sm" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="font-mono-data text-[9px] tracking-widest text-white/25 mb-1">DURATION</p>
              <p className="font-mono-data text-xs text-white/70">{duration} MIN</p>
            </div>
          </div>

          {/* Permission info */}
          <div className="p-4 rounded-sm mb-6" style={{ border: `1px solid ${coachColor}15`, background: `${coachColor}05` }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={coachColor} strokeWidth="1.5" style={{ opacity: 0.6 }}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                </svg>
              </div>
              <p className="font-body text-[11px] text-white/40 leading-relaxed">
                Your coach uses <span style={{ color: `${coachColor}80` }}>Raven-1 vision</span> to watch your form in real time. Camera & microphone access is required.
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={requestPermissions}
            className="w-full py-4 rounded-sm font-mono-data text-sm tracking-widest transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-3"
            style={{ background: coachColor, color: '#000' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            ALLOW CAMERA & MIC
          </button>
        </div>

        {/* Bottom scan line */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(to right, transparent, ${coachColor}20, transparent)` }} />
      </div>
    );
  }

  // ── REQUESTING PERMISSIONS: Browser prompt is showing ──
  if (stage === 'requesting-permissions') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-6">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${coachColor}06 0%, transparent 70%)` }} />
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border" style={{ borderColor: `${coachColor}30`, animation: 'reticle 2s ease-in-out infinite' }} />
          <div className="absolute inset-3 rounded-full border" style={{ borderColor: `${coachColor}50`, animation: 'reticle 2s ease-in-out infinite 0.4s' }} />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={coachColor} strokeWidth="1.5">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-mono-data text-[10px] tracking-[0.3em] text-white/30 mb-2">AWAITING PERMISSION</p>
          <p className="font-body text-white/50 text-sm">Check your browser for the permission prompt</p>
        </div>
      </div>
    );
  }

  // ── PERMITTED: Camera/mic granted, user decides when to start ──
  if (stage === 'permitted') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 70% 60% at 50% 45%, ${coachColor}08 0%, transparent 65%)` }} />

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: `linear-gradient(${coachColor} 1px, transparent 1px), linear-gradient(90deg, ${coachColor} 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        <div className="relative w-full max-w-sm text-center">

          {/* Permission confirmed badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm mb-8"
            style={{ border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: 'pulseAccent 1.2s ease-in-out infinite' }} />
            <span className="font-mono-data text-[10px] tracking-widest text-green-400/80">CAMERA & MIC READY</span>
          </div>

          {/* Coach display */}
          <h1 className="font-display text-7xl tracking-widest mb-2" style={{ color: coachColor }}>{callSign}</h1>
          <p className="font-body text-sm text-white/35 mb-10 italic">{tagline}</p>

          {/* Reticle animation */}
          <div className="relative w-20 h-20 flex items-center justify-center mx-auto mb-10">
            {[0, 1, 2].map(i => (
              <div key={i} className="absolute rounded-full border"
                style={{ inset: `${i * 7}px`, borderColor: `${coachColor}${['15','25','40'][i]}`, animation: `reticle 3s ease-in-out infinite ${i * 0.5}s` }} />
            ))}
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
              style={{ background: `linear-gradient(to bottom, transparent, ${coachColor}25, transparent)` }} />
            <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
              style={{ background: `linear-gradient(to right, transparent, ${coachColor}25, transparent)` }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: coachColor, boxShadow: `0 0 20px ${coachColor}80` }} />
          </div>

          {/* THE button — only appears once permissions are granted */}
          <button
            onClick={startSession}
            className="group relative w-full py-5 rounded-sm font-mono-data text-base tracking-[0.2em] transition-all hover:opacity-90 active:scale-[0.98] overflow-hidden"
            style={{ background: coachColor, color: '#000' }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
            TALK TO YOUR COACH NOW
          </button>

          <p className="font-mono-data text-[9px] tracking-widest text-white/20 mt-4">
            SESSION WILL BEGIN IMMEDIATELY
          </p>
        </div>

        {/* Corner brackets */}
        {['top-8 left-8 border-t border-l', 'top-8 right-8 border-t border-r', 'bottom-8 left-8 border-b border-l', 'bottom-8 right-8 border-b border-r'].map((cls, i) => (
          <div key={i} className={`absolute w-6 h-6 pointer-events-none ${cls}`} style={{ borderColor: `${coachColor}25` }} />
        ))}
      </div>
    );
  }

  // ── CONNECTING: API call in progress ──
  if (stage === 'connecting') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-8">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${coachColor}08 0%, transparent 70%)` }} />

        <div className="relative w-28 h-28 flex items-center justify-center">
          {[0, 1, 2].map(i => (
            <div key={i} className="absolute rounded-full border"
              style={{ inset: `${i * 10}px`, borderColor: `${coachColor}${['20','35','50'][i]}`, animation: `reticle 3s ease-in-out infinite ${i * 0.6}s` }} />
          ))}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ background: `linear-gradient(to bottom, transparent, ${coachColor}30, transparent)` }} />
          <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
            style={{ background: `linear-gradient(to right, transparent, ${coachColor}30, transparent)` }} />
          <div className="w-3 h-3 rounded-full" style={{ background: coachColor, boxShadow: `0 0 16px ${coachColor}`, animation: 'pulseAccent 1.2s ease-in-out infinite' }} />
        </div>

        <div className="text-center">
          <p className="font-mono-data text-[10px] tracking-[0.3em] mb-2" style={{ color: `${coachColor}60` }}>CONNECTING TO COACH</p>
          <h2 className="font-display text-4xl tracking-widest" style={{ color: coachColor }}>{callSign}</h2>
        </div>

        <div className="px-5 py-2.5 rounded-sm" style={{ border: `1px solid ${coachColor}20`, background: `${coachColor}08`, minWidth: '260px', textAlign: 'center' }}>
          <span className="font-mono-data text-[11px] tracking-widest" style={{ color: `${coachColor}80` }} key={lineIdx}>{lines[lineIdx]}</span>
        </div>

        <div className="absolute left-0 right-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(to right, transparent, ${coachColor}40, transparent)`, animation: 'scan 3s ease-in-out infinite' }} />
      </div>
    );
  }

  // ── ERROR ──
  if (stage === 'error') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-14 h-14 rounded-full border flex items-center justify-center"
          style={{ borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.1)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <p className="font-display text-3xl text-white mb-2">CONNECTION FAILED</p>
          <p className="text-white/60 font-body text-sm max-w-md">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setStage('idle'); setError(null); hasStartedRef.current = false; }}
            className="btn-accent px-6 py-3 rounded-sm font-body text-sm"
          >
            TRY AGAIN
          </button>
          <button onClick={() => router.back()} className="btn-ghost px-6 py-3 rounded-sm font-body text-sm">BACK</button>
        </div>
      </div>
    );
  }

  // ── ACTIVE SESSION — iframe-based ──
  return (
    <div className="fixed inset-0 bg-black overflow-hidden" style={{ zIndex: 0 }}>

      {/* ── IFRAME: Full-screen Tavus CVI ── */}
      {conversationUrl && (
        <iframe
          src={conversationUrl}
          allow="camera; microphone; autoplay; display-capture; fullscreen"
          allowFullScreen
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* ── HUD overlay — sits above iframe ── */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm"
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444', animation: 'pulseAccent 1.2s ease-in-out infinite' }} />
            <span className="font-mono-data text-[10px] text-white/60 tracking-widest">LIVE</span>
          </div>
          <div className="px-3 py-1.5 rounded-sm"
            style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${coachColor}35`, backdropFilter: 'blur(8px)' }}>
            <span className="font-mono-data text-xs tracking-widest" style={{ color: coachColor }}>{callSign}</span>
          </div>
          <div className="hidden sm:block px-3 py-1.5 rounded-sm"
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
            <span className="font-mono-data text-[10px] text-white/50 tracking-widest">{WORKOUT_TYPE_LABELS[workoutType].toUpperCase()}</span>
          </div>
        </div>

        {/* Center timer */}
        <div className="absolute left-1/2 top-3 -translate-x-1/2 px-4 py-1.5 rounded-sm"
          style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
          <span className="font-mono-data text-base tracking-widest tabular-nums" style={{ color: coachColor }}>{formatTime(elapsed)}</span>
          <span className="font-mono-data text-[10px] text-white/25 ml-1.5">/ {String(duration).padStart(2, '0')}:00</span>
        </div>

        {/* Right: End */}
        <button
          onClick={handleLeave}
          style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(239,68,68,0.35)', color: 'rgba(239,68,68,0.8)', backdropFilter: 'blur(8px)' }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-sm font-mono-data text-[10px] tracking-widest transition-all hover:bg-red-500/20 hover:border-red-400 hover:text-red-400"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6L18 18" />
          </svg>
          END SESSION
        </button>
      </div>

      {/* Corner brackets */}
      {['top-14 left-4 border-t border-l', 'top-14 right-4 border-t border-r', 'bottom-4 left-4 border-b border-l', 'bottom-4 right-4 border-b border-r'].map((cls, i) => (
        <div key={i} className={`absolute w-5 h-5 pointer-events-none ${cls}`} style={{ borderColor: `${coachColor}30`, zIndex: 10 }} />
      ))}
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <span className="font-mono-data text-xs text-white/30 tracking-widest">INITIALIZING...</span>
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
}
