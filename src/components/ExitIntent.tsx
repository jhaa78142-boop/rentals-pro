import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, ArrowRight } from "lucide-react";
import { useLeadDraft } from "../state/leadDraft";
import { track } from "../lib/track";

const DISMISSED_KEY = "mr_exit_dismissed";
const DELAY_BEFORE_ELIGIBLE_MS = 30_000; // show only after 30s on page

function hasAlreadyDismissed(): boolean {
  try {
    const ts = parseInt(localStorage.getItem(DISMISSED_KEY) ?? "0", 10);
    // Don't show again for 3 days
    return Date.now() - ts < 3 * 24 * 3600 * 1000;
  } catch { return false; }
}

function markDismissed() {
  try { localStorage.setItem(DISMISSED_KEY, String(Date.now())); } catch {}
}

function scrollToLead() {
  document.getElementById("lead")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function ExitIntent() {
  const [visible, setVisible] = useState(false);
  const eligibleRef = useRef(false);
  const { draft } = useLeadDraft();

  useEffect(() => {
    if (hasAlreadyDismissed()) return;

    // Become eligible after 30s
    const eligibleTimer = setTimeout(() => {
      eligibleRef.current = true;
    }, DELAY_BEFORE_ELIGIBLE_MS);

    // Desktop: mouse leaves top of viewport
    const onMouseLeave = (e: MouseEvent) => {
      if (!eligibleRef.current) return;
      if (e.clientY > 20) return; // only top edge exit
      setVisible(true);
      track("exit_intent_shown");
    };

    // Mobile: page visibility change (user switches app)
    const onVisibilityChange = () => {
      if (!eligibleRef.current) return;
      if (document.visibilityState === "hidden") {
        setVisible(true);
        track("exit_intent_shown_mobile");
      }
    };

    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearTimeout(eligibleTimer);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    markDismissed();
    track("exit_intent_dismissed");
  }

  function handleCta(action: "form" | "whatsapp") {
    dismiss();
    track("exit_intent_cta", { action });
    if (action === "form") scrollToLead();
  }

  const area = draft.area ?? "Western Suburbs";
  const budget = draft.budgetMinK && draft.budgetMaxK
    ? `₹${draft.budgetMinK}k–₹${draft.budgetMaxK}k`
    : "your budget";

  const waMsg = encodeURIComponent(
    `Hi! I was on your site looking for rentals in ${area} (${budget}). Can you help?`
  );

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/12 bg-slate-900 shadow-[0_40px_120px_rgba(0,0,0,0.9)]"
          >
            {/* Glow */}
            <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

            {/* Close */}
            <button
              type="button"
              onClick={dismiss}
              className="absolute top-4 right-4 z-10 rounded-xl bg-white/8 p-2 text-white/50 hover:bg-white/12 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-7">
              {/* Header */}
              <div className="mb-5">
                <div className="text-2xl mb-1">🏠</div>
                <h2 className="text-lg font-bold text-white leading-snug">
                  Before you go — your shortlist is 60 seconds away
                </h2>
                <p className="mt-2 text-sm text-white/55 leading-relaxed">
                  We found people searching for{" "}
                  <span className="font-semibold text-white/80">{area}</span> around{" "}
                  <span className="font-semibold text-white/80">{budget}</span>.
                  Fill one quick form and we'll WhatsApp you verified options.
                </p>
              </div>

              {/* What they get */}
              <div className="mb-5 space-y-2">
                {[
                  "3–5 verified flats matched to your budget",
                  "Response in 10–15 minutes",
                  "No spam. Cancel anytime.",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-white/70">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs">✓</span>
                    {item}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleCta("form")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-slate-900 shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.25)] transition"
                >
                  Get my shortlist <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href={`https://wa.me/917498369191?text=${waMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleCta("whatsapp")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp instead
                </a>
              </div>

              <button
                type="button"
                onClick={dismiss}
                className="mt-4 w-full text-center text-xs text-white/25 hover:text-white/40 transition"
              >
                No thanks, I'll browse portals
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
