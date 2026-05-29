// app/api/land/chat/route.ts
import { NextRequest } from 'next/server';
import { getLandListingById } from '@/lib/land/queries';

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;
const MODEL = 'anthropic/claude-sonnet-4-6';

const BASE_SYSTEM = `You are a knowledgeable land guide for SafeLands UG — Uganda's verified land platform. Help buyers understand Ugandan land, titles, farming, and the buying process. Keep answers short, plain, and helpful. Do not use jargon.

Key facts you know:
- Uganda has 4 land tenure types: Mailo (mostly central Uganda, freehold-like), Freehold (full ownership), Leasehold (government lease, 49-99 years), Customary (communal/clan land)
- Title checking: use MLHUD portal (mlhud.go.ug) or UgNLIS app. Look for caveats, mortgages, or disputes.
- Planting seasons: most of Uganda has two rainy seasons — March to May (first season) and September to November (second season). Northern Uganda: April to June.
- Assisted land check costs UGX 10,000 for 24-hour expert access.
- Always recommend WhatsApp-ing the agent for site visits.
- Do not make up listing details you don't have.`;

export async function POST(req: NextRequest) {
  const { messages, listing_id } = await req.json();

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
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  });

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
