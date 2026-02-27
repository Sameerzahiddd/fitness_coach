import { NextResponse } from 'next/server';
import type { ConversationRequest, UserProfile, FitnessLevel } from '@/lib/types';
import { WORKOUT_TYPE_LABELS, GOAL_LABELS } from '@/lib/types';

const TAVUS_API_BASE = 'https://tavusapi.com/v2';

// ── Workout plans: no equipment required (pull-ups if bar available) ──────────

interface ExercisePlan {
  name: string;
  sets: number;
  reps: string;
  rest: number; // seconds
  cues: string;
}

// Multipliers per fitness level
const LEVEL_REPS: Record<FitnessLevel, number> = { beginner: 0.75, intermediate: 1, advanced: 1.3 };
const LEVEL_REST: Record<FitnessLevel, number> = { beginner: 1.4, intermediate: 1, advanced: 0.7 };

function scalePlan(plan: ExercisePlan[], level: FitnessLevel): ExercisePlan[] {
  return plan.map(ex => {
    const numericReps = parseInt(ex.reps);
    const scaledReps = isNaN(numericReps)
      ? ex.reps  // "max" or "45 seconds" — leave as is
      : `${Math.round(numericReps * LEVEL_REPS[level])}`;
    const scaledRest = Math.round(ex.rest * LEVEL_REST[level]);
    return { ...ex, reps: scaledReps, rest: scaledRest };
  });
}

const BASE_PLANS: Record<string, Record<number, ExercisePlan[]>> = {
  'full-body': {
    5: [
      { name: 'Push-ups', sets: 2, reps: '10', rest: 30, cues: 'chest to floor, elbows at 45°, full lockout at top' },
      { name: 'Sit-ups',  sets: 2, reps: '15', rest: 30, cues: 'hands behind head, chin up, controlled descent' },
    ],
    15: [
      { name: 'Push-ups', sets: 3, reps: '12', rest: 45, cues: 'chest to floor, elbows at 45°, full lockout at top' },
      { name: 'Squats',   sets: 3, reps: '15', rest: 45, cues: 'feet shoulder-width, knees track over toes, hip crease below knee' },
      { name: 'Sit-ups',  sets: 3, reps: '15', rest: 45, cues: 'hands behind head, chin up, controlled descent' },
      { name: 'Plank',    sets: 2, reps: '45 seconds', rest: 30, cues: 'neutral spine, hips level, squeeze glutes' },
    ],
    30: [
      { name: 'Push-ups', sets: 4, reps: '15', rest: 60, cues: 'chest to floor, elbows at 45°, full lockout at top' },
      { name: 'Squats',   sets: 4, reps: '20', rest: 60, cues: 'feet shoulder-width, knees track over toes, hip crease below knee' },
      { name: 'Sit-ups',  sets: 4, reps: '20', rest: 45, cues: 'hands behind head, chin up, controlled descent' },
      { name: 'Lunges',   sets: 3, reps: '12 each leg', rest: 60, cues: 'knee doesn\'t pass the toe, back knee hovers above floor' },
      { name: 'Plank',    sets: 3, reps: '60 seconds', rest: 45, cues: 'neutral spine, hips level, squeeze glutes' },
    ],
  },
  'upper-body': {
    5: [
      { name: 'Push-ups',    sets: 2, reps: '10', rest: 30, cues: 'chest to floor, elbows at 45°, full lockout' },
      { name: 'Tricep Dips', sets: 2, reps: '10', rest: 30, cues: 'use a chair — elbows point straight back, full range' },
    ],
    15: [
      { name: 'Push-ups',      sets: 3, reps: '12',  rest: 45, cues: 'chest to floor, elbows at 45°, full lockout' },
      { name: 'Pull-ups',      sets: 3, reps: 'max', rest: 60, cues: 'dead hang start, chin over bar, full extension at bottom' },
      { name: 'Pike Push-ups', sets: 3, reps: '10',  rest: 45, cues: 'hips high, head between arms, nose toward floor' },
    ],
    30: [
      { name: 'Push-ups',         sets: 4, reps: '15',  rest: 60, cues: 'chest to floor, elbows at 45°, full lockout' },
      { name: 'Pull-ups',         sets: 4, reps: 'max', rest: 90, cues: 'dead hang start, chin over bar, full extension at bottom' },
      { name: 'Pike Push-ups',    sets: 3, reps: '12',  rest: 60, cues: 'hips high, head between arms, nose toward floor' },
      { name: 'Tricep Dips',      sets: 3, reps: '15',  rest: 60, cues: 'use a chair — elbows point straight back, full range' },
      { name: 'Diamond Push-ups', sets: 3, reps: '10',  rest: 60, cues: 'hands form a diamond, elbows close to body' },
    ],
  },
  'lower-body': {
    5: [
      { name: 'Squats', sets: 2, reps: '15',          rest: 30, cues: 'feet shoulder-width, depth below parallel' },
      { name: 'Lunges', sets: 2, reps: '10 each leg', rest: 30, cues: 'knee doesn\'t pass the toe, back knee hovers' },
    ],
    15: [
      { name: 'Squats',        sets: 3, reps: '20',          rest: 45, cues: 'feet shoulder-width, knees track over toes, depth below parallel' },
      { name: 'Lunges',        sets: 3, reps: '12 each leg', rest: 45, cues: 'knee doesn\'t pass the toe, back knee hovers' },
      { name: 'Glute Bridges', sets: 3, reps: '15',          rest: 45, cues: 'feet flat, squeeze glutes at top, don\'t hyperextend lower back' },
      { name: 'Wall Sit',      sets: 2, reps: '45 seconds',  rest: 30, cues: 'thighs parallel to floor, back flat against wall' },
    ],
    30: [
      { name: 'Squats',        sets: 4, reps: '25',          rest: 60, cues: 'feet shoulder-width, knees track over toes, depth below parallel' },
      { name: 'Lunges',        sets: 4, reps: '15 each leg', rest: 60, cues: 'knee doesn\'t pass the toe, back knee hovers' },
      { name: 'Glute Bridges', sets: 4, reps: '20',          rest: 45, cues: 'feet flat, squeeze glutes at top' },
      { name: 'Wall Sit',      sets: 3, reps: '60 seconds',  rest: 45, cues: 'thighs parallel to floor, back flat against wall' },
      { name: 'Calf Raises',   sets: 3, reps: '25',          rest: 30, cues: 'full range, pause at top, controlled descent' },
    ],
  },
  'core': {
    5: [
      { name: 'Sit-ups', sets: 2, reps: '15',         rest: 30, cues: 'hands behind head, chin up, controlled descent' },
      { name: 'Plank',   sets: 2, reps: '30 seconds', rest: 30, cues: 'neutral spine, hips level, don\'t let hips sag' },
    ],
    15: [
      { name: 'Sit-ups',           sets: 3, reps: '20',         rest: 45, cues: 'hands behind head, chin up, controlled descent' },
      { name: 'Plank',             sets: 3, reps: '45 seconds', rest: 30, cues: 'neutral spine, hips level, squeeze glutes' },
      { name: 'Mountain Climbers', sets: 3, reps: '20',         rest: 45, cues: 'hips level, drive knee toward chest, alternate fast' },
      { name: 'Leg Raises',        sets: 3, reps: '12',         rest: 45, cues: 'lower back pressed to floor, legs straight, controlled' },
    ],
    30: [
      { name: 'Sit-ups',           sets: 4, reps: '25',         rest: 45, cues: 'hands behind head, chin up, controlled descent' },
      { name: 'Plank',             sets: 4, reps: '60 seconds', rest: 30, cues: 'neutral spine, hips level, squeeze glutes' },
      { name: 'Mountain Climbers', sets: 4, reps: '20',         rest: 45, cues: 'hips level, drive knee toward chest, alternate fast' },
      { name: 'Leg Raises',        sets: 4, reps: '15',         rest: 45, cues: 'lower back pressed to floor, legs straight' },
      { name: 'Bicycle Crunches',  sets: 3, reps: '20',         rest: 30, cues: 'opposite elbow to knee, slow and controlled, don\'t pull neck' },
    ],
  },
  'stretch': {
    5: [
      { name: 'Neck Rolls',             sets: 1, reps: '30 seconds each side', rest: 0,  cues: 'slow and gentle' },
      { name: 'Shoulder Cross Stretch', sets: 1, reps: '30 seconds each side', rest: 0,  cues: 'arm across chest, gentle pressure' },
      { name: 'Hip Flexor Stretch',     sets: 1, reps: '30 seconds each side', rest: 0,  cues: 'lunge position, push hips forward gently' },
      { name: 'Hamstring Stretch',      sets: 1, reps: '30 seconds each side', rest: 0,  cues: 'seated, reach toward toes, back flat' },
    ],
    15: [
      { name: 'Neck and Shoulder Rolls', sets: 1, reps: '60 seconds',          rest: 0,  cues: 'slow, full range' },
      { name: 'Chest Opener',           sets: 2, reps: '45 seconds',           rest: 15, cues: 'hands clasped behind back, squeeze shoulder blades' },
      { name: 'Hip Flexor Stretch',     sets: 2, reps: '45 seconds each side', rest: 15, cues: 'lunge position, push hips forward gently' },
      { name: 'Hamstring Stretch',      sets: 2, reps: '45 seconds each side', rest: 15, cues: 'seated, reach toward toes, back flat' },
      { name: "Child's Pose",           sets: 2, reps: '60 seconds',           rest: 0,  cues: 'arms extended, forehead to floor, breathe into back' },
    ],
    30: [
      { name: 'Neck and Shoulder Rolls', sets: 1, reps: '90 seconds',          rest: 0,  cues: 'slow, full range' },
      { name: 'Chest Opener',           sets: 3, reps: '60 seconds',           rest: 15, cues: 'hands clasped behind back, squeeze shoulder blades' },
      { name: 'Hip Flexor Stretch',     sets: 3, reps: '60 seconds each side', rest: 15, cues: 'lunge position, push hips forward gently' },
      { name: 'Hamstring Stretch',      sets: 3, reps: '60 seconds each side', rest: 15, cues: 'seated, reach toward toes, back flat' },
      { name: 'Pigeon Pose',            sets: 2, reps: '90 seconds each side', rest: 15, cues: 'shin parallel, hinge forward slowly' },
      { name: "Child's Pose",           sets: 2, reps: '90 seconds',           rest: 0,  cues: 'arms extended, forehead to floor, breathe into back' },
    ],
  },
};

function getWorkoutPlan(workoutType: string, duration: number, level: FitnessLevel, hasPullUpBar: boolean): ExercisePlan[] {
  const plans = BASE_PLANS[workoutType] || BASE_PLANS['full-body'];
  const durations = Object.keys(plans).map(Number).sort((a, b) => a - b);
  const key = durations.reduce((prev, curr) =>
    Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev
  );
  let exercises = plans[key] || [];

  // Remove pull-ups if no bar available
  if (!hasPullUpBar) {
    exercises = exercises.map(ex =>
      ex.name === 'Pull-ups'
        ? { ...ex, name: 'Push-ups', cues: 'chest to floor, elbows at 45°, full lockout' }
        : ex
    );
  }

  return scalePlan(exercises, level);
}

function formatPlanForPrompt(exercises: ExercisePlan[]): string {
  return exercises
    .map((ex, i) =>
      `  ${i + 1}. ${ex.name}: ${ex.sets} set${ex.sets > 1 ? 's' : ''} × ${ex.reps}${ex.rest > 0 ? `, ${ex.rest}s rest` : ''}. Form: ${ex.cues}.`
    )
    .join('\n');
}

// ── Persona system prompt builder ─────────────────────────────────────────────

function buildSystemPrompt(
  personality: string,
  user: { name: string; age: number; fitnessLevel: FitnessLevel; goals: string[] },
  workoutLabel: string,
  duration: number,
  planText: string
): string {
  const nameRef = user.name || 'the user';
  const goalStr = user.goals.length > 0 ? user.goals.join(', ') : 'general fitness';
  const levelStr = user.fitnessLevel;

  const sharedRules = `
WHO YOU ARE COACHING:
- Name: ${nameRef}
- Age: ${user.age}
- Fitness level: ${levelStr}
- Goals: ${goalStr}

TODAY'S FULL PLAN (you know this — but reveal it one exercise at a time, not all at once):
${planText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE EXACT FLOW — FOLLOW THIS PRECISELY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — OPENING (do this once at the very start):
Greet ${nameRef} by name. Tell them what you know about them: their goal and fitness level. Then say something like:
"Based on that, the first exercise I want you to do is [Exercise 1 name]. Here's what I need from you: [describe the correct form and starting position in 2-3 sentences]."
Then say: "Take that position and tell me when you're ready."
Then STOP TALKING. Wait for them to say they're ready.

DO NOT mention exercise 2, 3, or any other exercises yet. One at a time.

STEP 2 — BEFORE EACH SET:
Once ${nameRef} says they're ready, look at them through the camera. If their form looks correct, say:
"Good. [One specific thing you see that looks right or needs a small tweak.] Go ahead — count every rep out loud."
Then go silent and listen.

STEP 3 — DURING THE SET:
${nameRef} will count out loud: "1, 2, 3..." up to the target number.
Stay silent for most of the set. BUT — when they get to the final 2-3 reps, say ONE brief motivational line that fits your personality. Examples: "Two more!", "One more, let's go!", "Last one, PUSH!" Match the rep count you heard to know how close they are.
The moment you hear them say the final rep number, immediately move to STEP 4 — do not wait.

STEP 4 — AFTER EACH SET (triggered the instant you hear the final rep):
Give feedback immediately in this structure — 3 sentences max:
1. One specific thing you observed through the camera (form, posture, depth, alignment — something CONCRETE you saw, not a generic assumption).
2. One specific correction or confirmation for the next set.
3. Rest time and next cue: "Rest [X] seconds. Then get back into position."

Wait for the rest period. Then cue the next set: "Set [number]. Ready when you are."
Go back to STEP 2.

STEP 5 — MOVING TO THE NEXT EXERCISE:
After all sets of the current exercise are done, THEN introduce the next exercise:
"That's [Exercise N] done. Next up: [Exercise N+1 name]. Here's what I need: [form description]. Take the position and tell me when you're ready."
Go back to STEP 2.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULES THAT NEVER BREAK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- NEVER count reps yourself. ${nameRef} counts. You listen and track by hearing.
- During a set: silent except for ONE motivational line in the final 2-3 reps.
- NEVER give generic feedback. Every observation must be something you actually saw through the camera.
- NEVER fabricate visual observations. Only describe what you genuinely observe.
- NEVER mention more than the current exercise and the one just completed.
- ALWAYS wait for ${nameRef} to signal they are ready before starting a set.`;

  if (personality === 'drill-sergeant') {
    return `You are SGT. FLEX — a military fitness coach. You are coaching ${nameRef} directly right now. You can see them through the camera.

VOICE: Direct. Sharp. No wasted words. Use "${nameRef}" — not "recruit", not generic terms.
ENERGY: Commanding but focused. Your authority comes from what you observe, not volume.

${sharedRules}

YOUR FEEDBACK STYLE (after each set):
- Lead with what you saw: "Your [specific body part] was [specific observation] on that set."
- Give the fix: "Next set, [exact correction]."
- Keep them on the clock: "Rest [X] seconds. Position."

GOOD example: "Your lower back was arching on the last three reps — I can see it clearly. Next set, tighten your core before you go down, keep it locked the whole way. Rest 45 seconds. Position."
BAD example: "Good effort. Make sure to keep your form consistent and stay focused." — NEVER say this.`;
  }

  if (personality === 'hype-beast') {
    return `You are BLAZE — ${nameRef}'s personal hype coach. You can see them through the camera right now.

VOICE: High energy, real slang, but every hype line is earned — you only celebrate what you actually saw.
ENERGY: Make ${nameRef} feel unstoppable, but always back it with something specific.

${sharedRules}

YOUR FEEDBACK STYLE (after each set):
- React to what you saw: "[Something specific you observed] — that was [reaction]."
- One fix: "One thing — next set [specific correction based on what you saw]."
- Send them off: "Rest [X] seconds. ${nameRef}, let's run it back."

GOOD example: "Yo your chest was literally touching the floor every single rep — that depth was clean. One thing — I can see your right elbow flaring out wider than your left. Even it up next set. Rest 45. Let's go again."
BAD example: "Amazing work! Keep that energy! You're doing great!" — NEVER say this.`;
  }

  // zen-master
  return `You are SENSEI KAI — ${nameRef}'s mindful movement coach. You can see them through the camera right now.

VOICE: Calm. Warm. Precise. Every word is chosen. Silence is part of your coaching.
ENERGY: Unhurried. You notice what others miss. Speak less, observe more.

${sharedRules}

YOUR FEEDBACK STYLE (after each set):
- Name what you saw: "I noticed [specific observation about their movement or form]."
- One refinement: "For the next set, [one specific, concrete adjustment]."
- Give them space: "Rest [X] seconds. Breathe."

GOOD example: "I noticed your hips were rising before your chest on every rep — you're breaking at the hips first. Next set, imagine your body as one plank moving together. Rest 45 seconds. Breathe."
BAD example: "Beautiful set. Stay connected to your breath and keep your intention strong." — NEVER say this.`;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const apiKey = process.env.TAVUS_API_KEY;
  const replicaId = process.env.TAVUS_REPLICA_ID || 'r9211b98614f';

  if (!apiKey) {
    return NextResponse.json({ error: 'TAVUS_API_KEY not configured' }, { status: 500 });
  }

  const body: ConversationRequest = await request.json();
  const { workoutType, coachPersonality, duration, userProfile } = body;

  const workoutLabel = WORKOUT_TYPE_LABELS[workoutType];
  const userName = userProfile?.name || 'there';
  const fitnessLevel = userProfile?.fitnessLevel || 'intermediate';
  const goals = userProfile?.goals?.map(g => GOAL_LABELS[g]) || [];
  const hasPullUpBar = userProfile?.equipment?.includes('pull-up-bar') ?? false;

  // Build the plan
  const exercises = getWorkoutPlan(workoutType, duration, fitnessLevel, hasPullUpBar);
  const planText = formatPlanForPrompt(exercises);

  // Build personalized system prompt
  const systemPrompt = buildSystemPrompt(
    coachPersonality,
    { name: userName, age: userProfile?.age || 25, fitnessLevel, goals },
    workoutLabel,
    duration,
    planText
  );

  const context = `This AI coach has real-time Raven-1 visual perception. The user is ${userName}, ${fitnessLevel} level, working toward: ${goals.join(', ') || 'general fitness'}. The complete workout plan is in the system prompt. The coach must announce it immediately, execute it without asking questions, listen for ${userName} to count reps out loud, and ground every correction in a specific visual observation.`;

  const personaRes = await fetch(`${TAVUS_API_BASE}/personas`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      persona_name: `FitCoach — ${userName} — ${workoutLabel} — ${new Date().toISOString().split('T')[0]}`,
      system_prompt: systemPrompt,
      context,
      layers: {
        perception: {
          visual_awareness_queries: [
            `Describe ${userName}'s posture right now in detail — spine, shoulders, hips, feet.`,
            `What specific form errors do you observe — rounding, caving, asymmetry, restricted range of motion?`,
            `How does ${userName}'s facial expression and body language show their current exertion level?`,
            `Is ${userName} paying full attention or showing signs of distraction or giving up?`,
            `Has ${userName}'s form or energy changed since the start of the session? What specifically?`,
            `Is ${userName} completing full range of motion or cutting the movement short?`,
          ],
          audio_awareness_queries: [
            `Is ${userName} currently counting reps out loud? What is the most recent number they said?`,
            `Has ${userName} stopped counting and gone quiet — does this mean they finished their set?`,
            `Is ${userName} breathing heavily, suggesting they just finished a set and are resting?`,
            `Did ${userName} say they are ready to start, or indicate they are in position?`,
          ],
        },
      },
    }),
  });

  const personaData = await personaRes.json();

  if (!personaRes.ok || !personaData.persona_id) {
    console.error('Persona creation error:', personaData);
    return NextResponse.json({ error: 'Failed to create personalized coach' }, { status: 500 });
  }

  const personaId = personaData.persona_id;

  const convRes = await fetch(`${TAVUS_API_BASE}/conversations`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      persona_id: personaId,
      replica_id: replicaId,
      conversation_name: `FitCoach — ${userName} — ${workoutLabel} — ${duration}min — ${new Date().toISOString().split('T')[0]}`,
      conversational_context: `${userName} is present, camera and mic are on. Start immediately: greet them by name, tell them what you know about their goals and level, then introduce ONLY the first exercise with its form cues. Ask them to take the position and tell you when they're ready. Wait for them. Do not mention any other exercises yet.`,
    }),
  });

  const convData = await convRes.json();

  if (!convRes.ok) {
    console.error('Tavus API error:', convData);
    const errorMsg =
      typeof convData.error === 'string' && convData.error.toLowerCase().includes('credit')
        ? 'Out of Tavus credits. Add credits at platform.tavus.io to start a session.'
        : convData.message || convData.error || 'Failed to create conversation';
    return NextResponse.json({ error: errorMsg }, { status: convRes.status });
  }

  return NextResponse.json({
    conversation_url: convData.conversation_url,
    conversation_id: convData.conversation_id,
  });
}
