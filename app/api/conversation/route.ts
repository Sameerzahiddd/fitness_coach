import { NextResponse } from 'next/server';
import type { ConversationRequest } from '@/lib/types';
import { PERSONA_ENV_MAP } from '@/lib/personas';
import { WORKOUT_TYPE_LABELS } from '@/lib/types';

const TAVUS_API_BASE = 'https://tavusapi.com/v2';

export async function POST(request: Request) {
  const apiKey = process.env.TAVUS_API_KEY;
  const replicaId = process.env.TAVUS_REPLICA_ID || 'r79e1c033f';

  if (!apiKey) {
    return NextResponse.json({ error: 'TAVUS_API_KEY not configured' }, { status: 500 });
  }

  const body: ConversationRequest = await request.json();
  const { workoutType, coachPersonality, duration, userName } = body;

  // Resolve persona ID
  const envVarName = PERSONA_ENV_MAP[coachPersonality];
  const personaId = process.env[envVarName];

  if (!personaId) {
    return NextResponse.json(
      {
        error: `Persona not configured. Please run POST /api/setup-personas first and add ${envVarName} to .env.local`,
      },
      { status: 400 }
    );
  }

  const workoutLabel = WORKOUT_TYPE_LABELS[workoutType];
  const userGreeting = userName ? `The user's name is ${userName}. ` : '';

  const conversationalContext = `${userGreeting}The user has selected a ${workoutLabel} workout for ${duration} minutes. ${
    duration === 5
      ? 'This is a quick demo session — get straight to the action.'
      : duration === 15
        ? 'This is a focused session. Move efficiently through warm-up, 2-3 working sets, and cool-down.'
        : 'This is a full session. Take time for thorough warm-up, 3-4 working sets with progression, and proper cool-down.'
  } Watch the user's form carefully through the camera and actively reference what you observe. Begin by greeting them and confirming today's plan.`;

  const conversationName = `FitCoach — ${workoutLabel} — ${duration}min — ${new Date().toISOString().split('T')[0]}`;

  const payload = {
    persona_id: personaId,
    replica_id: replicaId,
    conversation_name: conversationName,
    conversational_context: conversationalContext,
  };

  const res = await fetch(`${TAVUS_API_BASE}/conversations`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Tavus API error:', data);
    return NextResponse.json(
      { error: data.message || 'Failed to create conversation' },
      { status: res.status }
    );
  }

  return NextResponse.json({
    conversation_url: data.conversation_url,
    conversation_id: data.conversation_id,
  });
}
