'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { WorkoutPlan } from '@/lib/types';
import { WORKOUT_TYPE_LABELS, COACH_LABELS } from '@/lib/types';

const INTENSITY_COLOR: Record<string, string> = {
  light: '#7dd3fc',
  moderate: '#ff6b35',
  high: '#ff4444',
};

const INTENSITY_LABEL: Record<string, string> = {
  light: 'LIGHT',
  moderate: 'MODERATE',
  high: 'HIGH',
};

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedPlan = localStorage.getItem('fitcoach_plan');
    const storedUser = localStorage.getItem('fitcoach_user');

    if (!storedUser) {
      router.push('/onboard');
      return;
    }

    if (storedPlan) {
      setPlan(JSON.parse(storedPlan));
      setLoading(false);
    } else {
      // Generate plan if somehow missing
      const profile = JSON.parse(storedUser);
      fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
        .then(r => r.json())
        .then(({ plan }) => {
          localStorage.setItem('fitcoach_plan', JSON.stringify(plan));
          setPlan(plan);
        })
        .finally(() => setLoading(false));
    }
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full border-2 border-accent/20"
              style={{ animation: 'reticle 2s ease-in-out infinite' }}
            />
            <div
              className="absolute inset-2 rounded-full border border-accent/40"
              style={{ animation: 'reticle 2s ease-in-out infinite 0.3s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-3 h-3 rounded-full bg-accent"
                style={{ animation: 'pulseAccent 1s ease-in-out infinite' }}
              />
            </div>
          </div>
          <p className="font-display text-2xl text-white">BUILDING YOUR PLAN</p>
          <p className="font-mono-data text-xs text-dim tracking-widest mt-2">
            AI IS ANALYZING YOUR PROFILE...
          </p>
        </div>
      </main>
    );
  }

  if (!plan) return null;

  const rec = plan.firstSessionRecommendation;

  return (
    <main className="min-h-screen bg-bg">
      {/* Header */}
      <div className="px-6 md:px-10 py-5 border-b border-border flex items-center justify-between sticky top-0 bg-bg/90 backdrop-blur-sm z-10">
        <span className="font-display text-lg tracking-widest text-white">
          FIT<span className="text-accent">COACH</span> AI
        </span>
        <Link href="/onboard" className="font-mono-data text-xs text-dim tracking-widest hover:text-muted transition-colors">
          ← REDO ONBOARDING
        </Link>
      </div>

      <div className="px-6 md:px-10 py-12 max-w-5xl mx-auto">

        {/* Hero */}
        <div className="mb-12" style={{ animation: 'fadeUp 0.5s ease forwards' }}>
          <p className="font-mono-data text-xs text-accent tracking-widest mb-3">YOUR PERSONALIZED PLAN</p>
          <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] text-white leading-none mb-4">
            {plan.title}
          </h1>
          <p className="text-muted font-body text-base max-w-2xl leading-relaxed">
            {plan.summary}
          </p>

          {/* Focus areas */}
          <div className="flex flex-wrap gap-2 mt-5">
            {plan.focusAreas.map(area => (
              <span key={area} className="font-mono-data text-xs text-accent tracking-widest px-3 py-1.5 border border-accent/30 bg-accent-dim rounded-sm">
                {area.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* First Session CTA */}
        <div
          className="mb-12 p-6 rounded-sm border border-accent/30 bg-accent-dim"
          style={{ animation: 'fadeUp 0.5s ease 0.1s forwards', opacity: 0 }}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="font-mono-data text-xs text-accent tracking-widest mb-2">
                ★ RECOMMENDED FIRST SESSION
              </p>
              <h3 className="font-display text-2xl text-white mb-1">
                {WORKOUT_TYPE_LABELS[rec.workoutType]} — {COACH_LABELS[rec.personality]}
              </h3>
              <p className="text-muted text-sm font-body max-w-lg">{rec.reason}</p>
            </div>
            <Link
              href={`/setup?type=${rec.workoutType}&personality=${rec.personality}&duration=${rec.duration}`}
              className="btn-accent px-6 py-3 rounded-sm font-body text-sm font-semibold whitespace-nowrap flex-shrink-0 inline-flex items-center gap-2"
            >
              START NOW
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div style={{ animation: 'fadeUp 0.5s ease 0.2s forwards', opacity: 0 }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-mono-data text-xs text-dim tracking-widest mb-1">YOUR PROGRAM</p>
              <h2 className="font-display text-3xl text-white">WEEKLY SCHEDULE</h2>
            </div>
            <Link
              href="/setup"
              className="btn-ghost px-4 py-2 rounded-sm font-mono-data text-xs tracking-widest"
            >
              CUSTOM SESSION →
            </Link>
          </div>

          <div className="space-y-2">
            {plan.weeklySchedule.map((day, i) => (
              <div
                key={day.day}
                className={`rounded-sm border transition-all duration-200 overflow-hidden
                  ${day.exercises.length === 0
                    ? 'border-border bg-surface/50'
                    : 'card-base card-hover'}`}
                style={{ animation: `fadeUp 0.4s ease ${0.05 * i}s forwards`, opacity: 0 }}
              >
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="font-mono-data text-xs text-dim tracking-widest w-10 flex-shrink-0">
                      {day.day.slice(0, 3).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <span className="font-display text-lg text-white block">{day.focus}</span>
                      {day.exercises.length > 0 && (
                        <span className="font-mono-data text-[10px] text-dim tracking-widest">
                          {day.exercises.length} EXERCISE{day.exercises.length !== 1 ? 'S' : ''} · {day.duration} MIN
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {day.exercises.length > 0 && (
                      <>
                        <span
                          className="font-mono-data text-[10px] tracking-widest px-2 py-1 rounded-sm"
                          style={{
                            color: INTENSITY_COLOR[day.intensity],
                            background: `${INTENSITY_COLOR[day.intensity]}15`,
                            border: `1px solid ${INTENSITY_COLOR[day.intensity]}30`,
                          }}
                        >
                          {INTENSITY_LABEL[day.intensity]}
                        </span>
                        <Link
                          href={`/setup?day=${day.day.toLowerCase()}`}
                          className="font-mono-data text-[10px] text-accent tracking-widest hover:underline"
                        >
                          START →
                        </Link>
                      </>
                    )}
                    {day.exercises.length === 0 && (
                      <span className="font-mono-data text-[10px] text-dim tracking-widest">REST</span>
                    )}
                  </div>
                </div>

                {/* Exercise list (collapsed by default, shown on hover via CSS or expand) */}
                {day.exercises.length > 0 && (
                  <div className="px-5 pb-4 border-t border-border/50">
                    <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {day.exercises.map((ex, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <span className="text-accent/40 mt-0.5 flex-shrink-0">—</span>
                          <div>
                            <span className="text-white text-sm font-body">{ex.name}</span>
                            {(ex.sets || ex.reps) && (
                              <span className="text-dim text-xs font-mono-data ml-2">
                                {ex.sets && `${ex.sets}×`}{ex.reps}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        {plan.tips.length > 0 && (
          <div className="mt-12 p-6 rounded-sm border border-border bg-surface"
            style={{ animation: 'fadeUp 0.5s ease 0.4s forwards', opacity: 0 }}>
            <p className="font-mono-data text-xs text-dim tracking-widest mb-4">COACH NOTES</p>
            <div className="space-y-3">
              {plan.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-accent font-mono-data text-xs mt-0.5 flex-shrink-0">0{i + 1}</span>
                  <p className="text-muted text-sm font-body leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center" style={{ animation: 'fadeUp 0.5s ease 0.5s forwards', opacity: 0 }}>
          <p className="text-dim text-sm font-body mb-4">Ready to meet your coach?</p>
          <Link
            href={`/setup?type=${rec.workoutType}&personality=${rec.personality}&duration=${rec.duration}`}
            className="btn-accent inline-flex items-center gap-3 text-base font-semibold px-10 py-5 rounded-sm font-body"
          >
            START FIRST SESSION
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </main>
  );
}
