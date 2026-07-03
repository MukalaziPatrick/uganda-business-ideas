// app/api/land/chat/route.ts
import { NextRequest } from 'next/server';
import { getLandListingById } from '@/lib/land/queries';
import { matchFaq } from '@/lib/land/faq';

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;
// Haiku is much cheaper than Sonnet and is plenty for simple plain-language Q&A.
// (Same model Farm Beacon moved to — see memory project_farm_beacon_haiku_model.md)
const MODEL = 'anthropic/claude-haiku-4.5';

// Stream a pre-written answer back in the same SSE shape the client parses,
// so a cached FAQ hit looks identical to a real model response — with zero API call.
function faqStream(answer: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const payload = { choices: [{ delta: { content: answer } }] };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}

const BASE_SYSTEM = `You are a friendly land guide for SafeLands UG — Uganda's verified land platform. Help buyers understand Ugandan land, titles, farming, and the buying process.

How to write:
- Explain things simply, like you're talking to someone with no background in law or real estate — short sentences, everyday words, no jargon.
- Plain text only. Never use markdown symbols like #, ##, **, *, -, or numbered lists with periods. If you need to list steps, write them as separate short sentences or use simple words like "First," "Next," "Then," "Finally."
- Keep the whole answer short — a few sentences, not an essay.

Key facts you know:
- Uganda has 4 land tenure types: Mailo (mostly central Uganda, freehold-like), Freehold (full ownership), Leasehold (government lease, 49-99 years), Customary (communal/clan land)
- Title checking: use MLHUD portal (mlhud.go.ug) or UgNLIS app. Look for caveats, mortgages, or disputes.
- Planting seasons: most of Uganda has two rainy seasons — March to May (first season) and September to November (second season). Northern Uganda: April to June.
- Assisted land check costs UGX 10,000 for 24-hour expert access.
- Always recommend WhatsApp-ing the agent for site visits.
- Do not make up listing details you don't have.`;

const MAX_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 2000;

function errorStream(message: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const payload = { choices: [{ delta: { content: message } }] };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}

export async function POST(req: NextRequest) {
  const { messages, listing_id } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages is required' }), { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return new Response(JSON.stringify({ error: 'Too many messages' }), { status: 400 });
  }
  for (const m of messages) {
    if (typeof m?.content !== 'string' || m.content.length > MAX_MESSAGE_CHARS) {
      return new Response(JSON.stringify({ error: 'Message too long' }), { status: 400 });
    }
  }

  // FAQ cache: only for general questions (no listing context). If the latest user
  // message matches a common question, serve the cached answer instantly — no API call.
  if (!listing_id) {
    const lastUser = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
    if (lastUser?.content) {
      const cached = matchFaq(lastUser.content);
      if (cached) return faqStream(cached);
    }
  }

  let systemPrompt = BASE_SYSTEM;

  if (listing_id) {
    const listing = await getLandListingById(listing_id);
    if (listing) {
      systemPrompt += `\n\nCurrent listing context:
Title: ${listing.title}
District: ${listing.district}${listing.parish ? `, ${listing.parish}` : ''}
Size: ${listing.size_acres ?? 'unknown'} acres
Price: ${listing.price_ugx ? `UGX ${listing.price_ugx.toLocaleString()}` : 'price on request'}
Land type: ${listing.land_type ?? 'unknown'}
Intended use: ${listing.intended_use ?? 'not specified'}
Title status: ${listing.title_status}
Verification: ${listing.verification_stage}
Trust score: ${listing.trust_score}/100
${listing.insight?.farming_suitability ? `Farming suitability: ${listing.insight.farming_suitability}` : ''}
${listing.insight?.risk_notes ? `Risk notes: ${listing.insight.risk_notes}` : ''}
Agent WhatsApp: ${listing.agent?.whatsapp ?? 'contact via platform'}`;
    }
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': 'https://businessyoo.lugandastudio.com',
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    console.error('[land/chat] OpenRouter error:', response.status, await response.text().catch(() => ''));
    return errorStream('The guide is resting — try again shortly.');
  }

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
