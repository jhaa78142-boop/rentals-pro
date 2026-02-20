export type QuickAction =
  | { type: "scroll"; label: string; targetId: string }
  | { type: "whatsapp"; label: string; text: string }
  | { type: "tel"; label: string }
  | { type: "link"; label: string; href: string }
  | { type: "apply_draft"; label: string; draft: Record<string, unknown>; scrollToId?: string };

export type BotReply = {
  text: string;
  quickActions?: QuickAction[];
};

export const BUSINESS = {
  brand: "MumbaiRentals",
  businessWhatsApp: "917498369191", // 91 + 10 digits
  phoneDisplay: "+91 74983 69191",
  instagram: "https://instagram.com/ayushjha.creates",
  areas: [
    "Malad West",
    "Malad East",
    "Kandivali West",
    "Kandivali East",
    "Borivali West",
    "Borivali East",
  ],
};

export const FAQ_KB = {
  brokerage:
    "We keep charges transparent. Brokerage (if any) depends on the final deal and will be confirmed before you visit. No surprise fees.",
  visits:
    "Yes — we can schedule same-day visits depending on availability. Usually you’ll get a shortlist first, then we book visits at your convenience.",
  documents:
    "Commonly required: Govt ID, employment proof (salary slips / offer letter), and basic KYC for all occupants. Final docs depend on owner/society rules.",
  bachelors:
    "Bachelors are considered case-by-case depending on the building and owner preference. Share your profile and area; we’ll filter accordingly.",
  deposit:
    "Deposit typically ranges from 2–4 months rent, but it varies by building and owner. We’ll mention it upfront in the shortlist.",
  pets:
    "Some societies are pet-friendly, some are not. Mention pets in notes so we only share suitable options.",
  timeline:
    "If you’re moving in Immediate / 7 / 15 days, you’ll be marked as a Hot lead and we prioritize faster shortlists and visits.",
};
