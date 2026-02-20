import React from "react";
import { motion } from "framer-motion";
import { Home, Search, MessageCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center max-w-md"
      >
        {/* Big number */}
        <div className="text-[120px] font-black leading-none text-white/5 select-none">
          404
        </div>
        <div className="-mt-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30 mb-5">
            <Search className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Page not found</h1>
          <p className="mt-2 text-white/50 text-sm leading-relaxed">
            This page doesn't exist. But your perfect flat in Malad, Kandivali, or Borivali does.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.25)] transition"
          >
            <Home className="h-4 w-4" /> Home
          </a>
          <a
            href="https://wa.me/917498369191"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp us
          </a>
        </div>

        {/* Quick links */}
        <div className="mt-10 border-t border-white/8 pt-8">
          <div className="text-xs text-white/30 mb-4 uppercase tracking-wider">Quick links</div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Malad Rentals", href: "/malad" },
              { label: "Kandivali Rentals", href: "/kandivali" },
              { label: "Borivali Rentals", href: "/borivali" },
              { label: "Find a flat", href: "/#lead" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
