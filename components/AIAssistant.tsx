// components/AIAssistant.tsx
"use client";

import { useState, useRef } from "react";

const SUGGESTIONS = [
  "I have UGX 500,000 — what can I start?",
  "What business needs no experience?",
  "Best food business in Kampala?",
  "Which business earns daily income?",
];

export default function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [asked, setAsked]       = useState(false);
  const answerRef               = useRef<HTMLDivElement>(null);

  async function handleAsk() {
    const q = question.trim();
    if (!q || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");
    setAsked(true);

    try {
      const res = await fetch("/api/ask", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      setAnswer(data.answer ?? "No answer returned.");

      setTimeout(() => {
        answerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  function handleSuggestion(text: string) {
    setQuestion(text);
    setAnswer("");
    setError("");
  }

  function handleReset() {
    setQuestion("");
    setAnswer("");
    setError("");
    setAsked(false);
  }

  return (
    <section className="mt-12 sm:mt-16 md:mt-20">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 text-lg shadow-md shadow-green-200">
              🤖
            </div>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-green-600">
                Powered by Claude AI
              </p>
              <h2 className="text-[15px] font-bold text-slate-900">
                Ask the Uganda Business Advisor
              </h2>
            </div>
            <span className="ml-auto hidden rounded-full border border-green-200 bg-white px-3 py-1 text-[11px] font-semibold text-green-700 sm:block">
              Free · No sign-up
            </span>
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-slate-500">
            Describe your situation — budget, skills, location — and get a practical recommendation for Uganda.
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8">

          {/* ── Suggestion chips ─────────────────────────────────────────── */}
          {!asked && (
            <div className="mb-4">
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[12.5px] font-medium text-slate-600 transition-all hover:border-green-300 hover:bg-green-50 hover:text-green-700 active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Textarea ─────────────────────────────────────────────────── */}
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. I have UGX 500,000 and live near Kampala. I want to start a small food business. What do you recommend?"
              disabled={loading}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-24 text-[14px] leading-relaxed text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
            />

            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className={[
                "absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12.5px] font-bold transition-all active:scale-95",
                loading || !question.trim()
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-green-600 text-white shadow-md shadow-green-200 hover:-translate-y-0.5 hover:bg-green-700",
              ].join(" ")}
            >
              {loading ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Thinking
                </>
              ) : (
                <>
                  Ask
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

          <p className="mt-2 text-[11.5px] text-slate-400">
            Press{" "}
            <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">
              Enter
            </kbd>{" "}
            to send
          </p>

          {/* ── Error ────────────────────────────────────────────────────── */}
          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
              <span className="mt-0.5 text-lg">⚠️</span>
              <div>
                <p className="text-[13.5px] font-semibold text-red-800">Something went wrong</p>
                <p className="mt-0.5 text-[13px] text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* ── Loading skeleton ──────────────────────────────────────────── */}
          {loading && (
            <div className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 text-xs">
                  🤖
                </div>
                <p className="text-[12.5px] font-semibold text-slate-500">
                  Uganda Business Advisor is thinking…
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-200" />
                <div className="h-3 w-3/5 animate-pulse rounded-full bg-slate-200" />
              </div>
            </div>
          )}

          {/* ── Answer ────────────────────────────────────────────────────── */}
          {answer && !loading && (
            <div ref={answerRef} className="mt-5">
              <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">

                <div className="flex items-center gap-2.5 border-b border-green-100 px-5 py-3.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 text-xs">
                    🤖
                  </div>
                  <p className="text-[12.5px] font-bold text-green-900">Uganda Business Advisor</p>
                  <span className="ml-auto rounded-full bg-green-100 px-2.5 py-0.5 text-[10.5px] font-semibold text-green-700">
                    Answer ready
                  </span>
                </div>

                <div className="px-5 py-5">
                  <div className="space-y-3">
                    {answer.split("\n").map((line, i) =>
                      line.trim() === "" ? (
                        <div key={i} className="h-1" />
                      ) : (
                        <p key={i} className="text-[14px] leading-relaxed text-slate-700">
                          {line}
                        </p>
                      )
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-green-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[12px] text-slate-400">
                    AI answers are suggestions — always research before investing.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12.5px] font-semibold text-slate-600 shadow-sm transition-all hover:border-green-300 hover:bg-green-50 hover:text-green-700 active:scale-95"
                    >
                      Ask another
                    </button>
                    <a
                      href="#ideas"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-[12.5px] font-bold text-white shadow-sm shadow-green-200 transition-all hover:bg-green-700 active:scale-95"
                    >
                      Browse ideas
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* ── Disclaimer ───────────────────────────────────────────────────── */}
        <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-3 sm:px-8">
          <p className="text-[11.5px] text-slate-400">
            🇺🇬 Advice tailored for the Ugandan market · Powered by Anthropic Claude · Free to use
          </p>
        </div>

      </div>
    </section>
  );
}