'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { WorkoutType, CoachPersonality, SessionDuration, UserProfile } from '@/lib/types';
import { WORKOUT_TYPE_LABELS, COACH_LABELS } from '@/lib/types';
import { CVIProvider } from '../components/cvi/components/cvi-provider';
import { Conversation } from '../components/cvi/components/conversation';

const COACH_COLORS: Record<string, string> = {
  'drill-sergeant': '#ff4444',
  'hype-beast': '#ff6b35',
  'zen-master': '#7dd3fc',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function SessionContent() {
  const router = useRouter();
  const params = useSearchParams();

  const workoutType = (params.get('type') as WorkoutType) || 'full-body';
  const personality = (params.get('personality') as CoachPersonality) || 'hype-beast';
  const duration = (Number(params.get('duration')) as SessionDuration) || 15;

  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const coachColor = COACH_COLORS[personality] || '#00ff88';

  // Start conversation
  useEffect(() => {
    const user: UserProfile | null = (() => {
      try {
        const s = localStorage.getItem('fitcoach_user');
        return s ? JSON.parse(s) : null;
      } catch { return null; }
    })();

    fetch('/api/conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workoutType,
        coachPersonality: personality,
        duration,
        userName: user?.name,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setConversationUrl(data.conversation_url);
          setSessionStarted(true);
        }
      })
      .catch(() => setError('Failed to connect to coach. Check your API configuration.'))
      .finally(() => setLoading(false));
  }, [workoutType, personality, duration]);

  // Timer
  useEffect(() => {
    if (!sessionStarted) return;
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionStarted]);

  const handleLeave = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    router.push(
      `/summary?type=${workoutType}&personality=${personality}&duration=${duration}&elapsed=${elapsed}`
    );
  }, [router, workoutType, personality, duration, elapsed]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-6">
        <div className="relative w-24 h-24">
          <div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: `${coachColor}30`, animation: 'reticle 2s ease-in-out infinite' }}
          />
          <div
            className="absolute inset-3 rounded-full border"
            style={{ borderColor: `${coachColor}50`, animation: 'reticle 2s ease-in-out infinite 0.4s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-4 h-4 rounded-full"
              style={{ background: coachColor, animation: 'pulseAccent 1s ease-in-out infinite' }}
            />
          </div>
        </div>

        <div className="text-center">
          <p className="font-display text-3xl text-white mb-1">CONNECTING TO COACH</p>
          <p className="font-mono-data text-xs tracking-widest" style={{ color: coachColor }}>
            {COACH_LABELS[personality].toUpperCase()} IS GETTING READY...
          </p>
        </div>

        <div className="flex gap-3">
          {[workoutType, personality, `${duration}min`].map(tag => (
            <span key={tag} className="font-mono-data text-[10px] text-dim tracking-widest px-3 py-1 border border-border rounded-sm">
              {tag.toUpperCase().replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-12 h-12 rounded-full border border-red-500/50 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <p className="font-display text-2xl text-white mb-2">CONNECTION FAILED</p>
          <p className="text-muted font-body text-sm max-w-md">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-accent px-6 py-3 rounded-sm font-body text-sm"
          >
            RETRY
          </button>
          <button
            onClick={() => router.back()}
            className="btn-ghost px-6 py-3 rounded-sm font-body text-sm"
          >
            BACK
          </button>
        </div>
        <div className="max-w-md p-4 bg-surface border border-border rounded-sm text-left">
          <p className="font-mono-data text-[10px] text-dim tracking-widest mb-2">SETUP REQUIRED</p>
          <p className="text-xs text-muted font-body leading-relaxed">
            1. Add <code className="text-accent bg-accent-dim px-1 py-0.5 rounded">TAVUS_API_KEY</code> to .env.local<br />
            2. Run <code className="text-accent bg-accent-dim px-1 py-0.5 rounded">POST /api/setup-personas</code> to create coach personas<br />
            3. Add the returned persona IDs to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000] flex flex-col">
      {/* ── HUD Overlay ── */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 pointer-events-none">
        {/* Left: Coach + Workout info */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: coachColor, animation: 'pulseAccent 2s ease-in-out infinite', boxShadow: `0 0 8px ${coachColor}` }}
          />
          <div className="session-badge">
            <span style={{ color: coachColor }}>{COACH_LABELS[personality].toUpperCase()}</span>
          </div>
          <div className="session-badge">
            {WORKOUT_TYPE_LABELS[workoutType].toUpperCase()}
          </div>
        </div>

        {/* Center: Timer */}
        <div className="session-badge font-mono-data text-sm pointer-events-none" style={{ color: coachColor }}>
          {formatTime(elapsed)}
          <span className="text-dim text-[9px] ml-1">/ {duration}:00</span>
        </div>

        {/* Right: End button */}
        <button
          onClick={handleLeave}
          className="pointer-events-auto font-mono-data text-xs tracking-widest px-4 py-2 rounded-sm border border-red-500/50 bg-black/70 text-red-400 hover:bg-red-500/20 hover:border-red-400 transition-all backdrop-blur-sm"
        >
          END SESSION ✕
        </button>
      </div>

      {/* ── CVI Conversation ── */}
      <div className="flex-1 h-screen">
        {conversationUrl && (
          <CVIProvider>
            <Conversation
              conversationUrl={conversationUrl}
              onLeave={handleLeave}
            />
          </CVIProvider>
        )}
      </div>

      {/* Corner brackets — visual HUD effect */}
      <div className="absolute top-14 left-4 w-6 h-6 border-t border-l pointer-events-none" style={{ borderColor: `${coachColor}40` }} />
      <div className="absolute top-14 right-4 w-6 h-6 border-t border-r pointer-events-none" style={{ borderColor: `${coachColor}40` }} />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l pointer-events-none" style={{ borderColor: `${coachColor}40` }} />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r pointer-events-none" style={{ borderColor: `${coachColor}40` }} />
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="font-display text-2xl text-white">LOADING SESSION...</div>
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
}
