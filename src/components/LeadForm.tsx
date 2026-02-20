import React, { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import { onlyDigits } from "../lib/utils";
import { track } from "../lib/track";
import { getAbVariant } from "../lib/ab";
import { useLeadDraft, Area, Bhk } from "../state/leadDraft";
import { persistLastLead } from "./LeadResume";
import LocalityTypeahead from "./LocalityTypeahead";
import { getLocalitiesForArea } from "../lib/localities";
import { buildShareLink } from "../lib/urlPrefill";
import { useLocation } from "react-router-dom";

type Furnishing = "F" | "S" | "U";
type MoveIn = "Immediate" | "7" | "15" | "30+";
type Profile = "Family" | "Bachelor" | "Company";

type LeadPayload = {
  name: string;
  phone: string; // 10 digits
  area: Area;
  locality?: string;
  budgetRange: string; // e.g. "40-60k"
  bhk: Bhk;
  furnishing: Furnishing;
  moveIn: MoveIn;
  profile: Profile;
  notes?: string;
  source: "landing";
  abVariant?: "A" | "B";
  createdAtIso: string;
  landingUrl?: string;
  device?: "mobile" | "tablet" | "desktop";
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
};

type ApiOk = { leadId?: string; id?: string; message?: string };
type ApiErr = { message?: string; error?: string };

function envApiUrl() {
  const url = import.meta.env.VITE_LEAD_API_URL as string | undefined;
  return (url ?? "").trim();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toBudgetRange(minK: number, maxK: number) {
  const a = Math.round(minK / 5) * 5;
  const b = Math.round(maxK / 5) * 5;
  return `${a}-${b}k`;
}

function fmtINR(k: number) {
  return `₹${k}k`;
}

function getUtm() {
  const params = new URLSearchParams(window.location.search);
  const utm = {
    source: params.get("utm_source") ?? undefined,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
    term: params.get("utm_term") ?? undefined,
    content: params.get("utm_content") ?? undefined,
  };
  const any = Object.values(utm).some(Boolean);
  return any ? utm : undefined;
}

function scrollToTopOfForm() {
  const el = document.getElementById("lead");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function validatePhone(phone: string) {
  const p = onlyDigits(phone);
  if (p.length !== 10) return "Phone must be exactly 10 digits";
  return null;
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white ${className}`}
      aria-hidden="true"
    />
  );
}

function AnimatedCheck() {
  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15">
      <svg viewBox="0 0 52 52" className="h-7 w-7">
        <path
          className="check-path"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27 L22 35 L38 18"
        />
      </svg>
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-emerald-400/30" />
    </span>
  );
}

export default function LeadForm({
  onPhoneChange,
}: {
  onPhoneChange?: (phone10: string) => void;
}) {
  const apiUrl = envApiUrl();
  const { draft, setDraft } = useLeadDraft();
  const loc = useLocation();

  // Stepper (3-step feels premium + keeps conversion high)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 (prefill from hero)
  const [name, setName] = useState(draft.name ?? "");
  const [phone, setPhone] = useState(draft.phone ?? "");
  const [area, setArea] = useState<Area>(draft.area ?? "Malad West");
  const [locality, setLocality] = useState(draft.locality ?? "");

  // Budget slider (min/max in 'k') prefilled
  const [budgetMinK, setBudgetMinK] = useState<number>(typeof draft.budgetMinK === "number" ? draft.budgetMinK : 40);
  const [budgetMaxK, setBudgetMaxK] = useState<number>(typeof draft.budgetMaxK === "number" ? draft.budgetMaxK : 60);

  // Step 2
  const [bhk, setBhk] = useState<Bhk>(draft.bhk ?? "1");
  const [furnishing, setFurnishing] = useState<Furnishing>((draft.furnishing as Furnishing) ?? "S");
  const [moveIn, setMoveIn] = useState<MoveIn>((draft.moveIn as MoveIn) ?? "Immediate");
  const [profile, setProfile] = useState<Profile>((draft.profile as Profile) ?? "Family");
  const [notes, setNotes] = useState(draft.notes ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [successLeadId, setSuccessLeadId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // keep App in sync for WhatsApp widget (uses entered phone)
  useEffect(() => {
    const p = onlyDigits(phone);
    if (p.length === 10) onPhoneChange?.(p);
    else onPhoneChange?.("");
  }, [phone, onPhoneChange]);

  // keep draft synced for hero->form and later UX
  useEffect(() => {
    setDraft({
      name,
      phone: onlyDigits(phone),
      area,
      locality,
      budgetMinK,
      budgetMaxK,
      bhk,
      furnishing,
      moveIn,
      profile,
      notes,
    });
  }, [name, phone, area, locality, budgetMinK, budgetMaxK, bhk, furnishing, moveIn, profile, notes, setDraft]);

  // If area changes, keep locality only if it still belongs to that group; otherwise clear.
  const localitySuggestions = useMemo(() => getLocalitiesForArea(area), [area]);
  useEffect(() => {
    if (!locality) return;
    const exists = localitySuggestions.some((s) => s.toLowerCase() === locality.trim().toLowerCase());
    if (!exists) setLocality("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area]);

  const budgetRange = useMemo(() => toBudgetRange(budgetMinK, budgetMaxK), [budgetMinK, budgetMaxK]);

  const stepErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    const phoneErr = validatePhone(phone);
    if (phoneErr) errs.phone = phoneErr;
    if (!area) errs.area = "Area is required";
    return errs;
  }, [name, phone, area]);

  const step2Errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!bhk) errs.bhk = "BHK is required";
    if (!moveIn) errs.moveIn = "Move-in is required";
    if (!profile) errs.profile = "Profile is required";
    if (!furnishing) errs.furnishing = "Furnishing is required";
    return errs;
  }, [bhk, moveIn, profile, furnishing]);

  function nextStep() {
    setErrorMsg(null);
    if (step === 1) {
      if (Object.keys(stepErrors).length) {
        track("lead_form_step_blocked", { step: 1, fields: Object.keys(stepErrors) });
        scrollToTopOfForm();
        return;
      }
      track("lead_form_step_next", { step: 1 });
      setStep(2);
      return;
    }
    if (step === 2) {
      if (Object.keys(step2Errors).length) {
        track("lead_form_step_blocked", { step: 2, fields: Object.keys(step2Errors) });
        return;
      }
      track("lead_form_step_next", { step: 2 });
      setStep(3);
      return;
    }
  }

  function prevStep() {
    setErrorMsg(null);
    setStep((s) => (s === 3 ? 2 : 1));
  }

  async function submit() {
    setErrorMsg(null);
    setSuccessLeadId(null);

    if (!apiUrl) {
      setErrorMsg("Missing API URL. Set VITE_LEAD_API_URL in .env and restart the dev server.");
      return;
    }

    // final validation
    if (Object.keys(stepErrors).length || Object.keys(step2Errors).length) {
      setErrorMsg("Please fix the highlighted fields before submitting.");
      return;
    }

    const abVariant = getAbVariant();

    const payload: LeadPayload = {
      name: name.trim(),
      phone: onlyDigits(phone),
      area,
      locality: locality.trim() ? locality.trim() : undefined,
      budgetRange,
      bhk,
      furnishing,
      moveIn,
      profile,
      notes: notes.trim() ? notes.trim() : undefined,
      source: "landing",
      abVariant,
      createdAtIso: new Date().toISOString(),
      landingUrl: window.location.href,
      device: window.innerWidth < 640 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
      utm: getUtm(),
    };

    try {
      setSubmitting(true);
      track("lead_submit_attempt", { area, bhk, budgetRange, profile, moveIn });

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg = (data as ApiErr)?.message || (data as ApiErr)?.error || `Request failed (${res.status})`;
        setErrorMsg(msg);
        track("lead_submit_error", { status: res.status, msg });
        return;
      }

      const leadId = (data as ApiOk)?.leadId || (data as ApiOk)?.id || null;
      setSuccessLeadId(leadId || "Created");
      persistLastLead({
        leadId: (leadId || "Created") as string,
        name,
        phone,
        area,
        locality,
        bhk,
        budgetRange,
        furnishing,
        moveIn,
        profile,
        notes,
        createdAtIso: payload.createdAtIso,
      });
      track("lead_submit_success", { leadId: leadId ?? "unknown" });
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : "Network error. Please try again.";
      setErrorMsg(msg);
      track("lead_submit_error", { msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-14 sm:py-16">
      <Reveal>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Tell us what you need</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Share preferences once. We’ll send a curated shortlist on WhatsApp.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70">
            <span className={`h-1.5 w-1.5 rounded-full ${step >= 1 ? "bg-white" : "bg-white/20"}`} />
            <span className={`h-1.5 w-1.5 rounded-full ${step >= 2 ? "bg-white" : "bg-white/20"}`} />
            <span className={`h-1.5 w-1.5 rounded-full ${step >= 3 ? "bg-white" : "bg-white/20"}`} />
            <span className="ml-1">Step {step}/3</span>
          </div>
        </div>
      </Reveal>

      <Reveal delayMs={50}>
        <div className="mt-8 relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f14]/85 p-5 sm:p-7 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.85)] backdrop-blur">
          {/* progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-semibold text-white/65">
              <span className={step === 1 ? "text-white" : ""}>Contact</span>
              <span className={step === 2 ? "text-white" : ""}>Preferences</span>
              <span className={step === 3 ? "text-white" : ""}>Review</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-white transition-all"
                style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
              />
            </div>
          </div>

          {submitting && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 backdrop-blur-sm">
              <div className="relative w-[min(360px,92%)] rounded-3xl border border-white/10 bg-white/5 p-5 text-white shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="shimmer absolute -inset-[40%] rotate-12" />
                </div>
                <div className="relative flex items-center gap-3">
                  <Spinner />
                  <div>
                    <div className="text-sm font-semibold">Submitting…</div>
                    <div className="mt-1 text-xs text-white/70">We’re saving your request and generating a Lead ID.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* success */}
          {successLeadId && (
  <div className="mb-6 relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
    <div className="absolute inset-0 opacity-60">
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="shimmer absolute -inset-[60%] rotate-12" />
    </div>

    <div className="relative flex items-start gap-3">
      <AnimatedCheck />
      <div className="min-w-0 flex-1">
        <div className="font-semibold">Request submitted ✅</div>
        <div className="mt-1 text-emerald-100/90">
          Lead ID: <span className="font-semibold">{successLeadId}</span>
        </div>
        <div className="mt-2 text-xs text-emerald-100/75">
          We’ll WhatsApp you a shortlist soon. Keep your phone reachable.
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(String(successLeadId))}
        className="relative z-10 rounded-lg bg-emerald-500/25 px-3 py-1.5 text-xs font-semibold text-emerald-50 hover:bg-emerald-500/35 active:scale-[0.99]"
      >
        Copy
      </button>
    </div>
  </div>
)}

          {/* error */}
          {errorMsg && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {errorMsg}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="mb-2 text-xs font-semibold text-white/75">Name *</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ayush"
                  className={`w-full rounded-xl border bg-black/40 px-3 py-3 text-sm text-white outline-none ${
                    stepErrors.name ? "border-red-500/40" : "border-white/10 focus:border-white/20"
                  }`}
                />
                {stepErrors.name && <div className="mt-1 text-xs text-red-300">{stepErrors.name}</div>}
              </label>

              <label className="block">
                <div className="mb-2 text-xs font-semibold text-white/75">Phone (WhatsApp) *</div>
                <input
                  value={phone}
                  onChange={(e) => setPhone(onlyDigits(e.target.value))}
                  placeholder="10-digit number"
                  inputMode="numeric"
                  className={`w-full rounded-xl border bg-black/40 px-3 py-3 text-sm text-white outline-none ${
                    stepErrors.phone ? "border-red-500/40" : "border-white/10 focus:border-white/20"
                  }`}
                />
                {stepErrors.phone && <div className="mt-1 text-xs text-red-300">{stepErrors.phone}</div>}
              </label>

              <label className="block sm:col-span-2">
                <div className="mb-2 text-xs font-semibold text-white/75">Area *</div>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as Area)}
                  className={`w-full rounded-xl border bg-black/40 px-3 py-3 text-sm text-white outline-none ${
                    stepErrors.area ? "border-red-500/40" : "border-white/10 focus:border-white/20"
                  }`}
                >
                  <option>Malad West</option>
                  <option>Malad East</option>
                  <option>Kandivali West</option>
                  <option>Kandivali East</option>
                  <option>Borivali West</option>
                  <option>Borivali East</option>
                </select>
              </label>

              <div className="sm:col-span-2">
                <LocalityTypeahead
                  value={locality}
                  suggestions={localitySuggestions}
                  onChange={setLocality}
                  onSelect={(sel) => track("locality_select", { area, locality: sel, source: "lead_form" })}
                />
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-white/75">Budget</div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {fmtINR(budgetMinK)} – {fmtINR(budgetMaxK)}{" "}
                      <span className="ml-2 text-xs text-white/60">({budgetRange})</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { a: 30, b: 45, label: "30–45k" },
                      { a: 40, b: 60, label: "40–60k" },
                      { a: 60, b: 90, label: "60–90k" },
                      { a: 90, b: 120, label: "90–120k" },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setBudgetMinK(p.a);
                          setBudgetMaxK(p.b);
                        }}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/10"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <input
                    type="range"
                    min={20}
                    max={150}
                    step={5}
                    value={budgetMinK}
                    onChange={(e) => {
                      const v = clamp(Number(e.target.value), 20, 150);
                      setBudgetMinK(v > budgetMaxK ? budgetMaxK : v);
                    }}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={20}
                    max={150}
                    step={5}
                    value={budgetMaxK}
                    onChange={(e) => {
                      const v = clamp(Number(e.target.value), 20, 150);
                      setBudgetMaxK(v < budgetMinK ? budgetMinK : v);
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black active:scale-[0.99]"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs font-semibold text-white/75">BHK *</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(["1", "2"] as Bhk[]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setBhk(v)}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          bhk === v ? "bg-white text-black" : "bg-white/5 text-white/85 hover:bg-white/10"
                        }`}
                      >
                        {v} BHK
                      </button>
                    ))}
                  </div>
                  {step2Errors.bhk && <div className="mt-2 text-xs text-red-300">{step2Errors.bhk}</div>}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs font-semibold text-white/75">Furnishing *</div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {([
                      { k: "F", label: "Furnished" },
                      { k: "S", label: "Semi" },
                      { k: "U", label: "Unfurnished" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.k}
                        type="button"
                        onClick={() => setFurnishing(opt.k)}
                        className={`rounded-xl px-3 py-3 text-xs font-semibold transition ${
                          furnishing === opt.k ? "bg-white text-black" : "bg-white/5 text-white/85 hover:bg-white/10"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {step2Errors.furnishing && <div className="mt-2 text-xs text-red-300">{step2Errors.furnishing}</div>}
                </div>

                <label className="block rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs font-semibold text-white/75">Move-in *</div>
                  <select
                    value={moveIn}
                    onChange={(e) => setMoveIn(e.target.value as MoveIn)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-white/20"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="7">7 days</option>
                    <option value="15">15 days</option>
                    <option value="30+">30+ days</option>
                  </select>
                  {step2Errors.moveIn && <div className="mt-2 text-xs text-red-300">{step2Errors.moveIn}</div>}
                </label>

                <label className="block rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs font-semibold text-white/75">Profile *</div>
                  <select
                    value={profile}
                    onChange={(e) => setProfile(e.target.value as Profile)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-white/20"
                  >
                    <option value="Family">Family</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Company">Company</option>
                  </select>
                  {step2Errors.profile && <div className="mt-2 text-xs text-red-300">{step2Errors.profile}</div>}
                </label>
              </div>

              <label className="block">
                <div className="mb-2 text-xs font-semibold text-white/75">Notes (optional)</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Pets, parking, floor preference, society name..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-white/20"
                />
              </label>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={prevStep}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black active:scale-[0.99]"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Review */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">Review your details</div>
                    <div className="mt-1 text-xs text-white/65">We’ll use this to shortlist the best matches.</div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/70">
                    {area}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="text-xs text-white/60">Name</div>
                    <div className="mt-1 font-semibold text-white">{name}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="text-xs text-white/60">WhatsApp</div>
                    <div className="mt-1 font-semibold text-white">{onlyDigits(phone)}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="text-xs text-white/60">Budget</div>
                    <div className="mt-1 font-semibold text-white">
                      {fmtINR(budgetMinK)} – {fmtINR(budgetMaxK)} ({budgetRange})
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="text-xs text-white/60">BHK • Furnishing</div>
                    <div className="mt-1 font-semibold text-white">
                      {bhk} BHK • {furnishing === "F" ? "Furnished" : furnishing === "S" ? "Semi" : "Unfurnished"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="text-xs text-white/60">Move-in • Profile</div>
                    <div className="mt-1 font-semibold text-white">
                      {moveIn} • {profile}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="text-xs text-white/60">Notes</div>
                    <div className="mt-1 font-semibold text-white">{notes.trim() ? notes : "—"}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={submit}
                  className="flex-1 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_-28px_rgba(37,211,102,0.9)] disabled:opacity-60 active:scale-[0.99]"
                >
                  {submitting ? "Submitting..." : "Submit & get shortlist"}
                </button>
              </div>

              <div className="text-[11px] text-white/55">
                By submitting, you agree to be contacted on WhatsApp/phone for rental options.
              </div>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
