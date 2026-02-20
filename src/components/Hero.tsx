import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import heroImg from "../assets/hero-mumbai.png";
import { useLeadDraft, Area, Bhk } from "../state/leadDraft";
import { track } from "../lib/track";
import { getAbVariant } from "../lib/ab";
import { Users, Zap, ShieldCheck } from "lucide-react";
import { sessionTracker } from "../lib/sessionTracker";

const CYCLING_AREAS = ["Malad West", "Kandivali West", "Borivali West", "Malad East", "Kandivali East", "Borivali East"];

function scrollToLead() {
  document.getElementById("lead")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function fmtINR(k: number) { return `₹${k}k`; }

function useViewers() {
  const [count, setCount] = useState(1);
  useEffect(() => {
    setCount(sessionTracker.getCount());
    return sessionTracker.subscribe(setCount);
  }, []);
  return count;
}

function CyclingText() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx((i) => (i + 1) % CYCLING_AREAS.length); setVisible(true); }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className="relative inline-block min-w-0 max-w-full">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.span key={idx} initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -16, filter: "blur(6px)" }} transition={{ duration: 0.35 }} className="inline-block bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
            {CYCLING_AREAS[idx]}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function StatPill({ icon, value, label, delay = 0 }: { icon: React.ReactNode; value: string; label: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="flex items-center gap-2 rounded-full border border-white/12 bg-black/40 px-3 py-2 text-xs backdrop-blur">
      <span className="text-emerald-400">{icon}</span>
      <span className="font-bold text-white">{value}</span>
      <span className="text-white/55">{label}</span>
    </motion.div>
  );
}

type HeroProps = { forcedHeadline?: string; forcedSubhead?: string; forcedAreaLabel?: string; };

export default function Hero(props: HeroProps) {
  const bgRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const { draft, setDraft } = useLeadDraft();
  const viewers = useViewers();
  const abVariant = getAbVariant();

  const area = (draft.area ?? "Malad West") as Area;
  const bhk = (draft.bhk ?? "2") as Bhk;
  const budgetMinK = typeof draft.budgetMinK === "number" ? draft.budgetMinK : 40;
  const budgetMaxK = typeof draft.budgetMaxK === "number" ? draft.budgetMaxK : 60;

  useEffect(() => {
    track("hero_view", { abVariant });
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        setScrolled(y > 8);
        if (!reduce && bgRef.current) {
          bgRef.current.style.transform = `translate3d(0, ${Math.min(y * 0.18, 90)}px, 0)`;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, []);

  const PRESETS = [
    { a: 30, b: 45, label: "30–45k" },
    { a: 40, b: 60, label: "40–60k" },
    { a: 60, b: 90, label: "60–90k" },
    { a: 90, b: 130, label: "90–130k" },
  ];

  return (
    <header className="relative w-full overflow-hidden bg-black">
      <div className={`pointer-events-none absolute left-0 right-0 top-0 z-20 h-16 bg-gradient-to-b from-black/70 to-transparent transition-opacity ${scrolled ? "opacity-100" : "opacity-0"}`} />
      <div className="absolute inset-0">
        <div ref={bgRef} className="absolute inset-0 will-change-transform">
          <img src={heroImg} alt="Mumbai skyline" className="h-[110%] w-full object-cover opacity-60" loading="eager" decoding="async" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_20%,rgba(16,185,129,0.12),transparent_65%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-10 sm:pb-16 sm:pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left copy */}
          <div>
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-emerald-300 font-bold">{viewers} {viewers === 1 ? "visitor" : "people"}</span> searching right now
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {props.forcedHeadline ? props.forcedHeadline : (
                <>Find your flat in<br className="hidden sm:block" /> <CyclingText /></>
              )}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
              {props.forcedSubhead ?? "Share your requirements once. Get a WhatsApp shortlist of verified flats in 10–15 minutes. No portals. No spam."}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-7 flex flex-wrap gap-3">
              <motion.button onClick={() => { track("hero_primary_click"); scrollToLead(); }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-[0_12px_40px_rgba(255,255,255,0.2)]">
                Get free shortlist
              </motion.button>
              <motion.a href="https://wa.me/917498369191" target="_blank" rel="noreferrer" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#25D366]/20 px-6 py-3 text-sm font-bold text-white backdrop-blur hover:bg-[#25D366]/30">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M20 11.5c0 4.142-3.582 7.5-8 7.5a9.3 9.3 0 0 1-3.01-.5L4 20l1.08-3.2A7.02 7.02 0 0 1 4 11.5C4 7.358 7.582 4 12 4s8 3.358 8 7.5Z" /></svg>
                WhatsApp us
              </motion.a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-7 flex flex-wrap gap-2">
              <StatPill icon={<Zap className="h-3.5 w-3.5" />} value="10–15 min" label="response time" delay={0.5} />
              <StatPill icon={<ShieldCheck className="h-3.5 w-3.5" />} value="500+" label="families placed" delay={0.6} />
              <StatPill icon={<Users className="h-3.5 w-3.5" />} value="4.9★" label="satisfaction" delay={0.7} />
            </motion.div>
          </div>

          {/* Right mini form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.55 }} className="lg:justify-self-end w-full max-w-sm">
            <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-black/60 p-5 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95)] backdrop-blur-xl">
              <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-bold text-white">Quick preference check</div>
                    <div className="text-xs text-white/50 mt-0.5">Pre-fills the form below</div>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">20 sec</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1.5 text-xs font-semibold text-white/65">Preferred area</div>
                    <select value={area} onChange={(e) => setDraft({ area: e.target.value as Area })} className="w-full rounded-xl border border-white/10 bg-white/8 px-3 py-2.5 text-sm text-white outline-none focus:border-white/25">
                      {(["Malad West","Malad East","Kandivali West","Kandivali East","Borivali West","Borivali East"] as Area[]).map((a) => (
                        <option key={a} value={a} className="bg-slate-900">{a}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="mb-1.5 text-xs font-semibold text-white/65">BHK</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["1","2","3","4+"] as Bhk[]).map((v) => (
                        <button key={v} type="button" onClick={() => setDraft({ bhk: v })} className={`rounded-xl py-2.5 text-xs font-bold transition ${bhk === v ? "bg-white text-slate-900" : "bg-white/8 text-white/70 hover:bg-white/12 border border-white/10"}`}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-xs font-semibold text-white/65">Budget</div>
                      <div className="text-xs font-bold text-white">{fmtINR(budgetMinK)} – {fmtINR(budgetMaxK)}</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {PRESETS.map((p) => (
                        <button key={p.label} type="button" onClick={() => setDraft({ budgetMinK: p.a, budgetMaxK: p.b })} className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${budgetMinK === p.a && budgetMaxK === p.b ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10"}`}>{p.label}</button>
                      ))}
                    </div>
                    <input type="range" min={10} max={200} step={5} value={budgetMaxK} onChange={(e) => setDraft({ budgetMaxK: Number(e.target.value) })} className="w-full accent-emerald-500" />
                  </div>
                  <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => { track("hero_miniform_continue", { area, bhk, budgetMinK, budgetMaxK }); scrollToLead(); }} className="w-full rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_40px_rgba(37,211,102,0.4)] hover:shadow-[0_14px_50px_rgba(37,211,102,0.55)] transition">
                    Continue to full form →
                  </motion.button>
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/40">
                  <ShieldCheck className="h-3 w-3" /> No spam · Verified options only · Free service
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
