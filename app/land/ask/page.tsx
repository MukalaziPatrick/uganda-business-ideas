// app/land/ask/page.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTED = [
  "How do I check if land has a clean title?",
  "What's the difference between Mailo and Freehold?",
  "When is the best time to buy land for farming?",
  "How does an assisted land check work?",
  "Which districts have the cheapest land?",
];

export default function LandAskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const allMessages = [...messages, userMsg];
    const res = await fetch('/api/land/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!res.body) { setLoading(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const json = line.replace('data: ', '').trim();
        if (json === '[DONE]') continue;
        try {
          const parsed = JSON.parse(json);
          const delta = parsed.choices?.[0]?.delta?.content ?? '';
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: last.content + delta };
            }
            return updated;
          });
        } catch {}
      }
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-land-cream/30 flex flex-col">
      <div className="bg-land-primary text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/land" className="text-land-cream text-sm hover:underline">← Back to Land</Link>
          <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: 'var(--font-business-serif), Georgia, serif' }}>
            Ask about land in Uganda
          </h1>
          <p className="text-land-cream/90 text-sm mt-1">
            Get plain-language answers about titles, districts, farming, and buying safely.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-land-forest/75 font-medium">Suggested questions:</p>
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="block w-full text-left px-4 py-3 bg-white rounded-xl border border-land-mint/50 text-sm text-land-ink/85 hover:border-land-primary hover:text-land-primary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-land-primary text-white'
                : 'bg-white text-land-ink border border-land-mint/50'
            }`}>
              {msg.content || (loading && msg.role === 'assistant' ? '...' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 bg-white border-t border-land-mint/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything about land in Uganda..."
            className="flex-1 text-sm border border-land-mint/50 rounded-full px-4 py-3 focus:outline-none focus:border-land-primary"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-land-primary text-white rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-50 flex-shrink-0"
          >
            ↑
          </button>
        </div>
      </div>
    </main>
  );
}
