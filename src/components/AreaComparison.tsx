import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Train, ShoppingBag, Trees, TrendingUp, IndianRupee, Clock, Check, X, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

type AreaKey = "malad" | "kandivali" | "borivali";

const AREAS: Record<AreaKey, {
  name: string;
  tagline: string;
  color: string;
  ring: string;
  bg: string;
  rent1bhk: [number, number]; // min, max (k)
  rent2bhk: [number, number];
  rent3bhk: [number, number];
  metroMin: number;
  commuteCSTMin: number;
  demandScore: number;
  supplyLabel: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  landmarks: string[];
  societyTypes: string;
  connectivity: string;
}> = {
  malad: {
    name: "Malad",
    tagline: "Best connectivity + IT hub",
    color: "emerald",
    ring: "ring-emerald-500/40",
    bg: "bg-emerald-500/10",
    rent1bhk: [28, 45],
    rent2bhk: [42, 70],
    rent3bhk: [65, 110],
    metroMin: 3,
    commuteCSTMin: 38,
    demandScore: 88,
    supplyLabel: "High demand",
    pros: ["Closest to Mindspace IT Park", "Infiniti Mall walkable", "3 min metro walk", "Strong rental demand"],
    cons: ["Higher rent vs Borivali", "Peak traffic on SV Road", "Limited parking in older buildings"],
    bestFor: ["IT professionals", "Young couples", "Startup employees"],
    landmarks: ["Mindspace", "Infiniti Mall", "Inorbit Mall", "Malad Station"],
    societyTypes: "Mix of old societies + new towers",
    connectivity: "Western Rly + Metro Line 2A",
  },
  kandivali: {
    name: "Kandivali",
    tagline: "Best balance of space + price",
    color: "sky",
    ring: "ring-sky-500/40",
    bg: "bg-sky-500/10",
    rent1bhk: [25, 42],
    rent2bhk: [38, 62],
    rent3bhk: [58, 95],
    metroMin: 5,
    commuteCSTMin: 45,
    demandScore: 82,
    supplyLabel: "Moderate",
    pros: ["Best price-to-space ratio", "Bigger flats for same budget", "Quieter lanes", "Good schools + parks"],
    cons: ["Slightly farther from IT hubs", "Less nightlife/restaurants", "Fewer new towers"],
    bestFor: ["Families", "Those needing 3 BHK", "Budget-conscious IT workers"],
    landmarks: ["Growels Mall", "Thakur Village", "Kandivali Station", "ISKCON Temple"],
    societyTypes: "Large gated societies, Thakur Complex",
    connectivity: "Western Rly + Metro Line 2A",
  },
  borivali: {
    name: "Borivali",
    tagline: "Most spacious + peaceful",
    color: "violet",
    ring: "ring-violet-500/40",
    bg: "bg-violet-500/10",
    rent1bhk: [22, 38],
    rent2bhk: [35, 58],
    rent3bhk: [52, 85],
    metroMin: 7,
    commuteCSTMin: 52,
    demandScore: 74,
    supplyLabel: "Good availability",
    pros: ["Lowest rents in Western Suburbs", "Largest apartments for budget", "Near National Park", "Less crowded"],
    cons: ["Farthest from South Mumbai", "Fewer IT offices nearby", "Longer commute to BKC"],
    bestFor: ["Families wanting space", "Senior professionals", "Nature lovers"],
    landmarks: ["Sanjay Gandhi National Park", "Raghuleela Mall", "Borivali Station", "IC Colony"],
    societyTypes: "Old societies + newer projects",
    connectivity: "Western Rly + upcoming Metro",
  },
};

const COLOR_MAP: Record<string, { badge: string; bar: string; text: string; border: string }> = {
  emerald: { badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20", bar: "bg-emerald-400", text: "text-emerald-400", border: "border-emerald-500/30" },
  sky:     { badge: "bg-sky-500/15 text-sky-300 border-sky-500/20",             bar: "bg-sky-400",     text: "text-sky-400",     border: "border-sky-500/30" },
  violet:  { badge: "bg-violet-500/15 text-violet-300 border-violet-500/20",    bar: "bg-violet-400",  text: "text-violet-400",  border: "border-violet-500/30" },
};

type CompareKey = "price" | "commute" | "space" | "lifestyle";

const COMPARE_TABS: { key: CompareKey; label: string; icon: React.ReactNode }[] = [
  { key: "price",     label: "Rent",       icon: <IndianRupee className="h-3.5 w-3.5" /> },
  { key: "commute",   label: "Commute",    icon: <Train className="h-3.5 w-3.5" /> },
  { key: "lifestyle", label: "Lifestyle",  icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  { key: "space",     label: "Space",      icon: <Trees className="h-3.5 w-3.5" /> },
];

function DemandBar({ score, color }: { score: number; color: string }) {
  const c = COLOR_MAP[color];
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", c.bar)}
        />
      </div>
      <span className={cn("text-xs font-bold w-8 text-right", c.text)}>{score}</span>
    </div>
  );
}

function RentRow({ label, malad, kandivali, borivali }: { label: string; malad: [number, number]; kandivali: [number, number]; borivali: [number, number] }) {
  const lowest = Math.min(malad[0], kandivali[0], borivali[0]);
  return (
    <tr className="border-t border-white/5">
      <td className="py-3 px-4 text-xs text-white/50 font-medium">{label}</td>
      {([["malad", malad], ["kandivali", kandivali], ["borivali", borivali]] as [AreaKey, [number, number]][]).map(([key, range]) => {
        const c = COLOR_MAP[AREAS[key].color];
        const isBest = range[0] === lowest;
        return (
          <td key={key} className="py-3 px-4 text-center">
            <span className={cn("text-sm font-bold", c.text)}>
              ₹{range[0]}–{range[1]}k
            </span>
            {isBest && <span className="ml-1 text-[9px] font-black text-amber-400 align-super">BEST</span>}
          </td>
        );
      })}
    </tr>
  );
}

export default function AreaComparison() {
  const [activeTab, setActiveTab] = useState<CompareKey>("price");
  const [expanded, setExpanded] = useState(false);

  function scrollToForm(area: AreaKey) {
    const areaName = AREAS[area].name + " West" as any;
    // Set area in form
    const el = document.getElementById("lead");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="relative bg-slate-950 py-16 sm:py-20 overflow-hidden">
      {/* BG glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-sky-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/50 mb-4">
            Area Comparison
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Malad vs Kandivali vs Borivali
          </h2>
          <p className="mt-2 text-sm text-white/50 max-w-lg mx-auto">
            Real data. Pick the area that matches your budget, commute, and lifestyle.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-1 rounded-2xl border border-white/8 bg-white/5 p-1">
            {COMPARE_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                  activeTab === t.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-white/50 hover:text-white/80"
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content panels */}
        <AnimatePresence mode="wait">

          {/* RENT TAB */}
          {activeTab === "price" && (
            <motion.div key="price" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="overflow-x-auto rounded-2xl border border-white/8 bg-white/3">
                <table className="w-full min-w-[480px]">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="py-3 px-4 text-left text-xs text-white/30 font-medium w-24"></th>
                      {(["malad", "kandivali", "borivali"] as AreaKey[]).map((key) => {
                        const a = AREAS[key];
                        const c = COLOR_MAP[a.color];
                        return (
                          <th key={key} className="py-3 px-4 text-center">
                            <span className={cn("inline-block rounded-full border px-2.5 py-1 text-xs font-bold", c.badge, c.border)}>
                              {a.name}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <RentRow label="1 BHK" malad={AREAS.malad.rent1bhk} kandivali={AREAS.kandivali.rent1bhk} borivali={AREAS.borivali.rent1bhk} />
                    <RentRow label="2 BHK" malad={AREAS.malad.rent2bhk} kandivali={AREAS.kandivali.rent2bhk} borivali={AREAS.borivali.rent2bhk} />
                    <RentRow label="3 BHK" malad={AREAS.malad.rent3bhk} kandivali={AREAS.kandivali.rent3bhk} borivali={AREAS.borivali.rent3bhk} />
                    <tr className="border-t border-white/8">
                      <td className="py-3 px-4 text-xs text-white/50 font-medium">Demand</td>
                      {(["malad", "kandivali", "borivali"] as AreaKey[]).map((key) => (
                        <td key={key} className="py-3 px-4">
                          <DemandBar score={AREAS[key].demandScore} color={AREAS[key].color} />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-center text-xs text-white/30">Rent ranges in ₹k/month. Updated Feb 2025.</p>
            </motion.div>
          )}

          {/* COMMUTE TAB */}
          {activeTab === "commute" && (
            <motion.div key="commute" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid sm:grid-cols-3 gap-4"
            >
              {(["malad", "kandivali", "borivali"] as AreaKey[]).map((key) => {
                const a = AREAS[key];
                const c = COLOR_MAP[a.color];
                return (
                  <div key={key} className={cn("rounded-2xl border p-5", c.border, "bg-white/3")}>
                    <div className={cn("text-sm font-bold mb-4", c.text)}>{a.name}</div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50 flex items-center gap-1.5"><Train className="h-3 w-3" /> Metro walk</span>
                        <span className="text-sm font-bold text-white">{a.metroMin} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50 flex items-center gap-1.5"><Clock className="h-3 w-3" /> To Churchgate</span>
                        <span className="text-sm font-bold text-white">{a.commuteCSTMin} min</span>
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <div className="text-[10px] text-white/30 mb-1">Connectivity</div>
                        <div className="text-xs text-white/60">{a.connectivity}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* LIFESTYLE TAB */}
          {activeTab === "lifestyle" && (
            <motion.div key="lifestyle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid sm:grid-cols-3 gap-4"
            >
              {(["malad", "kandivali", "borivali"] as AreaKey[]).map((key) => {
                const a = AREAS[key];
                const c = COLOR_MAP[a.color];
                return (
                  <div key={key} className={cn("rounded-2xl border p-5", c.border, "bg-white/3")}>
                    <div className={cn("text-sm font-bold mb-1", c.text)}>{a.name}</div>
                    <div className="text-[11px] text-white/40 mb-4">{a.tagline}</div>

                    <div className="space-y-1.5 mb-4">
                      {a.pros.map((p) => (
                        <div key={p} className="flex items-start gap-2 text-xs text-white/70">
                          <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" /> {p}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5 mb-4">
                      {a.cons.map((c2) => (
                        <div key={c2} className="flex items-start gap-2 text-xs text-white/40">
                          <X className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-400/70" /> {c2}
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-white/5">
                      <div className="text-[10px] text-white/30 mb-1.5">Landmarks</div>
                      <div className="flex flex-wrap gap-1">
                        {a.landmarks.map((l) => (
                          <span key={l} className="rounded-full bg-white/5 border border-white/8 px-2 py-0.5 text-[10px] text-white/50">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* SPACE TAB */}
          {activeTab === "space" && (
            <motion.div key="space" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid sm:grid-cols-3 gap-4"
            >
              {(["malad", "kandivali", "borivali"] as AreaKey[]).map((key) => {
                const a = AREAS[key];
                const c = COLOR_MAP[a.color];
                return (
                  <div key={key} className={cn("rounded-2xl border p-5", c.border, "bg-white/3")}>
                    <div className={cn("text-sm font-bold mb-1", c.text)}>{a.name}</div>
                    <div className="text-[11px] text-white/40 mb-4">{a.societyTypes}</div>
                    <div className="space-y-2 mb-5">
                      <div className="text-[10px] text-white/30 mb-1">Best for</div>
                      {a.bestFor.map((b) => (
                        <div key={b} className={cn("rounded-lg border px-3 py-1.5 text-xs font-semibold", c.badge, c.border)}>
                          {b}
                        </div>
                      ))}
                    </div>
                    <a
                      href={`/${key}`}
                      className={cn(
                        "flex w-full items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition hover:bg-white/5",
                        c.text, c.border
                      )}
                    >
                      <MapPin className="h-3 w-3" /> Browse {a.name} listings
                    </a>
                  </div>
                );
              })}
            </motion.div>
          )}

        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl border border-white/8 bg-white/3 p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <div className="text-sm font-bold text-white">Can't decide?</div>
            <p className="text-xs text-white/45 mt-0.5">Share your requirements once — we'll tell you which area fits your budget best and send options from all three.</p>
          </div>
          <a
            href="#lead"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-[0_6px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_10px_30px_rgba(255,255,255,0.25)] transition whitespace-nowrap"
          >
            Get matched to best area →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
