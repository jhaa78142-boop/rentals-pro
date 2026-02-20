import React, { useEffect, useState } from "react";
import DarkModeToggle from "./DarkModeToggle";
import { Home, Map, Calculator, FileText, HelpCircle } from "lucide-react";

type NavItem = { id: string; label: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  { id: "top",        label: "Home",     icon: <Home className="h-3.5 w-3.5" /> },
  { id: "areas",      label: "Areas",    icon: <Map className="h-3.5 w-3.5" /> },
  { id: "calculator", label: "Budget",   icon: <Calculator className="h-3.5 w-3.5" /> },
  { id: "lead",       label: "Find Flat",icon: <FileText className="h-3.5 w-3.5" /> },
  { id: "faq",        label: "FAQ",      icon: <HelpCircle className="h-3.5 w-3.5" /> },
];

// Desktop nav also includes Compare
const DESKTOP_NAV = [
  { id: "top",        label: "Home" },
  { id: "areas",      label: "Areas" },
  { id: "compare",    label: "Compare" },
  { id: "calculator", label: "Budget" },
  { id: "how",        label: "Process" },
  { id: "lead",       label: "Find a Flat" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Navbar() {
  const [activeId, setActiveId] = useState("top");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const allIds = [...new Set([...NAV, ...DESKTOP_NAV].map((n) => n.id))];
    const els = allIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (top?.target?.id) setActiveId(top.target.id);
      },
      { threshold: [0.15, 0.3, 0.5], rootMargin: "-20% 0px -60% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* ── Top navbar ── */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className={`mx-auto max-w-6xl px-3 sm:px-6 transition-all duration-300 ${scrolled ? "pt-2" : "pt-3 sm:pt-5"}`}>
          <div className={`flex items-center justify-between rounded-xl sm:rounded-2xl border border-white/10 bg-slate-950/85 backdrop-blur-xl px-3 sm:px-5 py-2.5 sm:py-3 shadow-[0_10px_40px_rgba(0,0,0,0.4)] ${scrolled ? "ring-1 ring-white/5" : ""}`}>
            {/* Brand */}
            <a
              href="#top"
              onClick={(e) => { e.preventDefault(); scrollTo("top"); }}
              className="flex items-center gap-2 shrink-0"
            >
              <span className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-black ring-1 ring-emerald-500/30">
                MR
              </span>
              <span className="text-white font-bold tracking-tight text-sm sm:text-base hidden xs:block">
                Mumbai<span className="text-emerald-400">Rentals</span>
              </span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {DESKTOP_NAV.map((n) => (
                <a
                  key={n.id}
                  href={"#" + n.id}
                  onClick={(e) => { e.preventDefault(); scrollTo(n.id); }}
                  className={`px-3 py-2 rounded-xl text-sm transition-colors ${activeId === n.id ? "text-white bg-white/10" : "text-white/55 hover:text-white hover:bg-white/5"}`}
                >
                  {n.label}
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <DarkModeToggle />
              <a
                href="#lead"
                onClick={(e) => { e.preventDefault(); scrollTo("lead"); }}
                className="inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition whitespace-nowrap"
              >
                Get Shortlist
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-[55] md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="mx-3 mb-[70px] flex items-center justify-around rounded-2xl border border-white/8 bg-slate-950/96 px-1 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          {NAV.map((n) => {
            const active = n.id === activeId;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => scrollTo(n.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[48px] ${active ? "text-emerald-400" : "text-white/35 hover:text-white/60"}`}
              >
                {n.icon}
                <span className="text-[9px] font-semibold leading-none">{n.label}</span>
                {active && <span className="h-0.5 w-3 rounded-full bg-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
