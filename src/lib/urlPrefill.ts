import { Area, Bhk, Furnishing, LeadDraft, MoveIn, Profile } from "../state/leadDraft";

const AREAS: Area[] = [
  "Malad West","Malad East","Kandivali West","Kandivali East","Borivali West","Borivali East",
];

function norm(s: string) {
  return s.trim().toLowerCase().replace(/[_]+/g, " ").replace(/\s+/g, " ");
}

function parseArea(v?: string | null): Area | undefined {
  if (!v) return;
  const n = norm(v).replace(/-/g, " ");
  // match exact
  const exact = AREAS.find(a => norm(a) === n);
  if (exact) return exact;
  // allow "malad west" etc
  const parts = n.split(" ");
  if (parts.length >= 2) {
    const cand = (parts[0][0].toUpperCase() + parts[0].slice(1)) + " " + (parts[1][0].toUpperCase() + parts[1].slice(1));
    const match = AREAS.find(a => a.toLowerCase() === cand.toLowerCase());
    if (match) return match;
  }
  return;
}

function parseEnum<T extends string>(v: string | null | undefined, allowed: readonly T[]): T | undefined {
  if (!v) return;
  const n = v.trim();
  return (allowed as readonly string[]).includes(n) ? (n as T) : undefined;
}

function parseNum(v: string | null, min: number, max: number): number | undefined {
  if (!v) return;
  const n = Number(v);
  if (!Number.isFinite(n)) return;
  return Math.max(min, Math.min(max, n));
}

export type PrefillResult = {
  patch: Partial<LeadDraft>;
  autoOpen?: boolean;
  autoScroll?: boolean;
};

/**
 * Supported params:
 * area=Malad%20West | locality=Mindspace | bhk=1|2
 * min=40 (k) | max=60 (k)
 * furnishing=F|S|U | moveIn=Immediate|7|15|30+
 * profile=Family|Bachelor|Company
 * notes=...
 * openForm=1 , scroll=1
 */
export function parsePrefillFromUrl(url: string): PrefillResult {
  const u = new URL(url);
  const p = u.searchParams;

  const patch: Partial<LeadDraft> = {};
  const area = parseArea(p.get("area"));
  if (area) patch.area = area;

  const locality = p.get("locality");
  if (locality) patch.locality = locality;

  const bhk = parseEnum<Bhk>(p.get("bhk"), ["1", "2"] as const);
  if (bhk) patch.bhk = bhk;

  const furnishing = parseEnum<Furnishing>(p.get("furnishing"), ["F", "S", "U"] as const);
  if (furnishing) patch.furnishing = furnishing;

  const moveIn = parseEnum<MoveIn>(p.get("moveIn"), ["Immediate", "7", "15", "30+"] as const);
  if (moveIn) patch.moveIn = moveIn;

  const profile = parseEnum<Profile>(p.get("profile"), ["Family", "Bachelor", "Company"] as const);
  if (profile) patch.profile = profile;

  const min = parseNum(p.get("min"), 10, 300); // in 'k'
  const max = parseNum(p.get("max"), 10, 300);
  if (typeof min === "number") patch.budgetMinK = min;
  if (typeof max === "number") patch.budgetMaxK = max;

  const notes = p.get("notes");
  if (notes) patch.notes = notes;

  const autoOpen = p.get("openForm") === "1";
  const autoScroll = p.get("scroll") === "1" || autoOpen;

  return { patch, autoOpen, autoScroll };
}

export function buildShareLink(baseUrl: string, pathname: string, draft: LeadDraft): string {
  const u = new URL(baseUrl);
  u.pathname = pathname;

  const q = u.searchParams;

  // Keep link compact: only include meaningful values
  if (draft.area) q.set("area", draft.area);
  if (draft.locality && draft.locality.trim()) q.set("locality", draft.locality.trim());
  if (draft.bhk) q.set("bhk", draft.bhk);
  if (typeof draft.budgetMinK === "number") q.set("min", String(Math.round(draft.budgetMinK)));
  if (typeof draft.budgetMaxK === "number") q.set("max", String(Math.round(draft.budgetMaxK)));
  if (draft.furnishing) q.set("furnishing", draft.furnishing);
  if (draft.moveIn) q.set("moveIn", draft.moveIn);
  if (draft.profile) q.set("profile", draft.profile);

  // Optional: deep-open the form
  q.set("openForm", "1");

  return u.toString();
}
