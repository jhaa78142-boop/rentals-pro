type AnyObj = Record<string, any>;

function getUtm() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      utm_source: params.get("utm_source") ?? undefined,
      utm_medium: params.get("utm_medium") ?? undefined,
      utm_campaign: params.get("utm_campaign") ?? undefined,
      utm_term: params.get("utm_term") ?? undefined,
      utm_content: params.get("utm_content") ?? undefined,
    };
    const any = Object.values(utm).some(Boolean);
    return any ? utm : {};
  } catch {
    return {};
  }
}

function getDevice() {
  try {
    const w = window.innerWidth;
    if (w < 640) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  } catch {
    return "unknown";
  }
}

export function baseContext(extra: AnyObj = {}): AnyObj {
  const ctx: AnyObj = {
    page: typeof window !== "undefined" ? window.location.pathname : "/",
    url: typeof window !== "undefined" ? window.location.href : "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
    device: typeof window !== "undefined" ? getDevice() : "unknown",
    ...getUtm(),
    ...extra,
  };
  return ctx;
}

/** Fire-and-forget event logger to your Lead API (Apps Script).
 * Sends { type: "event", ... } with Content-Type text/plain;charset=utf-8
 */
export async function postEvent(event: string, payload: AnyObj = {}) {
  const apiUrl = import.meta.env.VITE_LEAD_API_URL as string | undefined;
  if (!apiUrl) return;
  const body = {
    type: "event",
    event,
    ts: new Date().toISOString(),
    ...payload,
  };

  try {
    // keepalive helps during page unload in modern browsers
    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // ignore telemetry failures
  }
}
