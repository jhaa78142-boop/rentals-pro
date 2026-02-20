import React, { useEffect, useMemo, useState } from "react";
import { track } from "../lib/track";
import { useEscapeKey, useFocusTrap, useLockBodyScroll } from "../lib/hooks";
import { onlyDigits } from "../lib/utils";

type StoredLead = {
  leadId: string;
  name?: string;
  phone?: string; // 10 digits
  area?: string;
  locality?: string;
  bhk?: string;
  budgetRange?: string;
  moveIn?: string;
  profile?: string;
  furnishing?: string;
  notes?: string;
  createdAtIso?: string;
};

const KEY = "mr_last_lead_v1";

function loadLead(): StoredLead | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !obj.leadId) return null;
    return obj as StoredLead;
  } catch {
    return null;
  }
}

function saveLead(lead: StoredLead) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lead));
  } catch {
    // ignore
  }
}

export function persistLastLead(lead: StoredLead) {
  saveLead(lead);
}

function waLink(businessNumber: string, message: string) {
  const bn = onlyDigits(businessNumber);
  const msg = encodeURIComponent(message);
  return `https://wa.me/${bn}?text=${msg}`;
}

export default function LeadResume() {
  const [open, setOpen] = useState(false);
  const drawerRef = useFocusTrap<HTMLDivElement>(open);
  useLockBodyScroll(open);
  useEscapeKey(open, () => setOpen(false));
  const [lead, setLead] = useState<StoredLead | null>(null);

  useEffect(() => {
    const l = loadLead();
    setLead(l);
  }, []);

  const businessNumber = "917498369191";

  const message = useMemo(() => {
    if (!lead) return "";
    return `Hi Ayush, I submitted a rental request.\nLead ID: ${lead.leadId}\nArea: ${lead.area ?? ""}${lead.locality ? ` (${lead.locality})` : ""}\nBHK: ${lead.bhk ?? ""}\nBudget: ${lead.budgetRange ?? ""}\nMove-in: ${lead.moveIn ?? ""}\nProfile: ${lead.profile ?? ""}\nPhone: ${lead.phone ?? ""}`;
  }, [lead]);

  if (!lead) return null;

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          track("lead_resume_open", { leadId: lead.leadId });
        }}
        className="fixed bottom-[84px] left-4 z-40 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-zinc-900 shadow-lg ring-1 ring-black/10 backdrop-blur hover:bg-white"
        aria-label="Open lead tracker"
        aria-expanded={open}
        aria-controls="mr-lead-drawer"
      >
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
        Track your request
        <span className="rounded-full bg-zinc-900/5 px-2 py-0.5 text-xs font-medium text-zinc-700">
          {lead.leadId}
        </span>
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div ref={drawerRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Lead tracking drawer" id="mr-lead-drawer" className="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-2xl rounded-t-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Lead tracking
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
                  Request received ✅
                </h3>
                <p className="mt-1 text-sm text-zinc-600">
                  We’ll contact you on WhatsApp/call shortly. Keep your Lead ID handy.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-200"
              >
                Close
              </button>
            </div>

            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2">
                <Info label="Lead ID" value={lead.leadId} copy />
                <Info label="Name" value={lead.name} />
                <Info label="Phone" value={lead.phone ? `+91 ${lead.phone}` : ""} />
                <Info label="Area" value={lead.area} />
                <Info label="Locality" value={lead.locality} />
                <Info label="BHK" value={lead.bhk} />
                <Info label="Budget" value={lead.budgetRange} />
                <Info label="Move-in" value={lead.moveIn} />
                <Info label="Profile" value={lead.profile} />
              </div>

              <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-sm font-semibold text-zinc-900">Progress</p>
                <ol className="mt-3 space-y-3 text-sm">
                  <Step done title="Submitted" desc="We received your preferences." />
                  <Step done title="Review & shortlist" desc="We shortlist verified options." />
                  <Step title="Schedule visits" desc="We coordinate timings that work for you." />
                  <Step title="Finalize & move-in" desc="Paperwork + keys handover." />
                </ol>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(lead.leadId);
                    track("lead_resume_copy", { leadId: lead.leadId });
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
                >
                  Copy Lead ID
                </button>

                <a
                  href={waLink(businessNumber, message)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("lead_resume_whatsapp", { leadId: lead.leadId })}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  WhatsApp with Lead ID
                </a>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(KEY);
                    setLead(null);
                    setOpen(false);
                    track("lead_resume_clear", { leadId: lead.leadId });
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-200"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Info({ label, value, copy }: { label: string; value?: string; copy?: boolean }) {
  const v = (value || "").trim();
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-zinc-900">{v || "—"}</p>
      </div>
      {copy && v ? (
        <button
          type="button"
          className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
          onClick={() => navigator.clipboard?.writeText(v)}
        >
          Copy
        </button>
      ) : null}
    </div>
  );
}

function Step({ done, title, desc }: { done?: boolean; title: string; desc: string }) {
  return (
    <li className="flex gap-3">
      <span
        className={[
          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
          done ? "bg-emerald-600" : "bg-zinc-300",
        ].join(" ")}
      />
      <div>
        <p className="font-semibold text-zinc-900">{title}</p>
        <p className="text-zinc-600">{desc}</p>
      </div>
    </li>
  );
}
