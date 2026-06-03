"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "sgFitnessActivationNoticeSeen";
const AUTO_HIDE_MS = 6000;

export default function OneTimeActivationNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hasSeen = window.localStorage.getItem(STORAGE_KEY);
    if (hasSeen) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(true);

    const timeoutId = window.setTimeout(() => {
      setIsVisible(false);
    }, AUTO_HIDE_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-xl items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 shadow-lg">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
            Congrats
          </p>
          <p className="mt-1 font-medium">
            You are active for 10 years.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-emerald-300 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-700 transition hover:bg-emerald-100"
          onClick={() => setIsVisible(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
}
