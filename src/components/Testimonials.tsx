import React from "react";
import Reveal from "./Reveal";

const TESTIMONIALS = [
  {
    name: "Aayushi, Malad West",
    text: "Got a WhatsApp shortlist in under an hour. Visits were smooth and the options matched our budget exactly.",
  },
  {
    name: "Rohan, Kandivali East",
    text: "Loved the transparency — clear expectations, verified photos, and no time wasted on irrelevant listings.",
  },
  {
    name: "Priya (HR), Borivali West",
    text: "We needed housing for a relocating employee. Fast coordination and good follow‑ups — very professional.",
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-1" aria-label="5 star rating">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 text-emerald-300" fill="currentColor" aria-hidden="true">
          <path d="M10 15.3 4.1 18l1.1-6.3L.6 7.2l6.3-.9L10 0.6l3.1 5.7 6.3.9-4.6 4.5 1.1 6.3L10 15.3Z"/>
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <div className="relative bg-slate-950 text-white py-16 sm:py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[42rem] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">People love the speed ✨</h2>
              <p className="mt-2 text-white/70 max-w-2xl">
                Western suburbs specialists. Shortlists on WhatsApp, verified options, and clean coordination.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-sm font-semibold">4.9/5</div>
              <Stars />
              <div className="text-xs text-white/60 mt-1">Based on recent matches</div>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <Reveal key={t.name} delayMs={idx * 90}>
              <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)] hover:bg-white/7 transition">
                <Stars />
                <p className="mt-4 text-white/80 leading-relaxed">“{t.text}”</p>
                <div className="mt-5 text-sm font-semibold">{t.name}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}