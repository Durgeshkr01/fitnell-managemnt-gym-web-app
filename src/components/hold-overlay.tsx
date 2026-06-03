"use client";

import { useState } from "react";
import { HOLD_ACTIVE } from "@/lib/hold-config";

export default function HoldOverlay() {
  if (!HOLD_ACTIVE) {
    return null;
  }

  const [showPricing, setShowPricing] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-950/70 p-6 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-label="Application hold notice"
    >
      <div className="my-10 w-full max-w-2xl overflow-y-auto rounded-3xl border border-red-200 bg-white px-8 py-10 text-center text-slate-900 shadow-2xl sm:my-12 sm:max-h-[90vh]">
        <div className="mx-auto mb-6 h-1.5 w-24 rounded-full bg-red-500" />
        <p className="text-xs uppercase tracking-[0.4em] text-red-600">
          Alert
        </p>
        <h1 className="mt-4 font-display text-3xl text-slate-900 sm:text-4xl">
          Application Temporarily On Hold
        </h1>
        <p className="mt-4 text-sm text-slate-700">
          The developer has not paid the required platform charges. As a result,
          this application has been temporarily placed on hold until the payment
          is cleared.
        </p>

        <div className="mt-6 text-left text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-600">
            Why is payment needed?
          </p>
          <ul className="mt-4 space-y-2">
            <li>Lag-free performance</li>
            <li>Data privacy guarantee</li>
            <li>No data loss assurance</li>
            <li>Secure cloud storage</li>
            <li>Regular maintenance &amp; updates</li>
            <li>Technical support</li>
            <li>Server &amp; hosting costs</li>
            <li>Backup &amp; recovery services</li>
          </ul>
        </div>

        <p className="mt-6 text-sm font-semibold text-slate-900">
          Your data remains safe and secure. No data has been deleted or
          modified. The application will be restored once the pending platform
          charges are paid.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setShowPricing((prev) => !prev)}
            className="rounded-full border border-red-200 bg-white px-6 py-2 text-xs uppercase tracking-[0.3em] text-red-700 transition hover:bg-red-50"
          >
            View Pricing Details
          </button>
        </div>

        {showPricing ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-600">
              Pricing &amp; Service Plan
            </p>
            <h2 className="mt-3 font-display text-2xl text-slate-900">
              10-Year Platform Access
            </h2>
            <p className="mt-2 text-lg text-slate-900">
              Rs 4,750 (One-Time Payment)
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-red-600">
              Includes
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>10 years of platform access</li>
              <li>Secure cloud database hosting</li>
              <li>Regular maintenance &amp; updates</li>
              <li>Technical support assistance</li>
              <li>Data backup protection</li>
              <li>Reliable application performance</li>
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
