"use client";

import { useEffect, useMemo, useState } from "react";
import SectionHeader from "@/components/section-header";
import DatePicker from "@/components/date-picker";
import { formatDateDisplay } from "@/lib/date-utils";
import { saveAiPlan } from "@/lib/firebase/ai-plans";
import { getMembers, type MemberRecord } from "@/lib/firebase/members";

type PlanType = "diet" | "workout";

const initialForm = {
  name: "",
  dateOfBirth: "",
  goal: "",
  activityLevel: "",
  height: "",
  weight: "",
  allergies: "",
  equipment: "",
  daysPerWeek: "",
  sessionMinutes: "",
  notes: "",
};

export default function TrainerDietPlansPage() {
  const [form, setForm] = useState(initialForm);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [dietPlan, setDietPlan] = useState("");
  const [workoutPlan, setWorkoutPlan] = useState("");
  const [loadingType, setLoadingType] = useState<PlanType | null>(null);
  const [savingType, setSavingType] = useState<PlanType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadMembers = async () => {
      try {
        const results = await getMembers();
        if (active) {
          setMembers(results);
        }
      } catch (loadError) {
        if (active) {
          setMembersError(
            loadError instanceof Error ? loadError.message : "Failed to load members."
          );
        }
      } finally {
        if (active) {
          setMembersLoading(false);
        }
      }
    };

    loadMembers();

    return () => {
      active = false;
    };
  }, []);

  const updateField = (key: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = (type: PlanType) => ({
    type,
    profile: {
      name: form.name.trim() || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      goal: form.goal.trim() || undefined,
      activityLevel: form.activityLevel.trim() || undefined,
      height: form.height.trim() || undefined,
      weight: form.weight.trim() || undefined,
      allergies: form.allergies.trim() || undefined,
      equipment: form.equipment.trim() || undefined,
      daysPerWeek: form.daysPerWeek ? Number(form.daysPerWeek) : undefined,
      sessionMinutes: form.sessionMinutes ? Number(form.sessionMinutes) : undefined,
      notes: form.notes.trim() || undefined,
    },
  });

  const profilePayload = useMemo(() => buildPayload("diet").profile, [form]);

  const generatePlan = async (type: PlanType) => {
    setError(null);
    setSuccess(null);
    setLoadingType(type);

    try {
      const response = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(type)),
      });

      const data = (await response.json()) as {
        plan?: string;
        error?: string;
        detail?: string;
        status?: number;
      };
      if (!response.ok || !data.plan) {
        const detail = data.detail ? ` ${data.detail}` : "";
        const status = data.status ? ` (status ${data.status})` : "";
        throw new Error(`${data.error ?? "Failed to generate plan."}${status}${detail}`);
      }

      if (type === "diet") {
        setDietPlan(data.plan);
      } else {
        setWorkoutPlan(data.plan);
      }
    } catch (planError) {
      setError(planError instanceof Error ? planError.message : "Failed to generate plan.");
    } finally {
      setLoadingType(null);
    }
  };

  const handleSave = async (type: PlanType) => {
    setError(null);
    setSuccess(null);
    setSavingType(type);

    try {
      const plan = type === "diet" ? dietPlan : workoutPlan;
      await saveAiPlan({ type, plan, profile: profilePayload });
      setSuccess(type === "diet" ? "Diet plan saved." : "Workout plan saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save plan.");
    } finally {
      setSavingType(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Diet & Workout Plans"
        subtitle="Generate AI-guided plans for member goals."
      />

      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-display text-lg text-white">Member Details</h3>
        <p className="text-sm text-slate-300">
          Fill the profile once, then generate diet or workout plans.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Select Member
            </label>
            <select
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={selectedMemberId}
              onChange={(event) => {
                const nextId = event.target.value;
                setSelectedMemberId(nextId);
                const member = members.find((item) => item.id === nextId);
                if (member) {
                  setForm((prev) => ({
                    ...prev,
                    name: member.name ?? "",
                    dateOfBirth: member.dateOfBirth ?? "",
                  }));
                }
              }}
              disabled={membersLoading || members.length === 0}
            >
              <option className="bg-slate-900 text-white" value="">
                {membersLoading
                  ? "Loading members..."
                  : members.length > 0
                    ? "Select a member"
                    : "No members available"}
              </option>
              {members.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                  className="bg-slate-900 text-white"
                >
                  {member.name} ({member.dateOfBirth ? formatDateDisplay(member.dateOfBirth) : "--"})
                </option>
              ))}
            </select>
            {membersError ? (
              <p className="mt-2 text-xs text-rose-300">{membersError}</p>
            ) : null}
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Name
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Member name"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Date of Birth
            </label>
            <DatePicker
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.dateOfBirth}
              onChange={(value) => updateField("dateOfBirth", value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Goal
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.goal}
              onChange={(event) => updateField("goal", event.target.value)}
              placeholder="Fat loss, muscle gain"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Activity Level
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.activityLevel}
              onChange={(event) => updateField("activityLevel", event.target.value)}
              placeholder="Beginner, active, athlete"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Height
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.height}
              onChange={(event) => updateField("height", event.target.value)}
              placeholder="e.g. 170 cm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Weight
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.weight}
              onChange={(event) => updateField("weight", event.target.value)}
              placeholder="e.g. 70 kg"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Allergies
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.allergies}
              onChange={(event) => updateField("allergies", event.target.value)}
              placeholder="Peanuts, lactose"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Equipment
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.equipment}
              onChange={(event) => updateField("equipment", event.target.value)}
              placeholder="Dumbbells, treadmill"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Days Per Week
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.daysPerWeek}
              onChange={(event) => updateField("daysPerWeek", event.target.value)}
              placeholder="4"
              type="number"
              min={1}
              max={7}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Minutes Per Session
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.sessionMinutes}
              onChange={(event) => updateField("sessionMinutes", event.target.value)}
              placeholder="45"
              type="number"
              min={10}
              max={180}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Notes
            </label>
            <textarea
              className="mt-2 min-h-[90px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Injuries, preferences, medical notes"
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {success}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-60"
            type="button"
            onClick={() => generatePlan("diet")}
            disabled={loadingType !== null}
          >
            {loadingType === "diet" ? "Generating..." : "Generate Diet Plan"}
          </button>
          <button
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white disabled:opacity-60"
            type="button"
            onClick={() => generatePlan("workout")}
            disabled={loadingType !== null}
          >
            {loadingType === "workout" ? "Generating..." : "Generate Workout Plan"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">Diet Planner</h3>
          <p className="text-sm text-slate-300">AI-generated diet plan.</p>
          <div className="mt-5 whitespace-pre-wrap rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            {dietPlan || "No diet plan generated yet."}
          </div>
          <div className="mt-4 flex items-center justify-end">
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white disabled:opacity-60"
              type="button"
              onClick={() => handleSave("diet")}
              disabled={!dietPlan || savingType === "workout" || loadingType !== null}
            >
              {savingType === "diet" ? "Saving..." : "Save Diet Plan"}
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">Workout Planner</h3>
          <p className="text-sm text-slate-300">AI-generated workout plan.</p>
          <div className="mt-5 whitespace-pre-wrap rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            {workoutPlan || "No workout plan generated yet."}
          </div>
          <div className="mt-4 flex items-center justify-end">
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white disabled:opacity-60"
              type="button"
              onClick={() => handleSave("workout")}
              disabled={!workoutPlan || savingType === "diet" || loadingType !== null}
            >
              {savingType === "workout" ? "Saving..." : "Save Workout Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
