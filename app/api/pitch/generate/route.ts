import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a music PR professional helping an independent African artist pitch their music to media contacts.

Write a professional pitch email. Follow these rules:
- 150 to 200 words maximum
- Warm, confident, and professional tone — not desperate or generic
- Address the specific gatekeeper by name and reference what they cover
- Include the song title, artist name, genre, and a brief description of the song
- End with the streaming/YouTube link and a clear ask (e.g. "I'd love for you to play it" or "I'd be grateful for a feature")
- Write in plain paragraphs — no bullet points, no markdown
- Do not include a subject line — only the email body`;

export async function POST(req: NextRequest) {
  let gatekeeperName: string;
  let gatekeeperType: string;
  let gatekeeperGenres: string;
  let songTitle: string;
  let artistName: string;
  let genre: string;
  let songDescription: string;
  let musicLink: string;

  try {
    const body = await req.json();
    gatekeeperName = (body.gatekeeperName ?? '').trim();
    gatekeeperType = (body.gatekeeperType ?? '').trim();
    gatekeeperGenres = (body.gatekeeperGenres ?? '').trim();
    songTitle = (body.songTitle ?? '').trim();
    artistName = (body.artistName ?? '').trim();
    genre = (body.genre ?? '').trim();
    songDescription = (body.songDescription ?? '').trim();
    musicLink = (body.musicLink ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!gatekeeperName || !songTitle || !artistName || !genre || !songDescription || !musicLink) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const userPrompt = `Write a pitch email to ${gatekeeperName}, a ${gatekeeperType} that focuses on ${gatekeeperGenres}.

Artist details:
- Song title: ${songTitle}
- Artist name: ${artistName}
- Genre: ${genre}
- About the song: ${songDescription}
- Music link: ${musicLink}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://businessyoo.com',
        'X-Title': 'SoundPitch',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter error:', await response.text());
      return NextResponse.json({ error: 'AI service error. Please try again.' }, { status: 502 });
    }

    const data = await response.json();
    const pitch: string = data?.choices?.[0]?.message?.content ?? '';

    if (!pitch) {
      return NextResponse.json({ error: 'Could not generate pitch. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ pitch });
  } catch (err) {
    console.error('Pitch generation error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
