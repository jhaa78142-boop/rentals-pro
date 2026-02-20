import React, { useEffect, useMemo, useState } from "react";
import { track } from "../lib/track";
import { useLeadDraft } from "../state/leadDraft";
import { toBudgetRange, MOVE_IN_LABELS, type MoveIn } from "../features/lead-form/schema";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BUSINESS_WA = "917498369191";

function scrollToLead() {
  document.getElementById("lead")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function SmartCtaBar({ phone10 }: { phone10?: string }) {
  const { draft } = useLeadDraft();
  const [show, setShow] = useState(false);
  const [nearLead, setNearLead] = useState(false);

  // Only show after user scrolls down 200px, hide if at top or past FAQ
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const docH = document.body.scrollHeight;
      const winH = window.innerHeight;
      setShow(y > 200 && y < docH - winH - 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const lead = document.getElementById("lead");
    if (!lead) return;
    const obs = new IntersectionObserver(
      (e) => setNearLead(e.some((en) => en.isIntersecting)),
      { threshold: 0.1 }
    );
    obs.observe(lead);
    return () => obs.disconnect();
  }, []);

  const waHref = useMemo(() => {
    const name = draft.name?.trim() || "";
    const bhk = draft.bhk ?? "1–2";
    const area = draft.area ?? "Western Suburbs";
    const budget = draft.budgetMinK && draft.budgetMaxK
      ? toBudgetRange(draft.budgetMinK, draft.budgetMaxK) : "40-60k";
    const moveIn = draft.moveIn ? MOVE_IN_LABELS[draft.moveIn as MoveIn] ?? draft.moveIn : "";
    const msg = name
      ? `Hi, I'm ${name}. Need ${bhk} BHK in ${area}, budget ${budget}${moveIn ? `, move-in ${moveIn}` : ""}.`
      : `Hi! Looking for ${bhk} BHK in ${area}, budget ${budget}/mo.`;
    const p = (phone10 || "").replace(/\D/g, "");
    const to = p.length === 10 ? `91${p}` : BUSINESS_WA;
    return `https://wa.me/${to}?text=${encodeURIComponent(msg)}`;
  }, [draft, phone10]);

  const label = nearLead ? "Submit & get shortlist" : "Find my flat →";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          // Sits just above the mobile tab bar (which is ~56px) + safe area
          className="fixed inset-x-0 z-[54] md:hidden"
          style={{ bottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="mx-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-[0_-8px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <button
              onClick={() => { track("smart_cta_click"); scrollToLead(); }}
              className="flex-1 rounded-xl bg-white py-3 text-sm font-bold text-slate-900 active:scale-[0.98] transition"
            >
              {label}
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("smart_cta_wa_click")}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white active:scale-[0.98] shadow-[0_4px_16px_rgba(37,211,102,0.4)]"
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
