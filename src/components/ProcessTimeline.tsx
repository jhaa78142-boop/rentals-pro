import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Bell, CalendarCheck, Key, CheckCircle2 } from "lucide-react";

type TimelineStep = {
  icon: React.ReactNode;
  time: string;
  title: string;
  desc: string;
  detail: string;
  color: string;
};

const STEPS: TimelineStep[] = [
  {
    icon: <ClipboardList className="h-5 w-5" />,
    time: "0 min",
    title: "You submit preferences",
    desc: "Area, budget, BHK, move-in timeline. 90 seconds.",
    detail: "Your data goes directly to our team — no middlemen, no reselling. Encrypted and private.",
    color: "#6366f1",
  },
  {
    icon: <Bell className="h-5 w-5" />,
    time: "10–15 min",
    title: "We call & WhatsApp you",
    desc: "A real person reviews your request and reaches out.",
    detail: "Our team has direct access to landlords — no portal delays. We verify availability in real time.",
    color: "#10b981",
  },
  {
    icon: <CalendarCheck className="h-5 w-5" />,
    time: "Same / next day",
    title: "Visits scheduled",
    desc: "3–5 curated options. You pick the slots.",
    detail: "We coordinate everything — building address, POC name, entry instructions, visit duration.",
    color: "#38bdf8",
  },
  {
    icon: <CheckCircle2 className="h-5 w-5" />,
    time: "1–3 days",
    title: "You choose your home",
    desc: "Finalise rent, deposit, move-in date.",
    detail: "We help review the agreement basics, ensure deposit terms are fair, and set move-in expectations.",
    color: "#fbbf24",
  },
  {
    icon: <Key className="h-5 w-5" />,
    time: "4–10 days",
    title: "Keys in hand",
    desc: "Move-in coordinated. Follow-up included.",
    detail: "We stay reachable post-move-in for any snags. Most of our clients refer friends within a week.",
    color: "#f472b6",
  },
];

function StepContent({ step }: { step: TimelineStep }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div
        className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold mb-2"
        style={{ background: `${step.color}18`, color: step.color }}
      >
        {step.time}
      </div>
      <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
      <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-1.5 text-xs font-semibold underline underline-offset-2 text-slate-400 hover:text-slate-600 transition"
      >
        {expanded ? "Less ↑" : "How it works ↓"}
      </button>
      {expanded && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs text-slate-500 leading-relaxed border-l-2 pl-3"
          style={{ borderColor: step.color }}
        >
          {step.detail}
        </motion.p>
      )}
    </div>
  );
}

function StepItem({ step, index }: { step: TimelineStep; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const isRight = index % 2 === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative flex items-start gap-4 sm:gap-0">
      {/* Mobile: left dot */}
      <div className="relative z-10 flex sm:hidden">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg"
          style={{ background: step.color, boxShadow: `0 8px 24px ${step.color}50` }}
        >
          <span className="text-white">{step.icon}</span>
        </motion.div>
      </div>

      {/* Desktop: alternating layout */}
      <div className={`hidden sm:flex w-full ${isRight ? "flex-row" : "flex-row-reverse"} items-start gap-6`}>
        <div className="w-1/2 flex flex-col items-end text-right pr-8">
          {!isRight && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.15 }}>
              <StepContent step={step} />
            </motion.div>
          )}
        </div>
        {/* Center dot */}
        <div className="relative z-10 flex shrink-0 items-start justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.05, type: "spring", stiffness: 400, damping: 20 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: step.color, boxShadow: `0 8px 24px ${step.color}50` }}
          >
            <span className="text-white">{step.icon}</span>
          </motion.div>
        </div>
        <div className="w-1/2 pl-8">
          {isRight && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.15 }}>
              <StepContent step={step} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile content */}
      <motion.div
        className="flex-1 sm:hidden"
        initial={{ opacity: 0, x: 12 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.15 }}
      >
        <StepContent step={step} />
      </motion.div>
    </div>
  );
}

export default function ProcessTimeline() {
  return (
    <section className="relative bg-white py-16 sm:py-20 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-0 h-64 w-64 -translate-y-1/2 rounded-full bg-indigo-50 blur-3xl opacity-70" />
        <div className="absolute top-1/2 right-0 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-50 blur-3xl opacity-70" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 mb-3 shadow-sm">
            The exact journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            From form to keys — in days, not weeks
          </h2>
          <p className="mt-2 text-slate-500 max-w-xl mx-auto">
            Here's what happens after you hit Submit, minute by minute.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-6 bottom-6 w-px bg-slate-200 sm:left-1/2 sm:-translate-x-1/2" />
          <div className="space-y-8">
            {STEPS.map((step, i) => (
              <StepItem key={step.title} step={step} index={i} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 rounded-3xl bg-slate-950 p-7 sm:p-8 text-center"
        >
          <div className="text-2xl font-bold text-white">Ready to start?</div>
          <p className="mt-2 text-white/65 text-sm">It takes 90 seconds to submit. We take care of the rest.</p>
          <a href="#lead" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_40px_rgba(37,211,102,0.4)] hover:shadow-[0_14px_50px_rgba(37,211,102,0.55)] transition">
            Get my shortlist →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
