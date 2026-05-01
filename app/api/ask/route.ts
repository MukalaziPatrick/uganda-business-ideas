import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

const SYSTEM_PROMPT = `You are a practical business advisor for Uganda.

Your job is to help Ugandans find the right business to start based on their budget, skills, and location.

When someone describes their situation, you:
1. Recommend 1-3 specific business ideas that fit their budget and context
2. For each idea, briefly explain: what it is, why it suits them, rough startup cost in UGX, and one practical first step
3. Keep your language simple and direct - many users are first-time entrepreneurs
4. Always use UGX (Ugandan shillings) for money amounts
5. Focus on businesses that are realistic in Uganda - not generic global advice
6. If they mention a specific location in Uganda, factor that in
7. End with one sentence of encouragement

Format your answer clearly with short paragraphs. Do not use markdown symbols like ** or ##.
Keep the total answer under 300 words.`;

export async function POST(req: NextRequest) {
  let question: string;

  try {
    const body = await req.json();
    question = (body.question ?? "").trim();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!question) {
    return NextResponse.json(
      { error: "Please enter a question." },
      { status: 400 }
    );
  }

  if (question.length > 500) {
    return NextResponse.json(
      { error: "Question is too long. Please keep it under 500 characters." },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured. Please contact the site owner." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system:     SYSTEM_PROMPT,
        messages: [
          { role: "user", content: question }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Claude API error:", errorData);
      return NextResponse.json(
        { error: "The AI service returned an error. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const answer: string =
      data?.content?.[0]?.text ?? "Sorry, I could not generate an answer.";

    return NextResponse.json({ answer });

  } catch (err) {
    console.error("Unexpected error calling Claude:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}