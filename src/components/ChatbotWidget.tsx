import React, { useEffect, useMemo, useRef, useState } from "react";
import { initialBotMessage, replyToUser } from "../bot/engine";
import { BUSINESS, QuickAction } from "../bot/knowledge";
import { track } from "../lib/track";
import { useEscapeKey, useFocusTrap, useLockBodyScroll } from "../lib/hooks";
import { useLeadDraft } from "../state/leadDraft";

type Role = "user" | "bot";

type Msg = {
  id: string;
  role: Role;
  text: string;
  ts: number;
  quickActions?: QuickAction[];
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function clampLen(s: string, n = 600) {
  const t = (s || "").trim();
  if (t.length <= n) return t;
  return t.slice(0, n) + "…";
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function waLink(phone10?: string, text?: string) {
  const cleaned = (phone10 || "").replace(/\D+/g, "");
  const wa = cleaned.length === 10 ? "91" + cleaned : BUSINESS.businessWhatsApp;
  return `https://wa.me/${wa}?text=${encodeURIComponent(text || "")}`;
}

export default function ChatbotWidget({ phone10 }: { phone10?: string }) {
  const [open, setOpen] = useState(false);
  useLockBodyScroll(open);
  useEscapeKey(open, () => setOpen(false));
  const [input, setInput] = useState("");
  const { setDraft } = useLeadDraft();
  const listRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useFocusTrap<HTMLDivElement>(open);

  const initial = useMemo(() => {
    const first = initialBotMessage({ phone10 });
    const msg: Msg = {
      id: uid(),
      role: "bot",
      text: first.text,
      ts: Date.now(),
      quickActions: first.quickActions,
    };
    return [msg];
  }, [phone10]);

  const [messages, setMessages] = useState<Msg[]>(initial);

  useEffect(() => {
    // keep scrolled to bottom when new message arrives
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    // reset initial if phone changes (only when chat not started)
    if (messages.length === 1 && messages[0].role === "bot") {
      setMessages(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone10]);

  function pushBot(text: string, quickActions?: QuickAction[]) {
    setMessages((m) => [
      ...m,
      { id: uid(), role: "bot", text, ts: Date.now(), quickActions },
    ]);
  }

  function pushUser(text: string) {
    setMessages((m) => [...m, { id: uid(), role: "user", text, ts: Date.now() }]);
  }

  function handleSend() {
    const t = clampLen(input);
    if (!t) return;
    pushUser(t);
    setInput("");
    track("chatbot_user_message", { len: t.length });

    const r = replyToUser(t, { phone10 });
    pushBot(r.text, r.quickActions);
  }

  function handleQuickAction(a: QuickAction) {
    track("chatbot_quick_action", { type: a.type, label: a.label });

    if (a.type === "apply_draft") {
      // apply parsed preferences to shared draft, then jump to the form
      setDraft(a.draft as any);
      setOpen(false);
      const target = (a as any).scrollToId || "lead";
      setTimeout(() => scrollToId(target), 120);
      return;
    }

    if (a.type === "scroll") {
      setOpen(false);
      // slight delay so close animation feels smooth
      setTimeout(() => scrollToId(a.targetId), 120);
      return;
    }

    if (a.type === "whatsapp") {
      window.open(waLink(phone10, a.text), "_blank", "noreferrer");
      return;
    }

    if (a.type === "tel") {
      window.location.href = "tel:+917498369191";
      return;
    }

    if (a.type === "link") {
      window.open(a.href, "_blank", "noreferrer");
      return;
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            const nv = !v;
            track(nv ? "chatbot_open" : "chatbot_close");
            return nv;
          });
        }}
        className="fixed bottom-6 right-24 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-neutral-950 text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.45)] active:translate-y-0 active:scale-[0.99]"
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        aria-controls="mr-chat-panel"
        title={open ? "Close chat" : "Chat with us"}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
            <path
              d="M7 17.5 4 20l.8-3.2A7.5 7.5 0 0 1 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8c-1.1 0-2.2-.2-3.1-.5L7 17.5Z"
              stroke="currentColor"
              strokeWidth="2.0"
              strokeLinejoin="round"
            />
            <path
              d="M8 12h8M8 9h5"
              stroke="currentColor"
              strokeWidth="2.0"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={[
          "fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_90px_rgba(0,0,0,0.25)] transition-all duration-200",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="MumbaiRentals assistant"
        id="mr-chat-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-neutral-950 px-4 py-3 text-white">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]" />
              <p className="truncate text-sm font-semibold">{BUSINESS.brand} Assistant</p>
            </div>
            <p className="truncate text-xs text-white/70">
              Areas: Malad • Kandivali • Borivali
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-xs text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          className="max-h-[420px] space-y-3 overflow-y-auto bg-gradient-to-b from-neutral-50 to-white px-3 py-3"
        >
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={[
                  "max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-neutral-950 text-white shadow-[0_14px_40px_rgba(0,0,0,0.25)]"
                    : "bg-white text-neutral-900 ring-1 ring-neutral-200 shadow-sm",
                ].join(" ")}
              >
                {m.text}

                {m.role === "bot" && m.quickActions && m.quickActions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.quickActions.map((a) => (
                      <button
                        key={a.label}
                        type="button"
                        onClick={() => handleQuickAction(a)}
                        className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-900 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 active:translate-y-0"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="border-t border-neutral-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Ask about areas, budget, visits, docs…"
              className="h-10 flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-300 focus:shadow-[0_0_0_4px_rgba(0,0,0,0.06)]"
            />
            <button
              type="button"
              onClick={handleSend}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 active:translate-y-0"
            >
              Send
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
            <span>Replies are based on website info.</span>
            <a
              href={waLink(phone10, "Hi! I need help finding a rental home in Mumbai.")}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-emerald-700 hover:text-emerald-800"
              onClick={() => track("chatbot_whatsapp_escalate")}
            >
              WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}