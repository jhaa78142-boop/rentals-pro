import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { getApiUrl } from "../lib/apiClient";

export default function EnvBanner() {
  const [dismissed, setDismissed] = useState(false);
  const apiUrl = getApiUrl();

  if (apiUrl || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] flex items-start gap-3 border-t border-yellow-500/30 bg-yellow-500/15 px-4 py-3 text-sm text-yellow-200 backdrop-blur">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
      <div className="flex-1">
        <span className="font-semibold">VITE_LEAD_API_URL not set.</span>{" "}
        Copy <code className="rounded bg-white/10 px-1 text-xs">.env.example</code> to{" "}
        <code className="rounded bg-white/10 px-1 text-xs">.env.local</code> and add your
        Apps Script URL, then restart the dev server.
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="rounded p-1 hover:bg-white/10"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
