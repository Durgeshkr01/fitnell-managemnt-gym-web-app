"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MemberPortalShell from "@/components/member/member-portal-shell";
import {
  ACTIVITY_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  calculateNutritionTargets,
  type ActivityLevel,
  type Gender,
  type NutritionGoal,
} from "@/lib/nutrition/bmi-calculator";
import {
  getMemberNutritionProfile,
  saveMemberNutritionProfile,
} from "@/lib/firebase/diet-tracking";

const inputClassName = "portal-input";

export default function BmiCalculatorPage() {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<NutritionGoal>("maintain");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.localStorage.getItem("memberId");
    setMemberId(id);

    if (!id) return;

    void getMemberNutritionProfile(id)
      .then((profile) => {
        if (!profile) return;
        setHeightCm(String(profile.heightCm));
        setWeightKg(String(profile.weightKg));
        setAge(String(profile.age));
        setGender(profile.gender);
        setActivityLevel(profile.activityLevel);
        setGoal(profile.goal);
      })
      .catch(() => {
        // Ignore load errors; user can still calculate fresh.
      });
  }, []);

  const result = useMemo(() => {
    const height = Number(heightCm);
    const weight = Number(weightKg);
    const ageNum = Number(age);

    if (!height || !weight || !ageNum || height < 50 || weight < 20 || ageNum < 10) {
      return null;
    }

    return calculateNutritionTargets({
      heightCm: height,
      weightKg: weight,
      age: ageNum,
      gender,
      activityLevel,
      goal,
    });
  }, [heightCm, weightKg, age, gender, activityLevel, goal]);

  const handleSave = async () => {
    if (!memberId || !result) {
      setError("Please fill all details and calculate first.");
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await saveMemberNutritionProfile({
        memberId,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        age: Number(age),
        gender,
        activityLevel,
        goal,
        bmi: result.bmi,
        bmiCategory: result.bmiCategory,
        dailyCalories: result.dailyCalories,
        dailyProtein: result.dailyProtein,
      });
      setSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save your targets."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <MemberPortalShell
      title="BMI Calculator"
      subtitle="Apna BMI, daily calories aur protein target calculate karein."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-2xl p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Height (cm)</span>
              <input
                type="number"
                min={50}
                max={250}
                value={heightCm}
                onChange={(event) => setHeightCm(event.target.value)}
                className={inputClassName}
                placeholder="170"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Weight (kg)</span>
              <input
                type="number"
                min={20}
                max={300}
                value={weightKg}
                onChange={(event) => setWeightKg(event.target.value)}
                className={inputClassName}
                placeholder="70"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Age</span>
              <input
                type="number"
                min={10}
                max={100}
                value={age}
                onChange={(event) => setAge(event.target.value)}
                className={inputClassName}
                placeholder="25"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Gender</span>
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value as Gender)}
                className={inputClassName}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className="space-y-2 text-sm sm:col-span-2">
              <span className="text-slate-300">Activity Level</span>
              <select
                value={activityLevel}
                onChange={(event) =>
                  setActivityLevel(event.target.value as ActivityLevel)
                }
                className={inputClassName}
              >
                {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm sm:col-span-2">
              <span className="text-slate-300">Goal</span>
              <select
                value={goal}
                onChange={(event) => setGoal(event.target.value as NutritionGoal)}
                className={inputClassName}
              >
                {GOAL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Your Results
          </p>

          {result ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">BMI</p>
                <p className="font-display mt-1 text-3xl text-white">{result.bmi}</p>
                <p className="mt-1 text-sm text-amber-200">{result.bmiCategory}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-4">
                  <p className="text-xs text-slate-300">Daily Calories</p>
                  <p className="font-display mt-1 text-2xl text-white">
                    {result.dailyCalories}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">kcal / day</p>
                </div>
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                  <p className="text-xs text-slate-300">Daily Protein</p>
                  <p className="font-display mt-1 text-2xl text-white">
                    {result.dailyProtein}g
                  </p>
                  <p className="mt-1 text-xs text-slate-400">recommended</p>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Maintenance: {result.maintenanceCalories} kcal · BMR: {result.bmr} kcal
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Targets"}
                </button>
                <Link
                  href="/member/diet-tracker"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  Diet Tracker →
                </Link>
              </div>

              {saved ? (
                <p className="text-sm text-emerald-300">
                  Targets saved. Ab Diet Tracker mein jaake khana log karein.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-300">
              Apni height, weight aur age bharein — results yahan dikhenge.
            </p>
          )}

          {error ? (
            <p className="mt-4 text-sm text-rose-300">{error}</p>
          ) : null}
        </div>
      </div>
    </MemberPortalShell>
  );
}
