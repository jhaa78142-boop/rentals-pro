import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, MessageCircle } from "lucide-react";
import { cn } from "../lib/utils";

type Item = { q: string; a: string };

const ITEMS: Item[] = [
  {
    q: "What areas do you cover?",
    a: "Malad East & West, Kandivali East & West, and Borivali East & West. We know every society, builder, and landlord in these areas — no portals, direct contacts."
  },
  {
    q: "Is there a brokerage fee?",
    a: "Depends on the specific listing. We always tell you upfront before your first visit — no surprises. Many landlords cover brokerage; we disclose when they don't."
  },
  {
    q: "How fast can you arrange a visit?",
    a: "Same day or next day in most cases. We coordinate directly with landlords so there are no delays waiting for callbacks or confirmations."
  },
  {
    q: "Do you help with the rental agreement?",
    a: "Yes. We walk you through the key clauses, deposit terms, lock-in period, and move-in checklist so you know exactly what you're signing."
  },
  {
    q: "Is my phone number safe?",
    a: "Completely. We never share or sell your data. Your contact is only used to send you the shortlist you requested. You will not receive unsolicited calls."
  },
  {
    q: "What types of homes can I find?",
    a: "1 BHK, 2 BHK, 3 BHK — furnished, semi-furnished, and bare shell. Budget range ₹20k–₹1.5L/mo. We work across all major society buildings in the Western Suburbs."
  },
  {
    q: "Do you handle bachelor or company requirements?",
    a: "Yes. We filter by profile type — many buildings have rules about who they accept and we know which ones work for bachelors, families, or corporate leases."
  },
  {
    q: "What if I don't like the options in the shortlist?",
    a: "Tell us specifically what didn't work — too small, wrong floor, price, society amenities — and we'll send a revised shortlist. No extra charge."
  },
];

function Accordion({ item, index }: { item: Item; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "rounded-2xl border transition-colors duration-200",
        open
          ? "border-slate-300 bg-white shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={cn(
          "text-sm font-semibold leading-snug",
          open ? "text-slate-900" : "text-slate-700"
        )}>
          {item.q}
        </span>
        <span className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
          open ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
        )}>
          {open
            ? <Minus className="h-3 w-3" />
            : <Plus className="h-3 w-3" />
          }
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="relative bg-white py-14 sm:py-20">
      <div className="relative mx-auto max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Everything you need to know before submitting.
          </p>
        </motion.div>

        <div className="space-y-2">
          {ITEMS.map((it, i) => (
            <Accordion key={it.q} item={it} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
        >
          <div>
            <div className="text-sm font-semibold text-slate-900">Still have a question?</div>
            <p className="text-xs text-slate-500 mt-0.5">We reply on WhatsApp within minutes.</p>
          </div>
          <a
            href="https://wa.me/917498369191?text=Hi%2C%20I%20have%20a%20question%20about%20renting."
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.45)] transition"
          >
            <MessageCircle className="h-4 w-4" />
            Ask on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
