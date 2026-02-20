export type LeadPayload = {
  name: string;
  phone: string;
  area: string;
  locality?: string;
  budgetRange: string;
  bhk: string;
  furnishing: string;
  moveIn: string;
  profile: string;
  notes?: string;
  source: "Website";
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
  // honeypot — must always be empty
  _hp?: string;
};

export type LeadResult =
  | { ok: true; leadId: string; created?: boolean; updated?: boolean }
  | { ok: false; error: string };

function envApiUrl(): string {
  const url = (import.meta.env.VITE_LEAD_API_URL as string | undefined) ?? "";
  return url.trim();
}

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  const apiUrl = envApiUrl();
  if (!apiUrl) {
    return { ok: false, error: "Missing API URL. Set VITE_LEAD_API_URL in .env and restart." };
  }

  // Anti-spam: honeypot check
  if (payload._hp && payload._hp.trim() !== "") {
    // Silently reject bots — return fake success
    return { ok: true, leadId: "BOT_REJECTED", created: false };
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      data = {};
    }

    if (!res.ok) {
      const msg =
        (data.message as string) ||
        (data.error as string) ||
        `Request failed (${res.status})`;
      return { ok: false, error: msg };
    }

    const leadId = (data.leadId as string) || (data.id as string) || "Submitted";
    return {
      ok: true,
      leadId,
      created: data.created as boolean | undefined,
      updated: data.updated as boolean | undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error. Please try again.";
    return { ok: false, error: message };
  }
}

export function getApiUrl() {
  return envApiUrl();
}
