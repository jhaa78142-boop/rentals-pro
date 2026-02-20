import { BotReply, BUSINESS, FAQ_KB, QuickAction } from "./knowledge";
import { detectLocality } from "../lib/localities";

export type ChatContext = {
  phone10?: string;
};

function norm(s: string) {
  return (s || "").toLowerCase().trim();
}

function hasAny(hay: string, needles: string[]) {
  return needles.some((n) => hay.includes(n));
}


type ParsedPrefs = {
  patch: Record<string, unknown>;
  summaryParts: string[];
};

function parsePrefs(input: string): ParsedPrefs {
  const q = norm(input);
  const patch: Record<string, unknown> = {};
  const parts: string[] = [];

  // area: detect suburb + east/west
  const areaMatch = (() => {
    const suburb =
      q.includes("malad") ? "Malad" :
      q.includes("kandivali") ? "Kandivali" :
      q.includes("borivali") ? "Borivali" : null;
    if (!suburb) return null;
    const side =
      q.includes("west") || q.includes("w ") || q.endsWith(" w") ? "West" :
      q.includes("east") || q.includes("e ") || q.endsWith(" e") ? "East" : null;
    if (side) return `${suburb} ${side}`;
    // if user didn't specify, keep suburb but ask in response; do not set area
    return null;
  })();
  if (areaMatch) {
    patch.area = areaMatch;
    parts.push(`Area: ${areaMatch}`);
  } else {
    // if they mention a suburb without E/W, hint later
    if (q.includes("malad")) parts.push("Area: Malad (East/West?)");
    if (q.includes("kandivali")) parts.push("Area: Kandivali (East/West?)");
    if (q.includes("borivali")) parts.push("Area: Borivali (East/West?)");
  }

  // bhk
  const bhkMatch = q.match(/\b(1|2)\s*bhk\b/) || q.match(/\b(1|2)\s*b\b/) || q.match(/\b(1|2)\s*bed\b/);
  if (bhkMatch) {
    patch.bhk = bhkMatch[1];
    parts.push(`${bhkMatch[1]}BHK`);
  } else if (q.includes("1bhk")) { patch.bhk = "1"; parts.push("1BHK"); }
    else if (q.includes("2bhk")) { patch.bhk = "2"; parts.push("2BHK"); }

  // furnishing
  if (hasAny(q, ["furnished", "fully furnished", "full furnished"])) { patch.furnishing = "F"; parts.push("Furnished"); }
  else if (hasAny(q, ["semi", "semi-furnished", "semi furnished"])) { patch.furnishing = "S"; parts.push("Semi-furnished"); }
  else if (hasAny(q, ["unfurnished", "un-furnished"])) { patch.furnishing = "U"; parts.push("Unfurnished"); }

  // profile
  if (hasAny(q, ["family"])) { patch.profile = "Family"; parts.push("Profile: Family"); }
  else if (hasAny(q, ["bachelor", "single", "boys", "girls"])) { patch.profile = "Bachelor"; parts.push("Profile: Bachelor"); }
  else if (hasAny(q, ["company", "corporate"])) { patch.profile = "Company"; parts.push("Profile: Company"); }

  // move-in
  if (hasAny(q, ["immediate", "today", "asap"])) { patch.moveIn = "Immediate"; parts.push("Move-in: Immediate"); }
  else if (q.includes("7") && hasAny(q, ["day", "days", "within"])) { patch.moveIn = "7"; parts.push("Move-in: 7 days"); }
  else if (q.includes("15") && hasAny(q, ["day", "days", "within"])) { patch.moveIn = "15"; parts.push("Move-in: 15 days"); }
  else if (hasAny(q, ["30", "month", "1 month", "one month", "30+"])) { patch.moveIn = "30+"; parts.push("Move-in: 30+"); }

  // budget parsing: supports 40-60k, 40000-60000, 60k, 1l/1 lakh
  const num = (s: string) => {
    const v = parseFloat(s);
    return Number.isFinite(v) ? v : NaN;
  };

  const toK = (raw: string) => {
    const r = raw.toLowerCase().replace(/[,₹\s]/g, "");
    if (r.endsWith("l") || r.includes("lakh")) {
      const n = num(r.replace(/lakh|l/g, ""));
      return Math.round(n * 100);
    }
    if (r.endsWith("k")) {
      const n = num(r.replace("k", ""));
      return Math.round(n);
    }
    const n = num(r);
    if (!Number.isFinite(n)) return NaN;
    // if looks like rupees (>=1000), convert to k
    if (n >= 1000) return Math.round(n / 1000);
    return Math.round(n);
  };

  const rangeMatch =
    q.match(/(₹?\s*\d+(?:\.\d+)?\s*(?:k|l|lakh)?)\s*(?:-|to)\s*(₹?\s*\d+(?:\.\d+)?\s*(?:k|l|lakh)?)/);
  if (rangeMatch) {
    const a = toK(rangeMatch[1]);
    const b = toK(rangeMatch[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      patch.budgetMinK = Math.min(a, b);
      patch.budgetMaxK = Math.max(a, b);
      parts.push(`Budget: ₹${Math.min(a,b)}k–₹${Math.max(a,b)}k`);
    }
  } else {
    const singleMatch = q.match(/₹?\s*(\d+(?:\.\d+)?)\s*(k|l|lakh)\b/);
    if (singleMatch) {
      const k = toK(singleMatch[1] + singleMatch[2]);
      if (Number.isFinite(k)) {
        // +-10k window
        patch.budgetMinK = Math.max(20, k - 10);
        patch.budgetMaxK = k + 10;
        parts.push(`Budget: ~₹${k}k`);
      }
    }
  }

  // notes: if user explicitly says "note:" or "notes:"
  const noteMatch = input.match(/\bnotes?\s*:\s*(.+)$/i);
  if (noteMatch && noteMatch[1]) {
    patch.notes = noteMatch[1].trim().slice(0, 200);
    parts.push("Added note");
  }

  // locality (optional): match known landmark/locality strings
  const detected = detectLocality(input, (patch.area as any) || undefined);
  if (detected) {
    patch.locality = detected;
    parts.push(`Locality: ${detected}`);
  }

  return { patch, summaryParts: parts };
}

function isMeaningfulPatch(patch: Record<string, unknown>) {
  return Object.keys(patch).length > 0;
}

function baseQuickActions(ctx: ChatContext): QuickAction[] {
  const waText = `Hi! I’m looking for a rental home in Mumbai (Malad/Kandivali/Borivali).`;
  return [
    { type: "scroll", label: "Fill Lead Form", targetId: "lead" },
    { type: "scroll", label: "See FAQ", targetId: "faq" },
    { type: "whatsapp", label: "WhatsApp", text: waText },
  ];
}

export function initialBotMessage(ctx: ChatContext): BotReply {
  return {
    text:
      `Hi! I’m the ${BUSINESS.brand} assistant.\n` +
      `I can help with rentals in Malad, Kandivali & Borivali — shortlists, visits, documents and timelines.\n\n` +
      `What are you looking for: 1BHK or 2BHK?`,
    quickActions: [
      { type: "scroll", label: "Find a Home", targetId: "lead" },
      { type: "scroll", label: "How it works", targetId: "how" },
      { type: "whatsapp", label: "WhatsApp us", text: "Hi! I want to find a rental home. Please share options." },
    ],
  };
}

export function replyToUser(input: string, ctx: ChatContext): BotReply {
  const q = norm(input);

  // Greetings / small talk
  if (hasAny(q, ["hi", "hello", "hey", "hii", "namaste"])) {
    return {
      text:
        "Hey! 👋 Tell me your preferred area (Malad/Kandivali/Borivali) and budget range — I’ll guide you.",
      quickActions: baseQuickActions(ctx),
    };
  }


  // If user message contains preferences, auto-fill the form draft
  const parsed = parsePrefs(input);
  if (isMeaningfulPatch(parsed.patch)) {
    const summary = parsed.summaryParts.length ? parsed.summaryParts.join(" • ") : "Got it.";
    return {
      text:
        `Perfect — I’ve captured this: ${summary}\n\n` +
        `Tap below to apply these preferences into the form (you can edit before submitting).`,
      quickActions: [
        { type: "apply_draft", label: "Apply to Form", draft: parsed.patch, scrollToId: "lead" },
        ...baseQuickActions(ctx),
      ],
    };
  }

  // Areas
  if (hasAny(q, ["area", "areas", "location", "where", "cover", "covered", "malad", "kandivali", "borivali"])) {
    return {
      text:
        `We currently cover: ${BUSINESS.areas.join(", ")}.\n` +
        `If you share East/West + budget + 1/2BHK, we’ll shortlist faster.`,
      quickActions: baseQuickActions(ctx),
    };
  }

  // Brokerage / fees
  if (hasAny(q, ["broker", "brokerage", "fee", "fees", "charge", "charges", "commission"])) {
    return {
      text: FAQ_KB.brokerage,
      quickActions: baseQuickActions(ctx),
    };
  }

  // Visit scheduling
  if (hasAny(q, ["visit", "schedule", "site", "show", "see", "inspection"])) {
    return {
      text:
        `${FAQ_KB.visits}\n\n` +
        "To schedule quickly, submit the form with your move-in date and profile.",
      quickActions: [
        { type: "scroll", label: "Request shortlist", targetId: "lead" },
        { type: "scroll", label: "How it works", targetId: "how" },
        { type: "whatsapp", label: "WhatsApp to book", text: "Hi! I want to schedule a site visit. My preferences are:" },
      ],
    };
  }

  // Documents
  if (hasAny(q, ["doc", "docs", "documents", "paper", "paperwork", "agreement", "lease"])) {
    return {
      text: FAQ_KB.documents,
      quickActions: baseQuickActions(ctx),
    };
  }

  // Deposit
  if (hasAny(q, ["deposit", "security", "advance"])) {
    return {
      text: FAQ_KB.deposit,
      quickActions: baseQuickActions(ctx),
    };
  }

  // Bachelors / family / company
  if (hasAny(q, ["bachelor", "bachelors", "single", "sharing", "family", "company", "corporate"])) {
    return {
      text:
        `${FAQ_KB.bachelors}\n\n` +
        "If you share your profile + move-in timeline, I’ll tell you the best-fit areas/buildings.",
      quickActions: baseQuickActions(ctx),
    };
  }

  // Pets
  if (hasAny(q, ["pet", "dog", "cat"])) {
    return {
      text: FAQ_KB.pets,
      quickActions: baseQuickActions(ctx),
    };
  }

  // Budget
  if (hasAny(q, ["budget", "rent", "k", "lakh", "price"])) {
    return {
      text:
        "What budget range are you targeting? Example: 40–60k. Also tell me 1BHK or 2BHK and your preferred area.",
      quickActions: [
        { type: "scroll", label: "Set budget in form", targetId: "lead" },
        { type: "whatsapp", label: "Send budget on WhatsApp", text: "Hi! My budget is __. Looking for __BHK in __." },
      ],
    };
  }

  // Move-in timeline
  if (hasAny(q, ["move", "movein", "immediate", "7", "15", "30", "month"])) {
    return {
      text: FAQ_KB.timeline + "\n\nWhat’s your move-in: Immediate / 7 / 15 / 30+?",
      quickActions: [
        { type: "scroll", label: "Choose move-in", targetId: "lead" },
        { type: "whatsapp", label: "Send move-in", text: "Hi! My move-in date is __. Looking for __BHK in __, budget __." },
      ],
    };
  }

  // Contact / Instagram
  if (hasAny(q, ["contact", "call", "phone", "number", "instagram", "ig"])) {
    return {
      text:
        `You can reach us on WhatsApp: ${BUSINESS.phoneDisplay}\n` +
        `Instagram: ${BUSINESS.instagram}`,
      quickActions: [
        { type: "whatsapp", label: "WhatsApp now", text: "Hi! I need help finding a rental home." },
        { type: "link", label: "Open Instagram", href: BUSINESS.instagram },
      ],
    };
  }

  // Fallback
  return {
    text:
      "I can help with rentals in Malad/Kandivali/Borivali — areas, budget, documents, visits, and timelines.\n" +
      "Tell me: Area (E/W), budget range, and 1BHK/2BHK — or just submit the form and we’ll message you.",
    quickActions: baseQuickActions(ctx),
  };
}
