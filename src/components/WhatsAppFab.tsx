import React, { useMemo } from "react";
import { useLeadDraft } from "../state/leadDraft";
import { toBudgetRange, MOVE_IN_LABELS, type MoveIn } from "../features/lead-form/schema";
import { logEvent } from "../lib/analytics";
import { track } from "../lib/track";

const BUSINESS_NUMBER = "917498369191";

export default function WhatsAppFab({ phone10 }: { phone10?: string }) {
  const { draft } = useLeadDraft();

  const href = useMemo(() => {
    const name = draft.name?.trim() || "";
    const bhk = draft.bhk ?? "1–2";
    const area = draft.area ?? "Mumbai Western Suburbs";
    const budgetRange = draft.budgetMinK && draft.budgetMaxK
      ? toBudgetRange(draft.budgetMinK, draft.budgetMaxK) : "40-60k";
    const moveIn = draft.moveIn ? MOVE_IN_LABELS[draft.moveIn as MoveIn] ?? draft.moveIn : "";
    const profile = draft.profile ?? "";

    const msg = name && bhk && area
      ? `Hi, I'm ${name}. Need ${bhk} BHK in ${area}, budget ${budgetRange}${moveIn ? `, move-in ${moveIn}` : ""}${profile ? `, ${profile}` : ""}.`
      : "Hi! I'm looking for a rental home in Mumbai Western Suburbs. Please share options.";

    const cleaned = (phone10 ?? "").replace(/\D+/g, "");
    const waNumber = cleaned.length === 10 ? "91" + cleaned : BUSINESS_NUMBER;
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  }, [draft, phone10]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => { logEvent("whatsapp_click", { source: "fab" }); track("whatsapp_click", { source: "fab" }); }}
      // On desktop: bottom-6. On mobile: above tab bar + SmartCtaBar = ~150px
      className="fixed right-4 z-[53] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] shadow-[0_12px_40px_rgba(37,211,102,0.5)] ring-1 ring-white/20 transition hover:-translate-y-1 active:scale-95 md:bottom-6"
      style={{ bottom: "calc(136px + env(safe-area-inset-bottom, 0px))" }}
      aria-label="Chat on WhatsApp"
    >
      {/* On desktop override via md: - use inline style only for mobile, tailwind for desktop */}
      <style>{`@media (min-width: 768px) { .wa-fab { bottom: 1.5rem !important; } }`}</style>
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
        <path d="M20 11.5c0 4.142-3.582 7.5-8 7.5a9.3 9.3 0 0 1-3.01-.5L4 20l1.08-3.2A7.02 7.02 0 0 1 4 11.5C4 7.358 7.582 4 12 4s8 3.358 8 7.5Z" fill="white" opacity="0.95" />
        <path d="M9.6 10.2c.2-.5.4-.5.6-.5h.5c.1 0 .3.05.4.25l.8 1.6c.1.2.1.35 0 .55l-.25.45c-.1.15-.2.25-.05.5.15.25.65 1.2 1.55 1.85.75.55 1.4.75 1.65.85.25.1.4.05.55-.1l.55-.65c.2-.2.35-.2.55-.1l1.45.7c.25.1.4.2.45.35.05.15.05.95-.35 1.45-.4.5-1.2 1-2.65.65-1.45-.35-2.85-1.2-3.95-2.2-1.05-1-1.95-2.35-2.2-3.4-.25-1.05.2-1.9.55-2.25.15-.15.35-.3.5-.3Z" fill="#25D366" />
      </svg>
    </a>
  );
}
