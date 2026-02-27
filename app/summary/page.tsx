'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { WorkoutType, CoachPersonality } from '@/lib/types';
import { WORKOUT_TYPE_LABELS, COACH_LABELS } from '@/lib/types';
import { MOTIVATIONAL_MESSAGES } from '@/lib/personas';

const COACH_COLORS: Record<string, string> = {
  'drill-sergeant': '#ff4444',
  'hype-beast': '#ff6b35',
  'zen-master': '#7dd3fc',
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function SummaryContent() {
  const params = useSearchParams();
  const workoutType = (params.get('type') as WorkoutType) || 'full-body';
  const personality = (params.get('personality') as CoachPersonality) || 'hype-beast';
  const duration = Number(params.get('duration')) || 15;
  const elapsed = Number(params.get('elapsed')) || 0;
  const coachColor = COACH_COLORS[personality] || '#00ff88';

  const messages = MOTIVATIONAL_MESSAGES[personality] || MOTIVATIONAL_MESSAGES['hype-beast'];
  const message = messages[Math.floor(Math.random() * messages.length)];

  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('fitcoach_user') || '{}');
      setUserName(user.name || '');
    } catch {}
  }, []);

  const completionPercent = duration > 0 ? Math.min(100, Math.round((elapsed / (duration * 60)) * 100)) : 100;

  return (
    <main className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="px-6 md:px-10 py-5 border-b border-border flex items-center justify-between">
        <span className="font-display text-lg tracking-widest text-white">
          FIT<span className="text-accent">COACH</span> AI
        </span>
        <span className="font-mono-data text-xs text-dim tracking-widest">SESSION COMPLETE</span>
      </div>

      <div className="flex-1 px-6 md:px-10 py-16 max-w-3xl mx-auto w-full">

        {/* Celebration */}
        <div className="text-center mb-12" style={{ animation: 'fadeUp 0.5s ease forwards' }}>
          {/* Animated check */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: `${coachColor}30`, animation: 'reticle 3s ease-in-out infinite' }}
            />
            <div
              className="absolute inset-2 rounded-full border"
              style={{ borderColor: `${coachColor}50`, animation: 'reticle 3s ease-in-out infinite 0.5s' }}
            />
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{ background: `${coachColor}15` }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={coachColor} strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          <h1 className="font-display text-[clamp(2.5rem,8vw,5.5rem)] text-white leading-none mb-4">
            {userName ? `WELL DONE,\n${userName.toUpperCase()}!` : 'SESSION\nCOMPLETE!'}
          </h1>

          <p className="text-muted font-body text-base max-w-lg mx-auto italic leading-relaxed" style={{ color: coachColor }}>
            &ldquo;{message}&rdquo;
          </p>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border mb-12"
          style={{ animation: 'fadeUp 0.5s ease 0.1s forwards', opacity: 0 }}
        >
          {[
            { label: 'TIME', value: formatElapsed(elapsed), sub: 'ELAPSED' },
            { label: 'WORKOUT', value: WORKOUT_TYPE_LABELS[workoutType].toUpperCase(), sub: 'TYPE' },
            { label: 'COACH', value: COACH_LABELS[personality].split(' ')[0].toUpperCase(), sub: 'PERSONALITY' },
            { label: `${completionPercent}%`, value: '', sub: 'COMPLETED' },
          ].map(({ label, value, sub }) => (
            <div key={sub} className="bg-bg p-6 text-center">
              <div className="font-display text-3xl md:text-4xl text-white leading-none mb-1">
                {label}
              </div>
              {value && <div className="font-mono-data text-[10px] text-white/60 tracking-widest mb-1">{value}</div>}
              <div className="font-mono-data text-[10px] text-dim tracking-widest">{sub}</div>
            </div>
          ))}
        </div>

        {/* Completion bar */}
        <div
          className="mb-12"
          style={{ animation: 'fadeUp 0.5s ease 0.15s forwards', opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono-data text-[10px] text-dim tracking-widest">SESSION PROGRESS</span>
            <span className="font-mono-data text-[10px] tracking-widest" style={{ color: coachColor }}>
              {completionPercent}% COMPLETE
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completionPercent}%`, background: coachColor, boxShadow: `0 0 8px ${coachColor}60` }}
            />
          </div>
        </div>

        {/* Next session recommendation */}
        <div
          className="mb-8 p-5 rounded-sm border border-border bg-surface"
          style={{ animation: 'fadeUp 0.5s ease 0.2s forwards', opacity: 0 }}
        >
          <p className="font-mono-data text-[10px] text-dim tracking-widest mb-3">UP NEXT</p>
          <h3 className="font-display text-2xl text-white mb-2">KEEP THE MOMENTUM</h3>
          <p className="text-muted text-sm font-body mb-4">
            Consistency is the only secret. Your next session is one click away.
          </p>
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 font-mono-data text-xs tracking-widest"
            style={{ color: coachColor }}
          >
            SCHEDULE NEXT SESSION →
          </Link>
        </div>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-3"
          style={{ animation: 'fadeUp 0.5s ease 0.3s forwards', opacity: 0 }}
        >
          <Link
            href="/setup"
            className="btn-accent flex-1 text-center py-4 rounded-sm font-body font-semibold text-base inline-flex items-center justify-center gap-2"
          >
            NEW SESSION
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/plan"
            className="btn-ghost flex-1 text-center py-4 rounded-sm font-body text-sm"
          >
            VIEW MY PLAN
          </Link>
          <Link
            href="/"
            className="btn-ghost flex-1 text-center py-4 rounded-sm font-body text-sm"
          >
            HOME
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="font-display text-2xl text-white">LOADING...</div>
      </div>
    }>
      <SummaryContent />
    </Suspense>
  );
}
