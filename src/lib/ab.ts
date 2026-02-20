export type AbVariant = "A" | "B";

const KEY = "hero_variant_v1";

export function getAbVariant(): AbVariant {
  if (typeof window === "undefined") return "A";
  const existing = window.localStorage.getItem(KEY) as AbVariant | null;
  if (existing === "A" || existing === "B") return existing;
  const v: AbVariant = Math.random() < 0.5 ? "A" : "B";
  window.localStorage.setItem(KEY, v);
  return v;
}

export function setAbVariant(v: AbVariant) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, v);
}
