import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, BadgeCheck, MessageCircle } from "./icons";

const ITEMS = [
  { icon: ShieldCheck, title: "Verified listings", desc: "Quality checks before we share" },
  { icon: Clock, title: "10–15 min response", desc: "Fast scheduling in Western suburbs" },
  { icon: BadgeCheck, title: "Transparent", desc: "Clear terms, no games" },
  { icon: MessageCircle, title: "WhatsApp shortlist", desc: "Options direct on chat" },
];

export default function TrustStrip() {
  return (
    <div className="relative -mt-10 sm:-mt-14 z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-auto max-w-6xl px-3 sm:px-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-xl p-3 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.08 }}
              className="flex items-start gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-white/5 p-2.5 sm:p-4"
            >
              <div className="mt-0.5 inline-flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/20">
                <it.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-white text-xs sm:text-sm font-semibold leading-tight">{it.title}</div>
                <div className="text-white/60 text-[10px] sm:text-xs leading-relaxed mt-0.5 hidden sm:block">{it.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
