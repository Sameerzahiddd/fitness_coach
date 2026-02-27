'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import type { WorkoutType, CoachPersonality, SessionDuration } from '@/lib/types';
import { WORKOUT_TYPE_LABELS } from '@/lib/types';
import { personas } from '@/lib/personas';

const WORKOUT_TYPES: { id: WorkoutType; icon: string; desc: string }[] = [
  { id: 'upper-body', icon: '💪', desc: 'Chest, back, shoulders, arms' },
  { id: 'lower-body', icon: '🦵', desc: 'Quads, hamstrings, glutes, calves' },
  { id: 'core', icon: '🔥', desc: 'Abs, obliques, lower back' },
  { id: 'full-body', icon: '⚡', desc: 'Everything — maximum burn' },
  { id: 'stretch', icon: '🧘', desc: 'Mobility, flexibility, recovery' },
];

const COACHES: { id: CoachPersonality; color: string }[] = [
  { id: 'drill-sergeant', color: '#ff4444' },
  { id: 'hype-beast', color: '#ff6b35' },
  { id: 'zen-master', color: '#7dd3fc' },
];

const DURATIONS: { value: SessionDuration; label: string; note?: string }[] = [
  { value: 5, label: '5 MIN', note: 'Quick Demo' },
  { value: 15, label: '15 MIN', note: 'Focused' },
  { value: 30, label: '30 MIN', note: 'Full Session' },
];

function SetupContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [workoutType, setWorkoutType] = useState<WorkoutType>(
    (params.get('type') as WorkoutType) || 'full-body'
  );
  const [personality, setPersonality] = useState<CoachPersonality>(
    (params.get('personality') as CoachPersonality) || 'hype-beast'
  );
  const [duration, setDuration] = useState<SessionDuration>(
    (Number(params.get('duration')) as SessionDuration) || 15
  );

  function startSession() {
    router.push(`/session?type=${workoutType}&personality=${personality}&duration=${duration}`);
  }

  return (
    <main className="min-h-screen bg-bg">
      {/* Header */}
      <div className="px-6 md:px-10 py-5 border-b border-border flex items-center justify-between">
        <span className="font-display text-lg tracking-widest text-white">
          FIT<span className="text-accent">COACH</span> AI
        </span>
        <button
          onClick={() => router.back()}
          className="font-mono-data text-xs text-dim tracking-widest hover:text-muted transition-colors"
        >
          ← BACK
        </button>
      </div>

      <div className="px-6 md:px-10 py-10 max-w-4xl mx-auto">
        <div className="mb-10" style={{ animation: 'fadeUp 0.4s ease forwards' }}>
          <p className="font-mono-data text-xs text-accent tracking-widest mb-2">CONFIGURE SESSION</p>
          <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] text-white leading-none">
            BUILD YOUR<br />SESSION.
          </h1>
        </div>

        {/* ── Workout Type ── */}
        <section className="mb-10" style={{ animation: 'fadeUp 0.4s ease 0.1s forwards', opacity: 0 }}>
          <h2 className="font-mono-data text-xs text-dim tracking-widest mb-4">WORKOUT TYPE</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {WORKOUT_TYPES.map(({ id, icon, desc }) => (
              <button
                key={id}
                onClick={() => setWorkoutType(id)}
                className={`p-4 rounded-sm border text-center transition-all duration-200
                  ${workoutType === id ? 'card-selected bg-accent-dim' : 'card-base card-hover'}`}
              >
                <div className="text-2xl mb-2">{icon}</div>
                <div className="font-display text-sm text-white leading-tight">
                  {WORKOUT_TYPE_LABELS[id].toUpperCase()}
                </div>
                <div className="font-mono-data text-[9px] text-dim tracking-wide mt-1 leading-tight">{desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Coach Personality ── */}
        <section className="mb-10" style={{ animation: 'fadeUp 0.4s ease 0.2s forwards', opacity: 0 }}>
          <h2 className="font-mono-data text-xs text-dim tracking-widest mb-4">COACH PERSONALITY</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COACHES.map(({ id, color }) => {
              const coach = personas[id];
              return (
                <button
                  key={id}
                  onClick={() => setPersonality(id)}
                  className={`p-5 rounded-sm border text-left transition-all duration-200
                    ${personality === id
                      ? 'bg-surface-2'
                      : 'card-base card-hover'}`}
                  style={personality === id ? {
                    borderColor: color,
                    boxShadow: `0 0 20px ${color}25, inset 0 0 20px ${color}08`,
                  } : {}}
                >
                  <div
                    className="w-2 h-2 rounded-full mb-4"
                    style={{ background: color, boxShadow: `0 0 10px ${color}` }}
                  />
                  <div
                    className="font-display text-xl mb-1"
                    style={{ color: personality === id ? color : '#ffffff' }}
                  >
                    {coach.name.toUpperCase()}
                  </div>
                  <div className="font-mono-data text-[10px] text-dim tracking-widest mb-2">
                    {coach.tagline.toUpperCase()}
                  </div>
                  <div className="text-muted text-xs font-body leading-relaxed">
                    {coach.description}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Duration ── */}
        <section className="mb-12" style={{ animation: 'fadeUp 0.4s ease 0.3s forwards', opacity: 0 }}>
          <h2 className="font-mono-data text-xs text-dim tracking-widest mb-4">SESSION DURATION</h2>
          <div className="flex gap-3">
            {DURATIONS.map(({ value, label, note }) => (
              <button
                key={value}
                onClick={() => setDuration(value)}
                className={`flex-1 py-5 rounded-sm border text-center transition-all duration-200
                  ${duration === value ? 'card-selected bg-accent-dim' : 'card-base card-hover'}`}
              >
                <div className="font-display text-3xl text-white">{label}</div>
                {note && (
                  <div className={`font-mono-data text-[10px] tracking-widest mt-1
                    ${duration === value ? 'text-accent' : 'text-dim'}`}>
                    {note.toUpperCase()}
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Session Preview ── */}
        <div
          className="mb-8 p-5 rounded-sm border border-border-lit bg-surface flex items-center justify-between flex-wrap gap-4"
          style={{ animation: 'fadeUp 0.4s ease 0.4s forwards', opacity: 0 }}
        >
          <div>
            <p className="font-mono-data text-[10px] text-dim tracking-widest mb-2">SESSION PREVIEW</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-display text-2xl text-white">
                {WORKOUT_TYPE_LABELS[workoutType]}
              </span>
              <span className="text-border-lit">·</span>
              <span
                className="font-display text-2xl"
                style={{ color: COACHES.find(c => c.id === personality)?.color }}
              >
                {personas[personality]?.name.toUpperCase()}
              </span>
              <span className="text-border-lit">·</span>
              <span className="font-display text-2xl text-white">{duration} MIN</span>
            </div>
          </div>

          <button
            onClick={startSession}
            className="btn-accent px-8 py-4 rounded-sm font-body font-semibold text-base inline-flex items-center gap-2 flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
            </svg>
            START SESSION
          </button>
        </div>

        {/* Info */}
        <p className="font-mono-data text-[10px] text-dim tracking-widest text-center"
          style={{ animation: 'fadeIn 0.4s ease 0.5s forwards', opacity: 0 }}>
          YOUR CAMERA AND MICROPHONE WILL BE REQUESTED · REQUIRED FOR AI VISUAL COACHING
        </p>
      </div>
    </main>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="font-display text-2xl text-white">LOADING...</div>
      </div>
    }>
      <SetupContent />
    </Suspense>
  );
}
