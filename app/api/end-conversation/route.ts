import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.TAVUS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No API key' }, { status: 500 });

  const { conversationId } = await request.json();
  if (!conversationId) return NextResponse.json({ error: 'No conversation ID' }, { status: 400 });

  try {
    await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    });
  } catch {
    // Non-critical — session already recorded on client
  }

  return NextResponse.json({ success: true });
}
