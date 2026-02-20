import type { Area } from "../state/leadDraft";

export type LocalityGroup = "Malad" | "Kandivali" | "Borivali";

// Starter set (expand based on real leads). Keep it short for mobile UX.
export const LOCALITIES: Record<LocalityGroup, string[]> = {
  Malad: [
    "Mindspace",
    "Link Road",
    "SV Road",
    "Malad Station",
    "Malad Metro",
    "Marve Road",
    "Orlem",
    "Evershine Nagar",
    "Chincholi Bunder",
    "Inorbit / Infiniti",
    "Dindoshi",
    "Madh",
  ],
  Kandivali: [
    "Thakur Village",
    "Mahavir Nagar",
    "Lokhandwala (Kandivali)",
    "Charkop",
    "Poisar",
    "Kandivali Station",
    "Kandivali Metro",
    "Akurli Road",
    "Samta Nagar",
    "Shankar Lane",
    "Link Road",
    "SV Road",
  ],
  Borivali: [
    "IC Colony",
    "Eksar",
    "Shimpoli",
    "Gorai",
    "Borivali Station",
    "Borivali Metro",
    "Devipada",
    "National Park",
    "Chandavarkar Road",
    "LT Road",
    "Link Road",
    "SV Road",
  ],
};

export function groupFromArea(area: Area): LocalityGroup {
  if (area.startsWith("Malad")) return "Malad";
  if (area.startsWith("Kandivali")) return "Kandivali";
  return "Borivali";
}

export function getLocalitiesForArea(area: Area): string[] {
  return LOCALITIES[groupFromArea(area)];
}

/**
 * Extract a known locality from free text (chatbot, notes).
 * Returns canonical locality string or null.
 */
export function detectLocality(text: string, area?: Area): string | null {
  const t = (text || "").toLowerCase();
  if (!t) return null;

  const groups: LocalityGroup[] = area ? [groupFromArea(area)] : ["Malad", "Kandivali", "Borivali"];
  for (const g of groups) {
    for (const loc of LOCALITIES[g]) {
      if (t.includes(loc.toLowerCase())) return loc;
    }
  }
  return null;
}
