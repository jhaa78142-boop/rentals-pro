import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

/**
 * Shows a banner only between 9am–10pm IST.
 * Outside those hours the banner doesn't appear at all — so it's always honest.
 */
function isWithinOfficeHours(): boolean {
  const now = new Date();
  // IST = UTC+5:30
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utcMs + 5.5 * 3600000);
  const h = ist.getHours();
  return h >= 9 && h < 22;
}

function isEveningPush(): boolean {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utcMs + 5.5 * 3600000);
  const h = ist.getHours();
  return h >= 18 && h < 22; // 6pm–10pm
}

export default function UrgencyBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [evening, setEvening] = useState(false);

  useEffect(() => {
    setShow(isWithinOfficeHours());
    setEvening(isEveningPush());
    // Re-check every 5 min in case user leaves tab open across time boundary
    const t = setInterval(() => {
      setShow(isWithinOfficeHours());
      setEvening(isEveningPush());
    }, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  if (!show || dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative border-b border-emerald-500/15 bg-emerald-950/50"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Clock className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <span className="text-xs text-emerald-200/80 truncate">
            {evening
              ? "Last submissions of the day — responses go out first thing tomorrow morning."
              : "We're online now — submit your preferences and get a shortlist in 10–15 minutes."}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href="#lead"
            className="hidden sm:inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-400 transition"
          >
            Submit now
          </a>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-white/30 hover:text-white/60 text-base leading-none px-1"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </motion.div>
  );
}
