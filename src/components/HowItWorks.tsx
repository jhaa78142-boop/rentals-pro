import React, { useEffect, useMemo, useRef, useState } from "react";
import Reveal from "./Reveal";
import { EyeIcon, KeyIcon, SearchIcon } from "./icons";

type Step = {
  key: string;
  title: string;
  kicker: string;
  description: string;
  bullets: string[];
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  {
    key: "s1",
    title: "Search Your Area",
    kicker: "Step 1",
    description: "Tell us where you want to live. We shortlist verified options across Malad, Kandivali, and Borivali.",
    bullets: ["Society + landmark preferences", "Verified photos & details", "Shortlist matched to your budget"],
    icon: <SearchIcon className="h-6 w-6" />,
  },
  {
    key: "s2",
    title: "Schedule a Visit",
    kicker: "Step 2",
    description: "Pick your slot. We coordinate visits with minimum back‑and‑forth so you can decide faster.",
    bullets: ["Same/next-day visits", "Agent coordination", "Option comparisons"],
    icon: <EyeIcon className="h-6 w-6" />,
  },
  {
    key: "s3",
    title: "Move In",
    kicker: "Step 3",
    description: "When you choose, we help with paperwork basics and handover logistics for a smooth move-in.",
    bullets: ["Paperwork checklist", "Deposit & timeline clarity", "Move-in coordination"],
    icon: <KeyIcon className="h-6 w-6" />,
  },
];

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function HowItWorks() {
  const [activeKey, setActiveKey] = useState<string>(STEPS[0].key);
  const [scrollP, setScrollP] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<Record<string, HTMLElement | null>>({});

  const ids = useMemo(() => STEPS.map((s) => `how-${s.key}`), []);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (!best?.target?.id) return;
        const key = best.target.id.replace("how-", "");
        setActiveKey(key);
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.7],
        rootMargin: "-25% 0px -55% 0px",
      }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);



// section scroll progress for vertical progress line
useEffect(() => {
  const el = sectionRef.current;
  if (!el) return;
  const onScroll = () => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    // start when section enters viewport, finish near end
    const startOffset = vh * 0.18;
    const endOffset = vh * 0.55;
    const total = r.height - (vh - endOffset);
    const progressed = (startOffset - r.top) / Math.max(1, total);
    const p = Math.max(0, Math.min(1, progressed));
    setScrollP(p);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true } as any);
  window.addEventListener("resize", onScroll);
  return () => {
    window.removeEventListener("scroll", onScroll as any);
    window.removeEventListener("resize", onScroll as any);
  };
}, []);
  const scrollTo = (key: string) => {
    const el = document.getElementById(`how-${key}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeIndex = Math.max(0, STEPS.findIndex((s) => s.key === activeKey));

  return (
    <section ref={sectionRef} className="relative bg-white">
      {/* soft background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_0%,rgba(0,0,0,0.05),transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-18">
        <Reveal>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950">How It Works</h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">A smooth 3-step flow — watch the steps animate as you scroll.</p>
          </div>
        </Reveal>

        {/* Sticky layout */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[360px,1fr]">
          {/* Left sticky stepper */}
          <div className="lg:sticky lg:top-28 h-max">
            <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-[0_20px_70px_rgba(0,0,0,0.08)] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Your Journey</div>
                <div className="text-xs text-slate-600">{activeIndex + 1} / {STEPS.length}</div>
              </div>

              {/* progress */}
              <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${((activeIndex + 1) / STEPS.length) * 100}%` }}
                />
              </div>

              <div className="mt-4 relative">
  {/* vertical progress track */}
  <div className="pointer-events-none absolute left-[28px] top-3 bottom-3 w-px bg-slate-200/80" />
  <div
    className="pointer-events-none absolute left-[28px] top-3 w-px bg-emerald-500 transition-[height] duration-200"
    style={{ height: `${Math.round(scrollP * 1000) / 10}%` }}
  />
  <div
    className="pointer-events-none absolute left-[22px] h-4 w-4 rounded-full bg-emerald-500 shadow-[0_10px_26px_rgba(16,185,129,0.35)] transition-[top] duration-200"
    style={{ top: `calc(12px + ${(scrollP * 84).toFixed(2)}%)` }}
  />
  <div className="space-y-2">
                {STEPS.map((s, idx) => {
                  const active = s.key === activeKey;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => scrollTo(s.key)}
                      className={cn(
                        "w-full text-left rounded-2xl border transition-all",
                        "px-3 py-3 flex items-start gap-3",
                        active
                          ? "border-emerald-200 bg-emerald-50 shadow-[0_10px_30px_rgba(16,185,129,0.18)]"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                          active ? "bg-emerald-600 text-white" : "bg-slate-950 text-white"
                        )}
                      >
                        {s.icon}
                      </div>
                      <div className="min-w-0">
                        <div className={cn("text-xs font-semibold", active ? "text-emerald-700" : "text-slate-500")}>{s.kicker}</div>
                        <div className="text-sm font-semibold text-slate-950 truncate">{s.title}</div>
                        <div className="mt-1 text-xs text-slate-600">{s.description}</div>
                      </div>
                      <div className={cn("ml-auto mt-1 text-xs", active ? "text-emerald-700" : "text-slate-400")}>{idx + 1}</div>
                    </button>
                  );
                })}
              </div>
      </div>

              <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
                <div className="text-sm font-semibold">Pro tip</div>
                <p className="mt-1 text-sm text-white/80">
                  Fill the form and you’ll receive a WhatsApp shortlist — faster than browsing random portals.
                </p>
              </div>
            </div>
          </div>

          {/* Right scroll panels */}
          <div className="space-y-6">
            {STEPS.map((s, idx) => {
              const active = s.key === activeKey;
              return (
                <section
                  key={s.key}
                  id={`how-${s.key}`}
                  ref={(node) => {
                    cardsRef.current[s.key] = node;
                  }}
                  className={cn(
                    "rounded-3xl border border-slate-200 bg-white p-6 sm:p-8",
                    "shadow-[0_18px_60px_rgba(0,0,0,0.08)]",
                    "transition-transform duration-500",
                    active ? "ring-1 ring-emerald-200" : ""
                  )}
                  style={{ minHeight: "60vh" }}
                >
                  <Reveal delayMs={idx * 80}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                        {s.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-500">{s.kicker}</div>
                        <h3 className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-slate-950">{s.title}</h3>
                        <p className="mt-2 text-slate-600">{s.description}</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {s.bullets.map((b) => (
                        <div
                          key={b}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">✓</span>
                            <span className="font-medium">{b}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 rounded-3xl bg-[radial-gradient(800px_circle_at_20%_0%,rgba(16,185,129,0.18),transparent_40%),radial-gradient(900px_circle_at_80%_100%,rgba(2,132,199,0.16),transparent_45%)] p-6 border border-slate-200">
                      <div className="text-sm font-semibold text-slate-950">What happens next</div>
                      <p className="mt-1 text-sm text-slate-700">
                        {idx === 0
                          ? "We confirm your preferences and send a WhatsApp shortlist tailored to your budget and locality."
                          : idx === 1
                          ? "We lock visit slots and share exact addresses + contact details before you go."
                          : "We align the move-in date and help you keep paperwork + expectations clean."}
                      </p>
                    </div>
                  </Reveal>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
