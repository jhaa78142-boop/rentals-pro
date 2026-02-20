import { z } from "zod";

export const AREAS = [
  "Malad West",
  "Malad East",
  "Kandivali West",
  "Kandivali East",
  "Borivali West",
  "Borivali East",
] as const;

export const BHK_OPTIONS = ["1", "2", "3", "4+"] as const;
export const FURNISHING_OPTIONS = ["F", "S", "U"] as const;
export const MOVE_IN_OPTIONS = ["Immediate", "7", "15", "30+"] as const;
export const PROFILE_OPTIONS = ["Family", "Bachelor", "Company"] as const;

export type Area = (typeof AREAS)[number];
export type Bhk = (typeof BHK_OPTIONS)[number];
export type Furnishing = (typeof FURNISHING_OPTIONS)[number];
export type MoveIn = (typeof MOVE_IN_OPTIONS)[number];
export type Profile = (typeof PROFILE_OPTIONS)[number];

export const leadSchema = z.object({
  // Step 1 — Requirement
  area: z.enum(AREAS, { required_error: "Area is required" }),
  budgetMinK: z.number().min(10).max(300),
  budgetMaxK: z.number().min(10).max(300),
  bhk: z.enum(BHK_OPTIONS, { required_error: "BHK is required" }),
  furnishing: z.enum(FURNISHING_OPTIONS, { required_error: "Furnishing is required" }),
  locality: z.string().optional(),

  // Step 2 — Timeline + Profile
  moveIn: z.enum(MOVE_IN_OPTIONS, { required_error: "Move-in timeline is required" }),
  profile: z.enum(PROFILE_OPTIONS, { required_error: "Profile is required" }),
  notes: z.string().max(500, "Notes too long").optional(),

  // Step 3 — Contact
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name too long"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),

  // Honeypot (must be empty)
  _hp: z.string().max(0, "").optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

export const FURNISHING_LABELS: Record<Furnishing, string> = {
  F: "Furnished",
  S: "Semi-furnished",
  U: "Unfurnished",
};

export const MOVE_IN_LABELS: Record<MoveIn, string> = {
  Immediate: "Immediately",
  "7": "Within 7 days",
  "15": "Within 15 days",
  "30+": "30+ days",
};

/** Lead quality score based on move-in timeline */
export function getLeadScore(moveIn: MoveIn): "hot" | "warm" | "cold" {
  if (moveIn === "Immediate" || moveIn === "7") return "hot";
  if (moveIn === "15") return "warm";
  return "cold";
}

export function toBudgetRange(minK: number, maxK: number) {
  const a = Math.round(minK / 5) * 5;
  const b = Math.round(maxK / 5) * 5;
  return `${a}-${b}k`;
}

export function fmtINR(k: number) {
  return `₹${k}k`;
}
