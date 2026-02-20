import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, IndianRupee, Lightbulb } from "lucide-react";
import { cn } from "../lib/utils";

function fmtL(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}k`;
}

function Ring({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </svg>
  );
}

const SALARY_PRESETS = [30000, 50000, 75000, 100000, 150000];

export default function AffordabilityCalculator() {
  const [salary, setSalary] = useState(75000);
  const [lifestyle, setLifestyle] = useState<"lean" | "balanced" | "comfortable">("balanced");

  const ratios = { lean: 0.25, balanced: 0.33, comfortable: 0.42 };

  const analysis = useMemo(() => {
    const ratio = ratios[lifestyle];
    const maxRent = Math.round((salary * ratio) / 1000) * 1000;
    const food = Math.round(salary * 0.2);
    const transport = Math.round(salary * 0.08);
    const savings = Math.round(salary * (1 - ratio - 0.2 - 0.08 - 0.05));
    const misc = salary - maxRent - food - transport - Math.max(0, savings);

    const rentPct = Math.round((maxRent / salary) * 100);
    const foodPct = Math.round((food / salary) * 100);
    const savePct = Math.max(0, Math.round((savings / salary) * 100));

    let recommendation = "";
    if (maxRent < 20000) recommendation = "Best options: 1 BHK in Borivali East/West";
    else if (maxRent < 35000) recommendation = "Good fit: 1 BHK in Kandivali or Malad East";
    else if (maxRent < 50000) recommendation = "Ideal for: 2 BHK semi-furnished in Malad/Kandivali West";
    else recommendation = "Premium pick: 2–3 BHK furnished in Malad West or Kandivali West";

    return { maxRent, food, transport, savings, misc, rentPct, foodPct, savePct, recommendation };
  }, [salary, lifestyle]);

  return (
    <section className="relative bg-white py-16 sm:py-20 overflow-hidden">
      {/* Subtle bg */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-50 blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-sky-50 blur-3xl opacity-60" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 mb-3 shadow-sm">
            <Calculator className="h-3.5 w-3.5 text-emerald-600" />
            Affordability Calculator
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            What rent fits your income?
          </h2>
          <p className="mt-2 text-slate-500 max-w-lg mx-auto">
            See exactly how much you can spend on rent without stretching your finances.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
          >
            {/* Salary slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-emerald-600" />
                  Monthly take-home salary
                </label>
                <span className="text-xl font-bold text-slate-900">{fmtL(salary)}</span>
              </div>
              <input
                type="range"
                min={15000}
                max={300000}
                step={5000}
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              {/* Presets */}
              <div className="mt-3 flex flex-wrap gap-2">
                {SALARY_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSalary(p)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold transition",
                      salary === p
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {fmtL(p)}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifestyle */}
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-3">Spending style</div>
              <div className="grid grid-cols-3 gap-2">
                {(["lean", "balanced", "comfortable"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLifestyle(l)}
                    className={cn(
                      "rounded-xl border py-3 text-xs font-semibold transition capitalize",
                      lifestyle === l
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {l === "lean" ? "🧘 Lean" : l === "balanced" ? "⚖️ Balanced" : "✨ Comfortable"}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Lean = 25% on rent · Balanced = 33% · Comfortable = 42%
              </p>
            </div>

            {/* Recommendation */}
            <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="flex items-start gap-2.5">
                <Lightbulb className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-800">Our recommendation</div>
                  <div className="mt-1 text-sm text-emerald-700">{analysis.recommendation}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-slate-950 p-6 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.12)]"
          >
            <div className="text-sm font-semibold text-white/70 mb-5">Monthly budget breakdown</div>

            {/* Big ring */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <Ring pct={analysis.rentPct} color="#10b981" size={96} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-lg font-black text-white">{analysis.rentPct}%</div>
                  <div className="text-[10px] text-white/50">rent</div>
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-400">{fmtL(analysis.maxRent)}</div>
                <div className="text-sm text-white/60 mt-1">max recommended rent</div>
                <div className="mt-2 text-xs text-white/40">
                  Based on {fmtL(salary)}/mo income
                </div>
              </div>
            </div>

            {/* Bars */}
            {[
              { label: "Rent", val: analysis.maxRent, pct: analysis.rentPct, color: "#10b981" },
              { label: "Food & groceries", val: analysis.food, pct: analysis.foodPct, color: "#38bdf8" },
              { label: "Transport", val: analysis.transport, pct: 8, color: "#a78bfa" },
              { label: "Savings", val: Math.max(0, analysis.savings), pct: analysis.savePct, color: "#fbbf24" },
              { label: "Other", val: analysis.misc, pct: 5, color: "#6b7280" },
            ].map((item) => (
              <div key={item.label} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">{item.label}</span>
                  <span className="text-xs font-bold text-white">{fmtL(item.val)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                    style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }}
                  />
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                Your savings rate
              </div>
              <div className="text-sm font-bold text-emerald-400">{analysis.savePct}%</div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-slate-500">
            Budget <span className="font-bold text-slate-900">{fmtL(analysis.maxRent)}/mo</span>?{" "}
            <a href="#lead" className="text-emerald-600 font-semibold hover:underline">
              Get a shortlist that fits →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
