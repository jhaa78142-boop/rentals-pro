import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, CheckCheck, Link, MessageCircle, X } from "lucide-react";
import { useLeadDraft } from "../state/leadDraft";
import { toBudgetRange } from "../features/lead-form/schema";
import { track } from "../lib/track";

function buildShareUrl(draft: ReturnType<typeof useLeadDraft>["draft"]): string {
  const base = window.location.origin;
  const params = new URLSearchParams();
  if (draft.area) params.set("area", draft.area);
  if (draft.bhk) params.set("bhk", draft.bhk);
  if (draft.budgetMinK) params.set("budgetMin", String(draft.budgetMinK));
  if (draft.budgetMaxK) params.set("budgetMax", String(draft.budgetMaxK));
  if (draft.furnishing) params.set("furnishing", draft.furnishing);
  if (draft.moveIn) params.set("moveIn", draft.moveIn);
  if (draft.profile) params.set("profile", draft.profile);
  if (draft.locality) params.set("locality", draft.locality);
  params.set("scroll", "1");
  return `${base}/?${params.toString()}`;
}

export default function ShareWidget() {
  const { draft } = useLeadDraft();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return buildShareUrl(draft);
  }, [draft]);

  const budgetRange =
    draft.budgetMinK && draft.budgetMaxK
      ? toBudgetRange(draft.budgetMinK, draft.budgetMaxK)
      : "40-60k";

  const waText = encodeURIComponent(
    `Hey! I found this service for Mumbai rentals in ${draft.area ?? "Western Suburbs"}. Fill in your details here: ${shareUrl}`
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      track("share_link_copied");
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  const hasPrefs = !!(draft.area && draft.bhk);

  return (
    <>
      {/* Trigger — only show when user has set some preferences */}
      {hasPrefs && (
        <motion.button
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          type="button"
          onClick={() => {
            setOpen(true);
            track("share_widget_open");
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/12 transition backdrop-blur"
        >
          <Share2 className="h-4 w-4" />
          Share my requirements
        </motion.button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="relative w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)]"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 rounded-xl bg-white/8 p-2 text-white/60 hover:bg-white/12 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white">Share your requirements</div>
                  <div className="text-xs text-white/50">Pre-filled link with your preferences</div>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-4 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm">
                <div className="text-xs text-white/50 mb-2 font-semibold uppercase tracking-wider">Your requirements</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    draft.area,
                    draft.bhk ? `${draft.bhk} BHK` : null,
                    budgetRange,
                    draft.profile,
                  ].filter(Boolean).map((v) => (
                    <span key={v} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/75">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* URL preview */}
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5">
                <Link className="h-3.5 w-3.5 text-white/40 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-xs text-white/60 font-mono">
                  {shareUrl.replace("https://", "")}
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 py-3 text-sm font-semibold text-white hover:bg-white/12 transition"
                >
                  {copied ? (
                    <><CheckCheck className="h-4 w-4 text-emerald-400" /> Copied!</>
                  ) : (
                    <><Copy className="h-4 w-4" /> Copy link</>
                  )}
                </button>
                <a
                  href={`https://wa.me/?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("share_whatsapp_click")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-[0_8px_30px_rgba(37,211,102,0.35)] hover:shadow-[0_10px_40px_rgba(37,211,102,0.5)] transition"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>

              <p className="mt-4 text-center text-xs text-white/35">
                Anyone with this link will have your preferences pre-filled.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
