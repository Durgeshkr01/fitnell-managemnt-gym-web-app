"use client";

import { useEffect, useMemo, useState } from "react";
import SectionHeader from "@/components/section-header";
import { formatDateTimeDisplay } from "@/lib/date-utils";
import { getAiPlans, type AiPlanRecord } from "@/lib/firebase/ai-plans";

const typeStyles: Record<string, string> = {
  diet: "border-emerald-400/30 text-emerald-300",
  workout: "border-amber-400/30 text-amber-300",
};

export default function TrainerAiPlansPage() {
  const [plans, setPlans] = useState<AiPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadPlans = async () => {
      try {
        const results = await getAiPlans();
        if (active) {
          setPlans(results);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load plans.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPlans();

    return () => {
      active = false;
    };
  }, []);

  const headerLabel = useMemo(() => {
    if (loading) {
      return "Loading saved plans...";
    }
    return plans.length > 0
      ? `${plans.length} plan(s) saved`
      : "No saved plans yet.";
  }, [loading, plans.length]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI Plans"
        subtitle="Saved diet and workout plans from trainers."
      />

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg text-white">Saved Plans</h3>
            <p className="text-sm text-slate-300">{headerLabel}</p>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Loading plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              No saved plans yet.
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-white">
                      {plan.profile?.name || "Member"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {plan.profile?.goal || "Goal not set"}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs ${
                      typeStyles[plan.type] ?? "border-white/20 text-slate-300"
                    }`}
                  >
                    {plan.type === "diet" ? "Diet Plan" : "Workout Plan"}
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  {formatDateTimeDisplay(plan.createdAt)}
                </div>
                <div className="mt-3 whitespace-pre-wrap rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                  {plan.plan}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
