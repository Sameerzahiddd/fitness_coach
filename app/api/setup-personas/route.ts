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
    const payload = {
      persona_name: persona.name + ' — FitCoach AI',
      system_prompt: persona.systemPrompt,
      context: persona.context,
      layers: {
        perception: {
          visual_awareness_queries: persona.visualAwarenessQueries,
          audio_awareness_queries: persona.audioAwarenessQueries,
        },
      },
    };

    const res = await fetch(`${TAVUS_API_BASE}/personas`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      results[key] = { error: data.message || 'Failed to create persona' };
    } else {
      results[key] = {
        persona_id: data.persona_id,
        name: persona.name,
      };
    }
  }

  // Build env var instructions
  const envLines: string[] = [];
  for (const [key, result] of Object.entries(results)) {
    if ('persona_id' in result) {
      const envKey = key === 'drill-sergeant'
        ? 'TAVUS_PERSONA_DRILL_SERGEANT_ID'
        : key === 'hype-beast'
          ? 'TAVUS_PERSONA_HYPE_BEAST_ID'
          : 'TAVUS_PERSONA_ZEN_MASTER_ID';
      envLines.push(`${envKey}=${result.persona_id}`);
    }
  }

  return NextResponse.json({
    success: true,
    results,
    nextStep: 'Copy these values into your .env.local file:',
    envVars: envLines.join('\n'),
  });
}
