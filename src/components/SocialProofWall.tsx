import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle2, MessageCircle } from "lucide-react";
import { cn } from "../lib/utils";

type Review = {
  id: number;
  name: string;
  area: string;
  bhk: string;
  budget: string;
  text: string;
  outcome: string;
  timeToShortlist: string;
  avatar: string;
  verified: boolean;
  waSnippet?: string;
};

const REVIEWS: Review[] = [
  {
    id: 1,
    name: "Aayushi S.",
    area: "Malad West",
    bhk: "2BHK",
    budget: "₹45k",
    text: "Filled the form at 10am, had 5 options on WhatsApp by 10:40. Visited two the same evening. Moved in within a week.",
    outcome: "Moved in 6 days",
    timeToShortlist: "38 minutes",
    avatar: "AS",
    verified: true,
    waSnippet: "Hi! Here are 5 verified 2BHK options in Malad West within ₹45k…",
  },
  {
    id: 2,
    name: "Rohan M.",
    area: "Kandivali East",
    bhk: "1BHK",
    budget: "₹30k",
    text: "I was skeptical — tried 3 portals before this. Here I got a call in 12 minutes. Transparent about brokerage, no games.",
    outcome: "Found home in 4 days",
    timeToShortlist: "12 minutes",
    avatar: "RM",
    verified: true,
    waSnippet: "Hello Rohan! Found 4 options matching ₹30k 1BHK Kandivali East…",
  },
  {
    id: 3,
    name: "Priya K. (HR)",
    area: "Borivali West",
    bhk: "2BHK",
    budget: "₹50k",
    text: "Needed housing for a relocating employee urgently. Team was incredibly professional. Options were pre-verified and ready to visit.",
    outcome: "Placed employee in 3 days",
    timeToShortlist: "20 minutes",
    avatar: "PK",
    verified: true,
  },
  {
    id: 4,
    name: "Vikram & Neha",
    area: "Malad East",
    bhk: "2BHK",
    budget: "₹55k",
    text: "As a couple moving from Pune, we had zero local contacts. This service was like having a local friend who knew every building. Incredible.",
    outcome: "Moved in 8 days",
    timeToShortlist: "25 minutes",
    avatar: "VN",
    verified: true,
    waSnippet: "Hey! 3 furnished 2BHKs in Malad East, all within ₹55k range…",
  },
  {
    id: 5,
    name: "Deepika A.",
    area: "Kandivali West",
    bhk: "1BHK",
    budget: "₹28k",
    text: "The WhatsApp shortlist had photos, exact rent, deposit, and brokerage. No surprises. That alone saved me days of chasing agents.",
    outcome: "Moved in 5 days",
    timeToShortlist: "18 minutes",
    avatar: "DA",
    verified: true,
  },
];

function Stars({ n = 5 }: { n?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function AvatarCircle({ initials, index }: { initials: string; index: number }) {
  const colors = [
    "from-emerald-500 to-teal-600",
    "from-sky-500 to-blue-600",
    "from-violet-500 to-purple-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
  ];
  return (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white text-sm font-bold shadow-md", colors[index % colors.length])}>
      {initials}
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative flex flex-col rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/8 hover:border-white/20 transition-all duration-300 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <AvatarCircle initials={review.avatar} index={index} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white text-sm">{review.name}</span>
            {review.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <CheckCircle2 className="h-2.5 w-2.5" /> Verified
              </span>
            )}
          </div>
          <div className="text-xs text-white/50 mt-0.5">
            {review.bhk} · {review.area} · {review.budget}/mo
          </div>
        </div>
        <Stars />
      </div>

      {/* Review text */}
      <p className="text-sm text-white/75 leading-relaxed flex-1">"{review.text}"</p>

      {/* WhatsApp snippet */}
      {review.waSnippet && expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 rounded-2xl bg-[#0b3320] border border-emerald-900/50 px-4 py-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">WhatsApp Shortlist Preview</span>
          </div>
          <p className="text-xs text-emerald-100/80 italic">"{review.waSnippet}"</p>
        </motion.div>
      )}

      {/* Footer stats */}
      <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-white/8">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-[11px] text-white/40">Shortlist in</div>
            <div className="text-xs font-bold text-emerald-400">{review.timeToShortlist}</div>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="text-center">
            <div className="text-[11px] text-white/40">Outcome</div>
            <div className="text-xs font-bold text-white">{review.outcome}</div>
          </div>
        </div>
        {review.waSnippet && (
          <span className="text-[10px] text-white/30 group-hover:text-white/50 transition">
            {expanded ? "Show less ↑" : "See WhatsApp ↓"}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function SocialProofWall() {
  return (
    <section className="relative bg-slate-950 py-16 sm:py-20 overflow-hidden">
      {/* bg glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-amber-500/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-emerald-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-white/20" />
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
              <Stars n={5} /> 4.9 avg rating
            </span>
            <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-white/20" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Real people. Real moves.
          </h2>
          <p className="mt-2 text-white/55 max-w-lg mx-auto">
            Every card is a genuine tenant who found their home through us. Tap to see their WhatsApp shortlist preview.
          </p>
        </motion.div>

        {/* Masonry-ish grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {REVIEWS.map((r, i) => (
            <div key={r.id} className="break-inside-avoid">
              <ReviewCard review={r} index={i} />
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { num: "500+", label: "Families placed", color: "text-emerald-400" },
            { num: "18 min", label: "Avg shortlist time", color: "text-sky-400" },
            { num: "4.9★", label: "Avg satisfaction", color: "text-amber-400" },
            { num: "0 spam", label: "Calls per shortlist", color: "text-violet-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <div className={cn("text-2xl font-black", s.color)}>{s.num}</div>
              <div className="mt-1 text-xs text-white/50">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
