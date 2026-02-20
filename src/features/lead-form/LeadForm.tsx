import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Flame,
  Thermometer,
  Snowflake,
  Copy,
  MessageCircle,
  Phone,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { onlyDigits } from "../../lib/utils";
import { submitLead } from "../../lib/apiClient";
import { logEvent } from "../../lib/analytics";
import { track } from "../../lib/track";
import { getAbVariant } from "../../lib/ab";
import { useLeadDraft } from "../../state/leadDraft";
import { persistLastLead } from "../lead-resume/LeadResume";
import LocalityTypeahead from "../../components/LocalityTypeahead";
import { getLocalitiesForArea } from "../../lib/localities";
import {
  leadSchema,
  LeadFormValues,
  AREAS,
  BHK_OPTIONS,
  FURNISHING_OPTIONS,
  MOVE_IN_OPTIONS,
  PROFILE_OPTIONS,
  FURNISHING_LABELS,
  MOVE_IN_LABELS,
  getLeadScore,
  toBudgetRange,
  fmtINR,
  type Area,
  type Bhk,
  type MoveIn,
} from "./schema";

// ─── Rate limiting ────────────────────────────────────────────────────────────
const COOLDOWN_MS = 60_000;
let lastSubmitTs = 0;

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti() {
  const colors = ["#25D366", "#34D399", "#10B981", "#6EE7B7", "#FBBF24", "#60A5FA"];
  const particles = Array.from({ length: 28 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
      {particles.map((_, i) => {
        const left = `${5 + ((i * 37) % 90)}%`;
        const delay = `${(i * 0.07).toFixed(2)}s`;
        const color = colors[i % colors.length];
        const size = 5 + (i % 4) * 2;
        return (
          <span
            key={i}
            className="absolute top-0 animate-confetti"
            style={{
              left,
              width: size,
              height: size,
              background: color,
              borderRadius: i % 3 === 0 ? "50%" : "2px",
              animationDelay: delay,
              opacity: 0,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Lead score badge ─────────────────────────────────────────────────────────
function LeadScoreBadge({ moveIn }: { moveIn: MoveIn }) {
  const score = getLeadScore(moveIn);
  if (score === "hot")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-300">
        <Flame className="h-3.5 w-3.5" /> Hot Lead
      </span>
    );
  if (score === "warm")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/15 px-3 py-1 text-xs font-bold text-yellow-300">
        <Thermometer className="h-3.5 w-3.5" /> Warm Lead
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/15 px-3 py-1 text-xs font-bold text-sky-300">
      <Snowflake className="h-3.5 w-3.5" /> Planning Ahead
    </span>
  );
}

// ─── Helper text ──────────────────────────────────────────────────────────────
function Helper({ text }: { text: string }) {
  return (
    <div className="mt-1.5 flex items-start gap-1 text-[11px] text-white/50">
      <Info className="mt-0.5 h-3 w-3 shrink-0" />
      {text}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1 flex items-center gap-1 text-xs text-red-400"
    >
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </motion.div>
  );
}

// ─── Pill selector ────────────────────────────────────────────────────────────
function PillGroup<T extends string>({
  options,
  value,
  onChange,
  labelMap,
  cols = 2,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labelMap?: Partial<Record<T, string>>;
  cols?: number;
}) {
  return (
    <div className={cn("mt-2 grid gap-2", `grid-cols-${cols}`)}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
            value === opt
              ? "bg-white text-slate-900 shadow-md"
              : "bg-white/5 text-white/75 hover:bg-white/10 border border-white/10"
          )}
        >
          {labelMap?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { label: "Requirement", num: 1 },
  { label: "Timeline", num: 2 },
  { label: "Contact", num: 3 },
];

function StepBar({ step }: { step: number }) {
  return (
    <div className="mb-7">
      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                  step > s.num
                    ? "bg-emerald-500 text-white"
                    : step === s.num
                    ? "bg-white text-slate-900 ring-2 ring-white/30"
                    : "bg-white/10 text-white/40"
                )}
              >
                {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
              </div>
              <div
                className={cn(
                  "mt-1 text-[10px] font-semibold",
                  step === s.num ? "text-white" : "text-white/40"
                )}
              >
                {s.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-1 mb-4 flex-1">
                <div className="h-px bg-white/10">
                  <div
                    className="h-px bg-emerald-500 transition-all duration-500"
                    style={{ width: step > s.num + 1 ? "100%" : step === s.num + 1 ? "50%" : "0%" }}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Budget Slider ─────────────────────────────────────────────────────────────
function BudgetSlider({
  minK,
  maxK,
  onMin,
  onMax,
}: {
  minK: number;
  maxK: number;
  onMin: (v: number) => void;
  onMax: (v: number) => void;
}) {
  const PRESETS = [
    { a: 30, b: 45, label: "30–45k" },
    { a: 40, b: 60, label: "40–60k" },
    { a: 60, b: 90, label: "60–90k" },
    { a: 90, b: 130, label: "90–130k" },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-white/75">Budget Range</div>
          <div className="mt-1 text-base font-bold text-white">
            {fmtINR(minK)} – {fmtINR(maxK)}
            <span className="ml-2 text-xs font-normal text-white/50">({toBudgetRange(minK, maxK)})</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                onMin(p.a);
                onMax(p.b);
              }}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                minK === p.a && maxK === p.b
                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 text-[10px] text-white/50">Min</div>
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={minK}
            onChange={(e) => {
              const v = Number(e.target.value);
              onMin(v > maxK ? maxK : v);
            }}
            className="w-full accent-emerald-500"
          />
        </div>
        <div>
          <div className="mb-1 text-[10px] text-white/50">Max</div>
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={maxK}
            onChange={(e) => {
              const v = Number(e.target.value);
              onMax(v < minK ? minK : v);
            }}
            className="w-full accent-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main form ─────────────────────────────────────────────────────────────────
export default function LeadForm({
  onPhoneChange,
}: {
  onPhoneChange?: (phone10: string) => void;
}) {
  const { draft, setDraft } = useLeadDraft();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [didCopy, setDidCopy] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      area: (draft.area as Area) ?? "Malad West",
      budgetMinK: typeof draft.budgetMinK === "number" ? draft.budgetMinK : 40,
      budgetMaxK: typeof draft.budgetMaxK === "number" ? draft.budgetMaxK : 60,
      bhk: (draft.bhk as Bhk) ?? "2",
      furnishing: (draft.furnishing as "F" | "S" | "U") ?? "S",
      moveIn: (draft.moveIn as MoveIn) ?? "Immediate",
      profile: (draft.profile as "Family" | "Bachelor" | "Company") ?? "Family",
      name: draft.name ?? "",
      phone: draft.phone ?? "",
      notes: draft.notes ?? "",
      locality: draft.locality ?? "",
      _hp: "",
    },
  });

  const values = watch();

  // Sync phone to parent
  useEffect(() => {
    const p = onlyDigits(values.phone ?? "");
    onPhoneChange?.(p.length === 10 ? p : "");
  }, [values.phone, onPhoneChange]);

  // Sync draft
  useEffect(() => {
    setDraft({
      name: values.name,
      phone: onlyDigits(values.phone ?? ""),
      area: values.area,
      locality: values.locality,
      budgetMinK: values.budgetMinK,
      budgetMaxK: values.budgetMaxK,
      bhk: values.bhk,
      furnishing: values.furnishing,
      moveIn: values.moveIn,
      profile: values.profile,
      notes: values.notes,
    });
  }, [values, setDraft]);

  // If area changes, clear locality if not valid
  const localitySuggestions = useMemo(
    () => getLocalitiesForArea(values.area),
    [values.area]
  );
  useEffect(() => {
    if (!values.locality) return;
    const exists = localitySuggestions.some(
      (s) => s.toLowerCase() === (values.locality ?? "").trim().toLowerCase()
    );
    if (!exists) setValue("locality", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.area]);

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  async function goNext() {
    setGlobalError(null);
    let valid = false;
    if (step === 1) {
      valid = await trigger(["area", "budgetMinK", "budgetMaxK", "bhk", "furnishing"]);
      if (valid) {
        logEvent("completed_step", { step: 1 });
        setStep(2);
        scrollToTop();
      }
    } else if (step === 2) {
      valid = await trigger(["moveIn", "profile"]);
      if (valid) {
        logEvent("completed_step", { step: 2 });
        setStep(3);
        scrollToTop();
      }
    }
    logEvent("view_form_step", { step: step + 1 });
  }

  function goBack() {
    setGlobalError(null);
    setStep((s) => (s === 3 ? 2 : 1) as 1 | 2 | 3);
    scrollToTop();
  }

  const onSubmit = async (data: LeadFormValues) => {
    setGlobalError(null);

    // Rate limiting
    const now = Date.now();
    if (now - lastSubmitTs < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (now - lastSubmitTs)) / 1000);
      setGlobalError(`Please wait ${wait}s before submitting again.`);
      return;
    }

    // honeypot check
    if (data._hp && data._hp.trim() !== "") return;

    setSubmitting(true);
    lastSubmitTs = Date.now();

    try {
      track("lead_submit_attempt", {
        area: data.area,
        bhk: data.bhk,
        budgetRange: toBudgetRange(data.budgetMinK, data.budgetMaxK),
        profile: data.profile,
        moveIn: data.moveIn,
      });

      const result = await submitLead({
        name: data.name.trim(),
        phone: onlyDigits(data.phone),
        area: data.area,
        locality: data.locality?.trim() || undefined,
        budgetRange: toBudgetRange(data.budgetMinK, data.budgetMaxK),
        bhk: data.bhk,
        furnishing: data.furnishing,
        moveIn: data.moveIn,
        profile: data.profile,
        notes: data.notes?.trim() || undefined,
        source: "Website",
        abVariant: getAbVariant(),
        createdAtIso: new Date().toISOString(),
        landingUrl: window.location.href,
        device:
          window.innerWidth < 640
            ? "mobile"
            : window.innerWidth < 1024
            ? "tablet"
            : "desktop",
        _hp: data._hp,
      });

      if (!result.ok) {
        setGlobalError(result.error);
        toast.error("Submission failed", { description: result.error });
        track("lead_submit_error", { msg: result.error });
        return;
      }

      setLeadId(result.leadId);
      setSubmitted(true);
      logEvent("submit_success", { leadId: result.leadId });
      track("lead_submit_success", { leadId: result.leadId });

      persistLastLead({
        leadId: result.leadId,
        name: data.name,
        phone: data.phone,
        area: data.area,
        locality: data.locality ?? "",
        bhk: data.bhk,
        budgetRange: toBudgetRange(data.budgetMinK, data.budgetMaxK),
        furnishing: data.furnishing,
        moveIn: data.moveIn,
        profile: data.profile,
        notes: data.notes ?? "",
        createdAtIso: new Date().toISOString(),
      });

      toast.success("Request submitted!", {
        description: `Lead ID: ${result.leadId}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const budgetRange = toBudgetRange(values.budgetMinK, values.budgetMaxK);

  const whatsappMsg = encodeURIComponent(
    `Hi, I'm ${values.name || "looking for a home"}. Need ${values.bhk} BHK in ${values.area}, budget ${budgetRange}, move-in ${MOVE_IN_LABELS[values.moveIn as MoveIn] ?? values.moveIn}, ${values.profile}.`
  );
  const waHref = `https://wa.me/917498369191?text=${whatsappMsg}`;

  // ── Success Panel ────────────────────────────────────────────────────────────
  if (submitted && leadId) {
    return (
      <section id="lead" className="relative mx-auto max-w-2xl px-4 py-14">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.9)]">
          <Confetti />

          {/* Top green bar */}
          <div className="flex items-center gap-3 border-b border-emerald-500/20 bg-emerald-500/10 px-6 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-emerald-300">Submitted successfully</div>
              <div className="text-xs text-emerald-400/70">We received your request</div>
            </div>
          </div>

          <div className="relative z-10 px-6 py-7">
            {/* ── LEAD ID — THE MOST IMPORTANT THING ── */}
            <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 px-5 py-5 text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
                Your Lead ID — save this
              </div>
              <div className="text-4xl font-black tracking-widest text-white">
                {leadId}
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(leadId);
                    setDidCopy(true);
                    setTimeout(() => setDidCopy(false), 2500);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition",
                    didCopy
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/10 text-white/70 hover:bg-white/15 border border-white/10"
                  )}
                >
                  {didCopy ? <><CheckCircle2 className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </button>
              </div>
              <p className="mt-3 text-xs text-white/40">
                Quote this ID when you WhatsApp or call us — we'll find your details instantly.
              </p>
            </div>

            {/* What happens next */}
            <div className="mt-5 space-y-2">
              {[
                { step: "1", text: "We review your preferences right now", time: "0 min" },
                { step: "2", text: "You receive a WhatsApp shortlist", time: "10–15 min" },
                { step: "3", text: "Visit scheduled on a day that suits you", time: "Same/next day" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-black text-emerald-400">
                    {s.step}
                  </span>
                  <span className="flex-1 text-sm text-white/75">{s.text}</span>
                  <span className="text-xs font-semibold text-white/35">{s.time}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => { logEvent("whatsapp_click", { source: "success_panel" }); track("whatsapp_click", { source: "success_panel" }); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.55)] transition"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp us now
              </a>
              <a
                href="tel:+917498369191"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                <Phone className="h-4 w-4" />
                Call us
              </a>
            </div>

            <p className="mt-4 text-center text-xs text-white/30">
              No spam. Verified options only. Lead ID: <span className="font-mono font-bold text-white/50">{leadId}</span>
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ── Multi-step Form ──────────────────────────────────────────────────────────
  return (
    <section id="lead" className="relative mx-auto max-w-6xl px-4 py-14 sm:py-16">
      <div ref={topRef} className="scroll-mt-28" />

      <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Tell us what you need</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/65">
              Share preferences once — we'll WhatsApp you a curated shortlist. Response in 10–15 min.
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
              ⚡ 10–15 min response
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.08 }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-8 relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f14]/90 p-5 sm:p-7 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)] backdrop-blur"
        >
          {/* Honeypot (hidden, anti-spam) */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-full opacity-0 pointer-events-none"
            {...register("_hp")}
          />

          <StepBar step={step} />

          {/* Global error */}
          <AnimatePresence>
            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  {globalError}
                  <button
                    type="button"
                    onClick={() => setGlobalError(null)}
                    className="ml-2 underline opacity-70 hover:opacity-100"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Requirement ──────────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Area */}
                  <div className="sm:col-span-2">
                    <label className="block">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-white/75">Preferred Area *</span>
                      </div>
                      <select
                        {...register("area")}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10"
                      >
                        {AREAS.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                      <FieldError msg={errors.area?.message} />
                    </label>
                  </div>

                  {/* Locality */}
                  <div className="sm:col-span-2">
                    <LocalityTypeahead
                      value={values.locality ?? ""}
                      suggestions={localitySuggestions}
                      onChange={(v) => setValue("locality", v)}
                      onSelect={(sel) => track("locality_select", { area: values.area, locality: sel })}
                    />
                    <Helper text="Optional — helps us shortlist more precisely." />
                  </div>

                  {/* Budget */}
                  <div className="sm:col-span-2">
                    <BudgetSlider
                      minK={values.budgetMinK}
                      maxK={values.budgetMaxK}
                      onMin={(v) => setValue("budgetMinK", v)}
                      onMax={(v) => setValue("budgetMaxK", v)}
                    />
                    <Helper text="Default ₹40–60k matches most 1–2 BHK options in this area." />
                  </div>

                  {/* BHK */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-xs font-semibold text-white/75">BHK *</div>
                    <PillGroup
                      options={BHK_OPTIONS}
                      value={values.bhk}
                      onChange={(v) => setValue("bhk", v)}
                    />
                    <FieldError msg={errors.bhk?.message} />
                  </div>

                  {/* Furnishing */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-xs font-semibold text-white/75">Furnishing *</div>
                    <PillGroup
                      options={FURNISHING_OPTIONS}
                      value={values.furnishing}
                      onChange={(v) => setValue("furnishing", v)}
                      labelMap={{ F: "Furnished", S: "Semi", U: "Bare" }}
                      cols={3}
                    />
                    <FieldError msg={errors.furnishing?.message} />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={goNext}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-[0_10px_40px_rgba(255,255,255,0.15)] hover:shadow-[0_14px_50px_rgba(255,255,255,0.25)] transition active:scale-[0.99]"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Timeline + Profile ───────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Move-in */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-white/75">Move-in Timeline *</div>
                      <LeadScoreBadge moveIn={values.moveIn as MoveIn} />
                    </div>
                    <PillGroup
                      options={MOVE_IN_OPTIONS}
                      value={values.moveIn}
                      onChange={(v) => setValue("moveIn", v)}
                      labelMap={MOVE_IN_LABELS}
                      cols={2}
                    />
                    <Helper text="This helps us prioritise available options for you." />
                    <FieldError msg={errors.moveIn?.message} />
                  </div>

                  {/* Profile */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-xs font-semibold text-white/75 mb-2">Profile *</div>
                    <PillGroup
                      options={PROFILE_OPTIONS}
                      value={values.profile}
                      onChange={(v) => setValue("profile", v)}
                      cols={3}
                    />
                    <Helper text="Some societies restrict profile types — this helps us filter accurately." />
                    <FieldError msg={errors.profile?.message} />
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <div className="text-xs font-semibold text-white/75 mb-2">Notes (optional)</div>
                    <textarea
                      {...register("notes")}
                      placeholder="Pets, parking, floor preference, society name, proximity to station..."
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-white/25 placeholder:text-white/30 resize-none"
                    />
                    <Helper text="More context = better shortlist. No detail is too small." />
                    <FieldError msg={errors.notes?.message} />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-[0_10px_40px_rgba(255,255,255,0.15)] hover:shadow-[0_14px_50px_rgba(255,255,255,0.25)] transition active:scale-[0.99]"
                  >
                    Review & Contact <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Contact + Review ─────────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-5"
              >
                {/* Summary */}
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="text-sm font-semibold text-white">Your Requirement</div>
                    <LeadScoreBadge moveIn={values.moveIn as MoveIn} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { k: "Area", v: values.area },
                      { k: "Budget", v: `${fmtINR(values.budgetMinK)} – ${fmtINR(values.budgetMaxK)}` },
                      { k: "BHK", v: `${values.bhk} BHK` },
                      { k: "Furnishing", v: FURNISHING_LABELS[values.furnishing as "F"|"S"|"U"] },
                      { k: "Move-in", v: MOVE_IN_LABELS[values.moveIn as MoveIn] },
                      { k: "Profile", v: values.profile },
                    ].map(({ k, v }) => (
                      <div key={k} className="rounded-xl border border-white/10 bg-black/40 p-2.5">
                        <div className="text-white/50">{k}</div>
                        <div className="mt-0.5 font-semibold text-white truncate">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] text-white/50 underline hover:text-white/80"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Contact fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block">
                      <div className="mb-2 text-xs font-semibold text-white/75">Your Name *</div>
                      <input
                        {...register("name")}
                        placeholder="Ayush Sharma"
                        autoComplete="name"
                        className={cn(
                          "w-full rounded-xl border bg-black/40 px-3 py-3 text-sm text-white outline-none transition",
                          errors.name
                            ? "border-red-500/40 focus:border-red-500/60"
                            : "border-white/10 focus:border-white/25"
                        )}
                      />
                      <FieldError msg={errors.name?.message} />
                    </label>
                  </div>

                  <div>
                    <label className="block">
                      <div className="mb-2 text-xs font-semibold text-white/75">WhatsApp Number *</div>
                      <input
                        {...register("phone", {
                          onChange: (e) => {
                            e.target.value = onlyDigits(e.target.value).slice(0, 10);
                          },
                        })}
                        placeholder="10-digit number"
                        inputMode="numeric"
                        maxLength={10}
                        autoComplete="tel"
                        className={cn(
                          "w-full rounded-xl border bg-black/40 px-3 py-3 text-sm text-white outline-none transition",
                          errors.phone
                            ? "border-red-500/40 focus:border-red-500/60"
                            : "border-white/10 focus:border-white/25"
                        )}
                      />
                      <Helper text="We'll send your shortlist here. No spam, ever." />
                      <FieldError msg={errors.phone?.message} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_40px_rgba(37,211,102,0.4)] hover:shadow-[0_14px_50px_rgba(37,211,102,0.55)] transition disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        Submit & Get Shortlist
                      </>
                    )}
                  </motion.button>
                </div>

                <p className="text-[11px] text-white/40">
                  By submitting, you agree to be contacted on WhatsApp/phone about rental options. No spam.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </section>
  );
}
