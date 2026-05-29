// app/land/browse/[id]/LandChatBubble.tsx
'use client';
import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

export function LandChatBubble({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi — ask me anything about this land or about buying land in Uganda." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const allMessages = [...messages, userMsg];
    const res = await fetch('/api/land/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: allMessages, listing_id: listingId }),
    });

    if (!res.body) { setLoading(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = '';

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
          assistantContent += delta;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
            return updated;
          });
        } catch {}
      }
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#2d6a4f] text-white shadow-lg flex items-center justify-center text-2xl hover:bg-[#235840] transition-colors"
        aria-label="Ask about this land"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden" style={{ maxHeight: '60vh' }}>
          <div className="bg-[#2d6a4f] text-white px-4 py-3">
            <p className="font-semibold text-sm">🏞 Land Assistant</p>
            <p className="text-xs text-green-100">Ask about this land</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#2d6a4f] text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {msg.content || (loading && msg.role === 'assistant' ? '...' : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-200 p-3 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:border-[#2d6a4f]"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-[#2d6a4f] text-white rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-50"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
