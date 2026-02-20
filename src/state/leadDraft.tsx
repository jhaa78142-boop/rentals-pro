import React, { createContext, useContext, useMemo, useState } from "react";

export type Area =
  | "Malad West"
  | "Malad East"
  | "Kandivali West"
  | "Kandivali East"
  | "Borivali West"
  | "Borivali East";

export type Bhk = "1" | "2" | "3" | "4+";
export type Furnishing = "F" | "S" | "U";
export type MoveIn = "Immediate" | "7" | "15" | "30+";
export type Profile = "Family" | "Bachelor" | "Company";

export type LeadDraft = {
  // Step 1
  name?: string;
  phone?: string;
  area?: Area;
  budgetMinK?: number;
  budgetMaxK?: number;

  // Step 2
  bhk?: Bhk;
  furnishing?: Furnishing;
  moveIn?: MoveIn;
  profile?: Profile;

  // Optional
  locality?: string;
  notes?: string;

  /** internal: used to signal URL/chat prefill updates */
  _prefillTs?: number;
};

type Ctx = {
  draft: LeadDraft;
  setDraft: (patch: Partial<LeadDraft>) => void;
  clearDraft: () => void;
};

const LeadDraftContext = createContext<Ctx | null>(null);

const DEFAULT_DRAFT: LeadDraft = {
  area: "Malad West",
  budgetMinK: 40,
  budgetMaxK: 60,
  bhk: "1",
  furnishing: "S",
  moveIn: "Immediate",
  profile: "Family",
  locality: "",
  notes: "",
};

export function LeadDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraftState] = useState<LeadDraft>(DEFAULT_DRAFT);

  const value = useMemo<Ctx>(() => {
    return {
      draft,
      setDraft: (patch) => setDraftState((d) => ({ ...d, ...patch })),
      clearDraft: () => setDraftState(DEFAULT_DRAFT),
    };
  }, [draft]);

  return <LeadDraftContext.Provider value={value}>{children}</LeadDraftContext.Provider>;
}

export function useLeadDraft() {
  const ctx = useContext(LeadDraftContext);
  if (!ctx) throw new Error("useLeadDraft must be used within LeadDraftProvider");
  return ctx;
}
