import React from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Clock, Shield, Star, ArrowRight } from "lucide-react";

const AREA_LINKS = [
  { label: "Malad West Rentals", href: "/malad" },
  { label: "Malad East Rentals", href: "/malad" },
  { label: "Kandivali West Rentals", href: "/kandivali" },
  { label: "Kandivali East Rentals", href: "/kandivali" },
  { label: "Borivali West Rentals", href: "/borivali" },
  { label: "Borivali East Rentals", href: "/borivali" },
];

const TRUST_BADGES = [
  { icon: <Clock className="h-4 w-4" />, label: "10–15 min response SLA" },
  { icon: <Shield className="h-4 w-4" />, label: "Verified listings only" },
  { icon: <Star className="h-4 w-4" />, label: "4.9★ tenant rating" },
  { icon: <MessageCircle className="h-4 w-4" />, label: "WhatsApp-first service" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#050810] text-white">
      {/* Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18),transparent_60%)]" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12),transparent_60%)]" />
      </div>

      {/* CTA strip */}
      <div className="relative border-b border-white/8">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-2xl font-black">Ready to find your flat?</div>
              <p className="mt-1 text-white/55 text-sm">Takes 90 seconds. Response in 10–15 minutes.</p>
            </div>
            <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
              <a href="#lead" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.25)] transition">
                Get shortlist <ArrowRight className="h-4 w-4" />
              </a>
              <a href="https://wa.me/917498369191" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_30px_rgba(37,211,102,0.3)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.45)] transition">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="relative border-b border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST_BADGES.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-xs text-white/50">
                <span className="text-emerald-400">{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 font-black text-sm">MR</div>
              <span className="text-lg font-black tracking-tight">MumbaiRentals</span>
            </div>
            <p className="text-sm leading-relaxed text-white/55 max-w-xs">
              Western suburbs rental specialists. Verified options, fast responses, zero spam. Serving Malad, Kandivali & Borivali since 2019.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { label: "Instagram", href: "#", path: "M4 4h16v16H4z M4 4h16v16H4z" },
                { label: "WhatsApp", href: "https://wa.me/917498369191", path: "M20 11.5c0 4.142-3.582 7.5-8 7.5a9.3 9.3 0 0 1-3.01-.5L4 20l1.08-3.2A7.02 7.02 0 0 1 4 11.5C4 7.358 7.582 4 12 4s8 3.358 8 7.5Z" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d={s.path} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Area links */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">Areas we cover</div>
            <ul className="space-y-2.5">
              {AREA_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="group flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition">
                    <span className="opacity-0 group-hover:opacity-100 transition text-emerald-400 text-xs">→</span>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">Quick links</div>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "How it works", href: "/#how" },
                { label: "Neighbourhood guide", href: "/#areas" },
                { label: "Affordability calculator", href: "/#calculator" },
                { label: "Find a home", href: "/#lead" },
                { label: "FAQ", href: "/#faq" },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="group flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition">
                    <span className="opacity-0 group-hover:opacity-100 transition text-emerald-400 text-xs">→</span>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">Contact us</div>
            <ul className="space-y-3">
              <li>
                <a href="tel:+917498369191" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition">
                  <Phone className="h-4 w-4 text-white/30" /> +91 74983 69191
                </a>
              </li>
              <li>
                <a href="mailto:hello@mumbairentals.in" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition">
                  <Mail className="h-4 w-4 text-white/30" /> hello@mumbairentals.in
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="h-4 w-4 text-white/30 mt-0.5 shrink-0" />
                <span>Malad West, Mumbai — 400064</span>
              </li>
            </ul>

            {/* Response time badge */}
            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-bold text-emerald-300">Typically replies in 10–15 minutes</span>
              </div>
              <p className="mt-1 text-xs text-white/40">Mon–Sat, 9am–10pm IST</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/8 pt-8 text-xs text-white/35">
          <span>© {year} MumbaiRentals. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60 transition">Privacy Policy</a>
            <a href="#" className="hover:text-white/60 transition">Terms of Service</a>
            <a href="#" className="hover:text-white/60 transition">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
