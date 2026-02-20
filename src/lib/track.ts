import { getAbVariant } from "./ab";
import { baseContext, postEvent } from "./telemetry";

type EventPayload = Record<string, any>;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Lightweight analytics hook.
 * - Logs to console in dev
 * - If gtag exists, sends an event
 * - If dataLayer exists, pushes an event
 * - Also posts events to VITE_LEAD_API_URL as {type:"event"} (Apps Script logging)
 */
export function track(event: string, payload: EventPayload = {}) {
  try {
    const variant = typeof window !== "undefined" ? getAbVariant() : "A";
    const ctx = baseContext({ abVariant: variant });
    const merged = { ...ctx, ...payload };

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("[track]", event, merged);
    }
    if (typeof window !== "undefined") {
      window.gtag?.("event", event, merged);
      window.dataLayer?.push({ event, ...merged });
    }

    void postEvent(event, merged);
  } catch {
    // no-op
  }
}
