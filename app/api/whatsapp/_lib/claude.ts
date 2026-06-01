// app/api/whatsapp/_lib/claude.ts
import type { Conversation } from '@/lib/supabase/whatsapp';

export async function generateReport(conv: Conversation): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');

  const prompt = `You are a practical business advisor in Uganda. Write a personal business report for a customer who wants to start a business.

Customer details:
- Business idea: ${conv.business_type}
- Location: ${conv.location}
- Starting budget: ${conv.budget}
- Main challenge: ${conv.concern}

Write a clear, practical report with these sections:
1. Overview of ${conv.business_type} in ${conv.location}
2. Step-by-step start plan (5-7 steps)
3. Budget breakdown for ${conv.budget}
4. What to buy or set up first
5. How to find your first customers in ${conv.location}
6. Common mistakes to avoid
7. Your next 3 actions this week

Keep the language simple and direct. Write for someone starting their first business. Do NOT use markdown formatting — write plain text only, since this will be sent on WhatsApp. Use numbered lists and line breaks only.`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://businessyoo.com',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-6',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}
