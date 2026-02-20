// Local analytics — stores events in localStorage, no external calls

const MAX_EVENTS = 200;
const STORAGE_KEY = "mr_events";

export type AnalyticsEvent = {
  event: string;
  ts: number;
  payload?: Record<string, unknown>;
};

function safeGetEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    return [];
  }
}

function safeSetEvents(events: AnalyticsEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {}
}

export function logEvent(event: string, payload?: Record<string, unknown>) {
  const events = safeGetEvents();
  events.push({ event, ts: Date.now(), payload });
  safeSetEvents(events);

  if (import.meta.env.DEV) {
    console.log("[analytics]", event, payload ?? {});
  }
}

export function getEvents(): AnalyticsEvent[] {
  return safeGetEvents();
}

export function clearEvents() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
