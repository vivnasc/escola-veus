"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  sublesson_letter?: string | null;
  created_at?: string;
};

export function AskClaude({
  courseSlug,
  moduleNumber,
  sublessonLetter,
}: {
  courseSlug: string;
  moduleNumber: number;
  sublessonLetter?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded || historyLoaded) return;
    const url = `/api/courses/ask?courseSlug=${encodeURIComponent(courseSlug)}&moduleNumber=${moduleNumber}`;
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.messages)) setMessages(d.messages);
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [expanded, historyLoaded, courseSlug, moduleNumber]);

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages.length, loading]);

  async function send() {
    const question = draft.trim();
    if (!question || loading) return;
    setError(null);
    setDraft("");
    setLoading(true);
    setMessages((m) => [...m, { role: "user", content: question, sublesson_letter: sublessonLetter }]);

    try {
      const res = await fetch("/api/courses/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, moduleNumber, sublessonLetter, question }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.erro ?? `Erro ${res.status}`);
        setMessages((m) => m.slice(0, -1));
        setDraft(question);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setMessages((m) => m.slice(0, -1));
      setDraft(question);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="rounded-xl border border-escola-border bg-escola-card p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h3
            className="text-xs uppercase tracking-wide"
            style={{ color: "var(--t-primary, #C9A96E)" }}
          >
            Perguntar sobre este módulo
          </h3>
          <p className="mt-1 text-sm text-escola-creme-50">
            Se algo ficou por dizer, ou se quiseres aprofundar.
          </p>
        </div>
        <span className="text-escola-creme-50">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="mt-4">
          {messages.length > 0 && (
            <div
              ref={threadRef}
              className="mb-4 max-h-[440px] space-y-4 overflow-y-auto pr-1"
            >
              {messages.map((m, i) => (
                <div key={m.id ?? i}>
                  <p
                    className="mb-1 text-[10px] uppercase tracking-wider"
                    style={{
                      color:
                        m.role === "assistant" ? "var(--t-primary)" : "var(--t-primary)",
                      opacity: m.role === "assistant" ? 0.9 : 0.5,
                    }}
                  >
                    {m.role === "assistant" ? "Guia" : "Tu"}
                  </p>
                  <p className="whitespace-pre-line font-serif text-sm leading-relaxed text-escola-creme">
                    {m.content}
                  </p>
                </div>
              ))}
              {loading && (
                <p className="text-xs italic text-escola-creme-50">A pensar…</p>
              )}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
            placeholder="Escreve a tua pergunta..."
            className="min-h-[90px] w-full resize-y rounded-lg border border-escola-border bg-escola-bg px-4 py-3 font-serif text-sm leading-relaxed text-escola-creme placeholder:text-escola-creme-50 focus:outline-none disabled:opacity-50"
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-escola-creme-50">
              {error ? <span className="text-escola-terracota">{error}</span> : "Ctrl/Cmd + Enter para enviar"}
            </span>
            <button
              onClick={() => void send()}
              disabled={loading || !draft.trim()}
              className="rounded-lg px-4 py-1.5 text-xs font-medium text-escola-bg transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "var(--t-primary)" }}
            >
              {loading ? "A enviar…" : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
