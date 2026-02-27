import { NextResponse } from 'next/server';
import { personas } from '@/lib/personas';

const TAVUS_API_BASE = 'https://tavusapi.com/v2';

export async function POST() {
  const apiKey = process.env.TAVUS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TAVUS_API_KEY not configured' }, { status: 500 });
  }

  const results: Record<string, { persona_id: string; name: string } | { error: string }> = {};

  for (const [key, persona] of Object.entries(personas)) {
    const res = await fetch(`${TAVUS_API_BASE}/personas`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        persona_name: persona.name + ' — FitCoach AI',
        system_prompt: persona.systemPrompt,
        context: persona.context,
        layers: {
          perception: {
            visual_awareness_queries: persona.visualAwarenessQueries,
            audio_awareness_queries: persona.audioAwarenessQueries,
          },
        },
      }),
    });

    const data = await res.json();

    results[key] = res.ok
      ? { persona_id: data.persona_id, name: persona.name }
      : { error: data.message || 'Failed to create persona' };
  }

  return NextResponse.json({ success: true, results });
}
