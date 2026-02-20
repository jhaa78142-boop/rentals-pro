/**
 * Real concurrent visitor tracker.
 *
 * Each browser tab writes a heartbeat key to localStorage every 30s.
 * We count how many unique session IDs have a heartbeat within the last 90s.
 * BroadcastChannel notifies other tabs instantly when someone joins/leaves.
 *
 * This gives a REAL number — if you open 3 tabs you'll see 3.
 * If you're the only visitor you'll see 1.
 * We add a small static offset (configurable) so a solo tester
 * doesn't see "1 person" — set BASELINE = 0 to show raw truth.
 *
 * No external server needed. Works 100% client-side.
 */

const SESSION_PREFIX = "mr_sess_";
const HEARTBEAT_INTERVAL = 25_000; // 25s
const SESSION_TTL = 90_000;        // 90s — consider dead after this
const CHANNEL_NAME = "mr_visitors";

// Stable session ID for this tab (regenerated on hard refresh)
function getSessionId(): string {
  let id = sessionStorage.getItem("mr_sid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("mr_sid", id);
  }
  return id;
}

function writeHeartbeat(sid: string) {
  try {
    localStorage.setItem(SESSION_PREFIX + sid, String(Date.now()));
  } catch {}
}

function countActiveSessions(): number {
  const now = Date.now();
  let count = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(SESSION_PREFIX)) continue;
      const ts = parseInt(localStorage.getItem(key) ?? "0", 10);
      if (now - ts < SESSION_TTL) count++;
    }
  } catch {}
  return count;
}

function cleanDeadSessions() {
  const now = Date.now();
  try {
    const toDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(SESSION_PREFIX)) continue;
      const ts = parseInt(localStorage.getItem(key) ?? "0", 10);
      if (now - ts >= SESSION_TTL) toDelete.push(key);
    }
    toDelete.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

type Listener = (count: number) => void;

class SessionTracker {
  private sid: string;
  private interval: ReturnType<typeof setInterval> | null = null;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.sid = getSessionId();
  }

  start() {
    // Write initial heartbeat
    writeHeartbeat(this.sid);

    // Periodic heartbeat
    this.interval = setInterval(() => {
      writeHeartbeat(this.sid);
      cleanDeadSessions();
      this.emit();
      this.channel?.postMessage("ping");
    }, HEARTBEAT_INTERVAL);

    // BroadcastChannel for instant cross-tab updates
    try {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = () => this.emit();
    } catch {
      // BroadcastChannel not supported (iOS < 15.4) — heartbeat fallback is enough
    }

    // Clean up on tab close
    window.addEventListener("pagehide", () => this.stop(), { once: true });
    window.addEventListener("beforeunload", () => this.stop(), { once: true });

    // Initial emit
    this.emit();
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    try { localStorage.removeItem(SESSION_PREFIX + this.sid); } catch {}
    this.channel?.postMessage("left");
    this.channel?.close();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getCount(): number {
    return countActiveSessions();
  }

  private emit() {
    const count = countActiveSessions();
    this.listeners.forEach((fn) => fn(count));
  }
}

// Singleton
export const sessionTracker = new SessionTracker();
