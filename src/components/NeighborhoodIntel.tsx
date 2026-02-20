import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Train, TrendingUp, Building2, Users, MapPin, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

type AreaData = {
  name: string;
  slug: string;
  tagline: string;
  avgRent1bhk: string;
  avgRent2bhk: string;
  demandScore: number; // 0–100
  metroMin: number;
  supplyLabel: string;
  supplyColor: string;
  landmarks: string[];
  gradient: string;
  accentColor: string;
};

const AREAS: AreaData[] = [
  {
    name: "Malad West",
    slug: "malad",
    tagline: "Metro-connected • IT hub proximity",
    avgRent1bhk: "₹28–40k",
    avgRent2bhk: "₹42–60k",
    demandScore: 88,
    metroMin: 3,
    supplyLabel: "High Demand",
    supplyColor: "text-orange-400 bg-orange-400/10 border-orange-400/25",
    landmarks: ["Infiniti Mall", "Mindspace", "Link Road", "Inorbit"],
    gradient: "from-emerald-600/20 via-transparent to-transparent",
    accentColor: "#10b981",
  },
  {
    name: "Kandivali West",
    slug: "kandivali",
    tagline: "Family-first • Green cover • Malls",
    avgRent1bhk: "₹25–38k",
    avgRent2bhk: "₹38–55k",
    demandScore: 82,
    metroMin: 5,
    supplyLabel: "Moderate",
    supplyColor: "text-sky-400 bg-sky-400/10 border-sky-400/25",
    landmarks: ["Thakur Village", "Poisar", "Mahavir Nagar", "Charkop"],
    gradient: "from-sky-600/20 via-transparent to-transparent",
    accentColor: "#38bdf8",
  },
  {
    name: "Borivali West",
    slug: "borivali",
    tagline: "Spacious homes • Fast Mumbai access",
    avgRent1bhk: "₹22–34k",
    avgRent2bhk: "₹34–50k",
    demandScore: 74,
    metroMin: 7,
    supplyLabel: "Available",
    supplyColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
    landmarks: ["Shimpoli", "IC Colony", "Eksar", "Dahanukar Wadi"],
    gradient: "from-violet-600/20 via-transparent to-transparent",
    accentColor: "#a78bfa",
  },
];

function AnimatedBar({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: started ? `${value}%` : "0%",
          background: color,
          boxShadow: `0 0 8px 1px ${color}60`,
        }}
      />
    </div>
  );
}

export default function NeighborhoodIntel() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative bg-slate-950 py-16 sm:py-20 overflow-hidden">
      {/* bg */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60 mb-3">
                Neighbourhood Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                Know before you look
              </h2>
              <p className="mt-2 text-white/55 max-w-lg">
                Live demand scores, avg rent ranges, and key landmarks for each area — so you walk in informed.
              </p>
            </div>
            {/* Area tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {AREAS.map((a, i) => (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "rounded-xl px-3 py-2 text-xs font-semibold transition",
                    active === i
                      ? "bg-white text-slate-900"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {a.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Cards grid */}
        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {AREAS.map((area, i) => (
            <motion.div
              key={area.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setActive(i)}
              className={cn(
                "relative overflow-hidden rounded-3xl border cursor-pointer transition-all duration-300",
                active === i
                  ? "border-white/25 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]"
                  : "border-white/10 hover:border-white/20"
              )}
            >
              {/* gradient bg */}
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", area.gradient)} />
              <div className="absolute inset-0 bg-slate-900/80" />

              <div className="relative p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" style={{ color: area.accentColor }} />
                      <h3 className="font-bold text-white text-base">{area.name}</h3>
                    </div>
                    <p className="mt-1 text-xs text-white/50">{area.tagline}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold", area.supplyColor)}>
                    {area.supplyLabel}
                  </span>
                </div>

                {/* Demand score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1 text-xs text-white/60">
                      <TrendingUp className="h-3 w-3" /> Demand Score
                    </span>
                    <span className="text-sm font-bold text-white">{area.demandScore}/100</span>
                  </div>
                  <AnimatedBar value={area.demandScore} color={area.accentColor} />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="rounded-xl bg-white/5 p-2.5">
                    <div className="text-[10px] text-white/50 flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> 1 BHK avg
                    </div>
                    <div className="mt-1 text-sm font-bold text-white">{area.avgRent1bhk}</div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2.5">
                    <div className="text-[10px] text-white/50 flex items-center gap-1">
                      <Users className="h-3 w-3" /> 2 BHK avg
                    </div>
                    <div className="mt-1 text-sm font-bold text-white">{area.avgRent2bhk}</div>
                  </div>
                </div>

                {/* Metro */}
                <div className="flex items-center gap-2 mb-4 rounded-xl bg-white/5 px-3 py-2">
                  <Train className="h-3.5 w-3.5 text-white/50" />
                  <span className="text-xs text-white/70">
                    Metro station <span className="font-bold text-white">{area.metroMin} min</span> walk
                  </span>
                </div>

                {/* Landmarks */}
                <div className="flex flex-wrap gap-1.5">
                  {area.landmarks.map((l) => (
                    <span
                      key={l}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60"
                    >
                      {l}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <a
                  href={`/${area.slug}`}
                  className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition group"
                >
                  <span>View {area.name.split(" ")[0]} options</span>
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
