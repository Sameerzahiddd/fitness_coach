'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FitnessLevel, Goal, Equipment, SessionDuration, UserProfile } from '@/lib/types';
import { GOAL_LABELS, EQUIPMENT_LABELS } from '@/lib/types';

const STEPS = ['About You', 'Your Goals', 'Your Setup'];

const FITNESS_LEVELS: { id: FitnessLevel; label: string; desc: string }[] = [
  { id: 'beginner', label: 'BEGINNER', desc: '0–6 months of consistent training' },
  { id: 'intermediate', label: 'INTERMEDIATE', desc: '6 months – 2 years of training' },
  { id: 'advanced', label: 'ADVANCED', desc: '2+ years, solid base of strength' },
];

const GOALS: Goal[] = ['weight-loss', 'build-muscle', 'improve-endurance', 'increase-flexibility', 'stress-relief', 'general-fitness'];
const EQUIPMENT_OPTIONS: Equipment[] = ['none', 'yoga-mat', 'resistance-bands', 'dumbbells', 'kettlebell', 'pull-up-bar', 'full-gym'];
const DURATIONS: SessionDuration[] = [5, 15, 30];

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>({
    name: '',
    age: undefined,
    fitnessLevel: undefined,
    goals: [],
    equipment: [],
    preferredDuration: 15,
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  function toggleGoal(goal: Goal) {
    setForm(f => ({
      ...f,
      goals: f.goals?.includes(goal)
        ? f.goals.filter(g => g !== goal)
        : [...(f.goals || []), goal],
    }));
  }

  function toggleEquipment(eq: Equipment) {
    if (eq === 'none') {
      setForm(f => ({ ...f, equipment: ['none'] }));
      return;
    }
    setForm(f => ({
      ...f,
      equipment: f.equipment?.includes(eq)
        ? f.equipment.filter(e => e !== eq && e !== 'none')
        : [...(f.equipment || []).filter(e => e !== 'none'), eq],
    }));
  }

  const canNext = () => {
    if (step === 0) return form.name && form.age && form.fitnessLevel;
    if (step === 1) return (form.goals?.length || 0) > 0;
    if (step === 2) return (form.equipment?.length || 0) > 0 && form.preferredDuration;
    return false;
  };

  async function handleSubmit() {
    setLoading(true);
    const profile = form as UserProfile;
    localStorage.setItem('fitcoach_user', JSON.stringify(profile));

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const { plan } = await res.json();
      localStorage.setItem('fitcoach_plan', JSON.stringify(plan));
    } catch {
      // Plan will use template fallback
    }

    router.push('/plan');
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="px-6 md:px-10 py-5 border-b border-border flex items-center justify-between">
        <span className="font-display text-lg tracking-widest text-white">
          FIT<span className="text-accent">COACH</span> AI
        </span>
        <span className="font-mono-data text-xs text-dim tracking-widest">
          STEP {step + 1} / {STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mx-0">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step labels */}
      <div className="px-6 md:px-10 py-6 flex items-center gap-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold
              ${i < step ? 'step-done border-accent' : i === step ? 'step-active border-accent' : 'step-pending border-border'}`}>
              {i < step ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className={`font-mono-data text-[10px] tracking-widest hidden sm:block
              ${i === step ? 'text-accent' : i < step ? 'text-muted' : 'text-dim'}`}>
              {s.toUpperCase()}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 mx-1 ${i < step ? 'bg-accent/40' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 md:px-10 py-8 max-w-2xl w-full mx-auto">

        {/* Step 0 — About You */}
        {step === 0 && (
          <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-2">WHO ARE YOU?</h2>
            <p className="text-muted text-sm font-body mb-10">Tell us a bit so we can build your plan.</p>

            <div className="space-y-6">
              <div>
                <label className="font-mono-data text-xs text-dim tracking-widest block mb-2">YOUR NAME</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-surface border border-border text-white placeholder-dim px-4 py-3 rounded-sm font-body focus:outline-none focus:border-accent transition-colors text-base"
                />
              </div>

              <div>
                <label className="font-mono-data text-xs text-dim tracking-widest block mb-2">YOUR AGE</label>
                <input
                  type="number"
                  placeholder="e.g. 28"
                  min={13}
                  max={100}
                  value={form.age || ''}
                  onChange={e => setForm(f => ({ ...f, age: parseInt(e.target.value) || undefined }))}
                  className="w-full bg-surface border border-border text-white placeholder-dim px-4 py-3 rounded-sm font-body focus:outline-none focus:border-accent transition-colors text-base"
                />
              </div>

              <div>
                <label className="font-mono-data text-xs text-dim tracking-widest block mb-3">FITNESS LEVEL</label>
                <div className="space-y-2">
                  {FITNESS_LEVELS.map(({ id, label, desc }) => (
                    <button
                      key={id}
                      onClick={() => setForm(f => ({ ...f, fitnessLevel: id }))}
                      className={`w-full text-left px-5 py-4 rounded-sm border transition-all duration-200 font-body
                        ${form.fitnessLevel === id
                          ? 'card-selected bg-accent-dim'
                          : 'card-base card-hover'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-lg text-white">{label}</span>
                        {form.fitnessLevel === id && (
                          <span className="text-accent">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <span className="text-dim text-xs">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Goals */}
        {step === 1 && (
          <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-2">YOUR GOALS</h2>
            <p className="text-muted text-sm font-body mb-2">Select everything that applies — your plan adapts.</p>
            <p className="font-mono-data text-xs text-dim tracking-widest mb-8">
              SELECTED: {form.goals?.length || 0}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOALS.map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`text-left px-5 py-4 rounded-sm border transition-all duration-200
                    ${form.goals?.includes(goal)
                      ? 'card-selected bg-accent-dim'
                      : 'card-base card-hover'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl text-white">{GOAL_LABELS[goal]}</span>
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0
                      ${form.goals?.includes(goal) ? 'bg-accent border-accent' : 'border-border-lit'}`}>
                      {form.goals?.includes(goal) && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Setup */}
        {step === 2 && (
          <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-2">YOUR SETUP</h2>
            <p className="text-muted text-sm font-body mb-10">What equipment do you have access to?</p>

            <div className="mb-8">
              <label className="font-mono-data text-xs text-dim tracking-widest block mb-3">
                EQUIPMENT (select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EQUIPMENT_OPTIONS.map(eq => (
                  <button
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={`text-left px-4 py-3 rounded-sm border transition-all duration-200
                      ${form.equipment?.includes(eq)
                        ? 'card-selected bg-accent-dim'
                        : 'card-base card-hover'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center
                        ${form.equipment?.includes(eq) ? 'bg-accent border-accent' : 'border-border-lit'}`}>
                        {form.equipment?.includes(eq) && (
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className="font-body text-sm text-white">{EQUIPMENT_LABELS[eq]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono-data text-xs text-dim tracking-widest block mb-3">
                PREFERRED SESSION DURATION
              </label>
              <div className="flex gap-3">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setForm(f => ({ ...f, preferredDuration: d }))}
                    className={`flex-1 py-4 rounded-sm border transition-all duration-200
                      ${form.preferredDuration === d
                        ? 'card-selected bg-accent-dim'
                        : 'card-base card-hover'}`}
                  >
                    <div className="font-display text-3xl text-white">{d}</div>
                    <div className="font-mono-data text-[10px] text-dim tracking-widest">MIN</div>
                    {d === 5 && <div className="font-mono-data text-[9px] text-accent tracking-widest mt-1">DEMO</div>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 md:px-10 py-6 border-t border-border flex items-center justify-between max-w-2xl w-full mx-auto">
        <button
          onClick={() => setStep(s => s - 1)}
          className={`btn-ghost px-6 py-3 rounded-sm font-body text-sm ${step === 0 ? 'invisible' : ''}`}
        >
          ← BACK
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="btn-accent px-8 py-3 rounded-sm font-body text-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            NEXT →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canNext() || loading}
            className="btn-accent px-8 py-3 rounded-sm font-body text-sm disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3" />
                  <path d="M21 12a9 9 0 00-9-9" />
                </svg>
                GENERATING PLAN...
              </>
            ) : (
              'BUILD MY PLAN →'
            )}
          </button>
        )}
      </div>
    </main>
  );
}
