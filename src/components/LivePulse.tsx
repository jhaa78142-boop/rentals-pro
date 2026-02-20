import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sessionTracker } from "../lib/sessionTracker";

/**
 * LivePulse — shows REAL concurrent visitor count from sessionTracker.
 * The activity ticker shows time-since-pageload based on real localStorage
 * event log (mr_events), falling back to a static list if no events yet.
 */

// Recent real activity pulled from localStorage analytics log
// Falls back to recent static entries if log is empty
const STATIC_FALLBACK = [
  "Someone is checking Malad West options",
  "A visitor is reading the neighbourhood guide",
  "Someone just opened the affordability calculator",
  "A visitor is filling the shortlist form",
  "Someone is comparing Kandivali vs Borivali",
];

function getRecentActivity(): string[] {
  try {
    const raw = localStorage.getItem("mr_events");
    if (!raw) return STATIC_FALLBACK;
    const events: { event: string; ts: number }[] = JSON.parse(raw);
    const recent = events
      .filter((e) => Date.now() - e.ts < 30 * 60 * 1000) // last 30 min
      .reverse()
      .slice(0, 5)
      .map((e) => {
        if (e.event === "view_form_step") return "Someone opened the shortlist form";
        if (e.event === "completed_step") return "A visitor completed a form step";
        if (e.event === "whatsapp_click") return "Someone clicked WhatsApp";
        if (e.event === "hero_primary_click") return "A visitor clicked 'Get shortlist'";
        if (e.event === "hero_miniform_continue") return "Someone pre-filled their preferences";
        if (e.event === "submit_success") return "A lead was just submitted ✓";
        return null;
      })
      .filter(Boolean) as string[];
    return recent.length >= 2 ? recent : STATIC_FALLBACK;
  } catch {
    return STATIC_FALLBACK;
  }
}

export default function LivePulse() {
  const [count, setCount] = useState(1);
  const [idx, setIdx] = useState(0);
  const [activities, setActivities] = useState<string[]>(STATIC_FALLBACK);

  // Real visitor count
  useEffect(() => {
    sessionTracker.start();
    setCount(sessionTracker.getCount());
    const unsub = sessionTracker.subscribe(setCount);
    return unsub;
    // Note: sessionTracker.stop() is called by pagehide/beforeunload internally
  }, []);

  // Refresh activity list from real events every 10s
  useEffect(() => {
    setActivities(getRecentActivity());
    const t = setInterval(() => setActivities(getRecentActivity()), 10_000);
    return () => clearInterval(t);
  }, []);

  // Cycle through activities
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % activities.length), 5000);
    return () => clearInterval(t);
  }, [activities.length]);

  if (count === 0) return null; // hide if tracker hasn't initialised yet

  return (
    <div className="w-full border-y border-white/8 bg-black/30 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        {/* Real live dot + count */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">
            {count} {count === 1 ? "visitor" : "visitors"} online
          </span>
        </div>

        <div className="h-3 w-px bg-white/15 shrink-0" />

        {/* Activity ticker */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="block truncate text-xs text-white/55"
            >
              {activities[idx % activities.length]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
