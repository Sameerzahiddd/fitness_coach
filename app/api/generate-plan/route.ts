import { NextResponse } from 'next/server';
import type { UserProfile, WorkoutPlan } from '@/lib/types';

const GOAL_DESCRIPTIONS: Record<string, string> = {
  'weight-loss': 'burn fat and improve cardiovascular fitness',
  'build-muscle': 'increase muscle mass and strength',
  'improve-endurance': 'enhance cardiovascular endurance and stamina',
  'increase-flexibility': 'improve mobility, flexibility and movement quality',
  'stress-relief': 'reduce stress through mindful movement',
  'general-fitness': 'build overall health and fitness',
};

export async function POST(request: Request) {
  const profile: UserProfile = await request.json();

  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // If no Anthropic key, generate a template-based plan
  if (!anthropicKey) {
    return NextResponse.json({ plan: generateTemplatePlan(profile) });
  }

  try {
    const goalDescriptions = profile.goals
      .map(g => GOAL_DESCRIPTIONS[g] || g)
      .join(', ');

    const equipmentList = profile.equipment.includes('full-gym')
      ? 'full gym access (all equipment)'
      : profile.equipment.includes('none')
        ? 'no equipment (bodyweight only)'
        : `limited equipment: ${profile.equipment.join(', ')}`;

    const prompt = `You are an expert personal trainer. Create a personalized weekly workout plan for this person.

USER PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}
- Fitness Level: ${profile.fitnessLevel}
- Goals: ${goalDescriptions}
- Equipment: ${equipmentList}
- Preferred session duration: ${profile.preferredDuration} minutes

Return a JSON object with exactly this structure (no markdown, just valid JSON):
{
  "title": "Personalized plan title for ${profile.name}",
  "summary": "2-3 sentence personalized summary of the plan and why it suits them",
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "Upper Body Strength",
      "exercises": [
        { "name": "Push-Ups", "sets": 3, "reps": "10-15", "rest": "60s", "notes": "Keep core tight" }
      ],
      "duration": 30,
      "intensity": "moderate"
    }
  ],
  "focusAreas": ["Core Strength", "Cardiovascular Endurance"],
  "tips": ["Tip 1 specific to their situation", "Tip 2"],
  "firstSessionRecommendation": {
    "workoutType": "full-body",
    "personality": "hype-beast",
    "duration": 15,
    "reason": "Why this first session makes sense for them"
  }
}

REQUIREMENTS:
- Create a 5-day plan (Mon-Fri) with 2 rest days (Sat-Sun shown as rest)
- Match intensity and exercises to their fitness level
- Respect their equipment constraints
- Choose workoutType from: upper-body, lower-body, core, full-body, stretch
- Choose personality from: drill-sergeant, hype-beast, zen-master
- Make exercises realistic and achievable
- The firstSessionRecommendation should be the best intro session`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const aiData = await response.json();
    const text = aiData.content?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const plan: WorkoutPlan = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ plan });
  } catch (err) {
    console.error('Plan generation error, using template:', err);
    return NextResponse.json({ plan: generateTemplatePlan(profile) });
  }
}

function generateTemplatePlan(profile: UserProfile): WorkoutPlan {
  const isBeginnerOrAbove = profile.fitnessLevel === 'beginner';
  const primaryGoal = profile.goals[0] || 'general-fitness';
  const hasEquipment = !profile.equipment.includes('none');

  const templates: Record<string, WorkoutPlan> = {
    'build-muscle': {
      title: `${profile.name}'s Muscle Building Plan`,
      summary: `Your plan is designed to progressively build strength and muscle mass over 8 weeks. Each session is structured for maximum hypertrophy with controlled intensity tailored to your ${profile.fitnessLevel} level.`,
      weeklySchedule: [
        {
          day: 'Monday', focus: 'Upper Body Push', duration: profile.preferredDuration, intensity: 'high',
          exercises: [
            { name: 'Push-Ups', sets: 4, reps: isBeginnerOrAbove ? '8-10' : '12-15', rest: '90s' },
            { name: 'Pike Push-Ups', sets: 3, reps: '8-12', rest: '60s', notes: 'Targets shoulders' },
            { name: 'Tricep Dips', sets: 3, reps: '10-12', rest: '60s' },
          ],
        },
        {
          day: 'Tuesday', focus: 'Lower Body', duration: profile.preferredDuration, intensity: 'high',
          exercises: [
            { name: 'Squats', sets: 4, reps: '12-15', rest: '90s' },
            { name: 'Lunges', sets: 3, reps: '10 each leg', rest: '60s' },
            { name: 'Glute Bridges', sets: 3, reps: '15-20', rest: '45s' },
          ],
        },
        { day: 'Wednesday', focus: 'Active Recovery', duration: 20, intensity: 'light', exercises: [{ name: 'Light walking or yoga', notes: 'Keep moving, stay loose' }] },
        {
          day: 'Thursday', focus: 'Upper Body Pull & Core', duration: profile.preferredDuration, intensity: 'high',
          exercises: [
            { name: 'Inverted Rows (table)', sets: 3, reps: '8-12', rest: '90s' },
            { name: 'Plank', sets: 3, reps: '30-45s', rest: '45s' },
            { name: 'Mountain Climbers', sets: 3, reps: '20 reps', rest: '45s' },
          ],
        },
        {
          day: 'Friday', focus: 'Full Body Circuit', duration: profile.preferredDuration, intensity: 'moderate',
          exercises: [
            { name: 'Burpees', sets: 3, reps: '10', rest: '60s' },
            { name: 'Jump Squats', sets: 3, reps: '15', rest: '60s' },
            { name: 'Push-Up to T-Rotation', sets: 3, reps: '8 each side', rest: '60s' },
          ],
        },
        { day: 'Saturday', focus: 'Rest', duration: 0, intensity: 'light', exercises: [] },
        { day: 'Sunday', focus: 'Rest', duration: 0, intensity: 'light', exercises: [] },
      ],
      focusAreas: ['Upper Body Strength', 'Lower Body Power', 'Core Stability'],
      tips: [
        'Progressive overload is key — add 1 rep or hold 1 second longer each week',
        'Protein intake matters: aim for 0.8-1g per lb of bodyweight',
        'Sleep 7-9 hours — that\'s when muscle is built',
      ],
      firstSessionRecommendation: {
        workoutType: 'full-body',
        personality: 'drill-sergeant',
        duration: profile.preferredDuration,
        reason: 'A full-body session gives your AI coach the best view of your overall strength baseline.',
      },
    },
    'weight-loss': {
      title: `${profile.name}'s Fat Loss Plan`,
      summary: `A high-intensity metabolic plan designed to maximize calorie burn and preserve muscle. Your ${profile.fitnessLevel} level is the perfect starting point for rapid transformation.`,
      weeklySchedule: [
        {
          day: 'Monday', focus: 'HIIT Cardio + Core', duration: profile.preferredDuration, intensity: 'high',
          exercises: [
            { name: 'Jumping Jacks', sets: 3, reps: '30s on, 15s off', rest: '15s' },
            { name: 'High Knees', sets: 3, reps: '30s on, 15s off', rest: '15s' },
            { name: 'Plank', sets: 3, reps: '30s', rest: '30s' },
          ],
        },
        {
          day: 'Tuesday', focus: 'Lower Body Burn', duration: profile.preferredDuration, intensity: 'high',
          exercises: [
            { name: 'Squat Jumps', sets: 4, reps: '15', rest: '60s' },
            { name: 'Reverse Lunges', sets: 3, reps: '12 each leg', rest: '45s' },
            { name: 'Wall Sit', sets: 3, reps: '45s', rest: '45s' },
          ],
        },
        { day: 'Wednesday', focus: 'Active Recovery Walk', duration: 30, intensity: 'light', exercises: [{ name: '30-minute brisk walk' }] },
        {
          day: 'Thursday', focus: 'Upper Body + Cardio Intervals', duration: profile.preferredDuration, intensity: 'high',
          exercises: [
            { name: 'Push-Up Circuit', sets: 4, reps: '10-15', rest: '45s' },
            { name: 'Burpees', sets: 3, reps: '10', rest: '60s' },
          ],
        },
        {
          day: 'Friday', focus: 'Full Body AMRAP', duration: profile.preferredDuration, intensity: 'high',
          exercises: [
            { name: 'Complete as many rounds as possible in time', notes: '5 push-ups → 10 squats → 15 jumping jacks' },
          ],
        },
        { day: 'Saturday', focus: 'Rest', duration: 0, intensity: 'light', exercises: [] },
        { day: 'Sunday', focus: 'Rest', duration: 0, intensity: 'light', exercises: [] },
      ],
      focusAreas: ['Metabolic Conditioning', 'Cardiovascular Fitness', 'Core Strength'],
      tips: [
        'Consistency beats perfection — showing up 80% is better than 100% once a month',
        'Focus on nutrition: what you eat matters as much as workouts',
        'The AI coach will monitor your heart rate and fatigue in real-time',
      ],
      firstSessionRecommendation: {
        workoutType: 'full-body',
        personality: 'hype-beast',
        duration: profile.preferredDuration,
        reason: 'High energy equals high calorie burn. The Hype Beast will keep your heart rate up.',
      },
    },
    'general-fitness': {
      title: `${profile.name}'s Balanced Fitness Plan`,
      summary: `A well-rounded plan that builds strength, endurance, and flexibility simultaneously. Perfect for your ${profile.fitnessLevel} level as a sustainable, long-term fitness foundation.`,
      weeklySchedule: [
        {
          day: 'Monday', focus: 'Full Body Strength', duration: profile.preferredDuration, intensity: 'moderate',
          exercises: [
            { name: 'Push-Ups', sets: 3, reps: '10-15', rest: '60s' },
            { name: 'Squats', sets: 3, reps: '15', rest: '60s' },
            { name: 'Plank', sets: 3, reps: '30s', rest: '30s' },
          ],
        },
        {
          day: 'Tuesday', focus: 'Cardio & Endurance', duration: profile.preferredDuration, intensity: 'moderate',
          exercises: [
            { name: 'Jumping Jacks + High Knees alternating', sets: 4, reps: '45s each', rest: '30s' },
          ],
        },
        { day: 'Wednesday', focus: 'Stretch & Mobility', duration: 20, intensity: 'light', exercises: [{ name: 'Full body stretch routine', notes: 'Hold each stretch 30s' }] },
        {
          day: 'Thursday', focus: 'Upper Body Focus', duration: profile.preferredDuration, intensity: 'moderate',
          exercises: [
            { name: 'Push-Up Variations', sets: 3, reps: '12', rest: '60s' },
            { name: 'Superman Hold', sets: 3, reps: '10s hold', rest: '45s' },
          ],
        },
        {
          day: 'Friday', focus: 'Lower Body & Core', duration: profile.preferredDuration, intensity: 'moderate',
          exercises: [
            { name: 'Squats', sets: 3, reps: '15', rest: '60s' },
            { name: 'Glute Bridges', sets: 3, reps: '20', rest: '45s' },
            { name: 'Dead Bug', sets: 3, reps: '10 each side', rest: '45s' },
          ],
        },
        { day: 'Saturday', focus: 'Rest', duration: 0, intensity: 'light', exercises: [] },
        { day: 'Sunday', focus: 'Rest', duration: 0, intensity: 'light', exercises: [] },
      ],
      focusAreas: ['Overall Strength', 'Cardiovascular Health', 'Flexibility'],
      tips: [
        'Consistency is everything — 3-4 sessions per week beats sporadic intense workouts',
        'Your AI coach monitors your form in real-time — trust its visual corrections',
        'Hydrate well before and after sessions',
      ],
      firstSessionRecommendation: {
        workoutType: 'full-body',
        personality: 'zen-master',
        duration: profile.preferredDuration,
        reason: 'A mindful approach to your first session helps establish correct movement patterns.',
      },
    },
  };

  // Pick the best template
  const template = templates[primaryGoal] || templates['general-fitness'];
  // Adjust for equipment
  if (!hasEquipment) {
    template.tips.push('All your exercises are bodyweight — your AI coach will help maximize bodyweight progressions');
  }

  return template;
}
