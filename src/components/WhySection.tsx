import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, ShieldCheck, MessageSquare, Clock, Star, Zap } from "lucide-react";

const REASONS = [
  {
    icon: <RefreshCw className="h-5 w-5" />,
    title: "Inventory changes daily",
    desc: "What's shown online today may be taken tomorrow. We work with fresh, real-time availability — not stale portals.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Verified before you visit",
    desc: "Every option we share is confirmed available, photos matched, rent verified. No bait-and-switch.",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "WhatsApp is faster",
    desc: "Browsing 50 listings wastes hours. A curated 3–5 option WhatsApp list saves your weekend.",
  },
];

const BADGES = [
  { icon: <Zap className="h-4 w-4" />, label: "Fast replies" },
  { icon: <ShieldCheck className="h-4 w-4" />, label: "Verified options" },
  { icon: <Star className="h-4 w-4" />, label: "No spam" },
  { icon: <Clock className="h-4 w-4" />, label: "10–15 min response" },
];

const WHAT_YOU_GET = [
  "3–6 verified options matched to your exact budget",
  "Clear rent, deposit, and brokerage details upfront",
  "Visit scheduling with minimum back-and-forth",
  "Follow-ups until you find the right home",
];

export default function WhySection() {
  return (
    <section className="relative bg-slate-950 py-16 sm:py-20 text-white overflow-hidden">
      {/* bg glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 mb-4">
            Why we work differently
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Why we don't show you listings
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-white/65 text-sm sm:text-base">
            Online rental portals show thousands of stale, duplicate, and fake listings.
            We curate a shortlist of actually available, verified homes — delivered on WhatsApp.
          </p>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          {BADGES.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80"
            >
              <span className="text-emerald-400">{b.icon}</span>
              {b.label}
            </span>
          ))}
        </motion.div>

        {/* Reasons grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {REASONS.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/7 transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                {r.icon}
              </div>
              <h3 className="mt-4 font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm text-white/65 leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* What you get */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-12 rounded-3xl border border-emerald-500/20 bg-emerald-500/8 p-7 sm:p-8"
        >
          <div className="grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                What you get
              </div>
              <h3 className="text-xl font-semibold">Everything done for you</h3>
              <p className="mt-2 text-sm text-white/65">
                Share once. We handle the search, verification, scheduling, and follow-ups.
              </p>
            </div>
            <ul className="space-y-3">
              {WHAT_YOU_GET.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
