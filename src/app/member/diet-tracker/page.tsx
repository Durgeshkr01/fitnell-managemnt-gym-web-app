"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MemberPortalShell from "@/components/member/member-portal-shell";
import {
  addDietLogEntry,
  deleteDietLogEntry,
  getDietLogsForDate,
  getMemberNutritionProfile,
  getTodayDateKey,
  sumDietLogs,
  type DietLogEntry,
  type MemberNutritionProfile,
} from "@/lib/firebase/diet-tracking";
import {
  getFoodNutrition,
  searchFoods,
  type IndianFood,
} from "@/lib/nutrition/indian-foods";

const inputClassName = "portal-input";

const SERVING_OPTIONS = [0.5, 1, 1.5, 2, 3];

function ProgressBar({
  label,
  current,
  target,
  unit,
  colorClass,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  colorClass: string;
}) {
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-white">
          {current}
          {unit} / {target}
          {unit}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function DietTrackerPage() {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [profile, setProfile] = useState<MemberNutritionProfile | null>(null);
  const [entries, setEntries] = useState<DietLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foodQuery, setFoodQuery] = useState("");
  const [suggestions, setSuggestions] = useState<IndianFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<IndianFood | null>(null);
  const [servings, setServings] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const today = getTodayDateKey();

  useEffect(() => {
    const id = window.localStorage.getItem("memberId");
    setMemberId(id);

    if (!id) {
      setLoading(false);
      setError("Member session not found.");
      return;
    }

    const loadData = async () => {
      try {
        const [profileData, logData] = await Promise.all([
          getMemberNutritionProfile(id),
          getDietLogsForDate(id, today),
        ]);
        setProfile(profileData);
        setEntries(logData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load diet tracker."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [today]);

  useEffect(() => {
    if (!foodQuery.trim()) {
      setSuggestions([]);
      return;
    }
    setSuggestions(searchFoods(foodQuery, 8));
  }, [foodQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totals = useMemo(() => sumDietLogs(entries), [entries]);

  const previewNutrition = useMemo(() => {
    if (!selectedFood) return null;
    return getFoodNutrition(selectedFood, servings);
  }, [selectedFood, servings]);

  const handleSelectFood = (food: IndianFood) => {
    setSelectedFood(food);
    setFoodQuery(food.name);
    setShowSuggestions(false);
  };

  const handleAddFood = async () => {
    if (!memberId || !selectedFood || !previewNutrition) {
      setError("Pehle khane ka naam select karein.");
      return;
    }

    setAdding(true);
    setError(null);

    try {
      await addDietLogEntry({
        memberId,
        date: today,
        foodId: selectedFood.id,
        foodName: selectedFood.name,
        servingLabel: selectedFood.servingLabel,
        servings,
        calories: previewNutrition.calories,
        protein: previewNutrition.protein,
      });

      const updated = await getDietLogsForDate(memberId, today);
      setEntries(updated);
      setFoodQuery("");
      setSelectedFood(null);
      setServings(1);
    } catch (addError) {
      setError(
        addError instanceof Error ? addError.message : "Failed to add food."
      );
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!memberId) return;

    try {
      await deleteDietLogEntry(entryId);
      setEntries((current) => current.filter((entry) => entry.id !== entryId));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Failed to remove item."
      );
    }
  };

  return (
    <MemberPortalShell
      title="Diet Tracker"
      subtitle="Khana ka naam likhein — calorie aur protein automatic aayega."
    >
      {loading ? (
        <div className="glass-panel rounded-2xl p-6 text-sm text-slate-300">
          Loading diet tracker...
        </div>
      ) : !profile ? (
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-sm text-slate-300">
            Pehle apna calorie aur protein target set karein.
          </p>
          <Link
            href="/member/bmi-calculator"
            className="mt-4 inline-flex rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
          >
            BMI Calculator →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Aaj ka Target
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  BMI {profile.bmi} · {profile.bmiCategory}
                </p>
              </div>
              <Link
                href="/member/bmi-calculator"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
              >
                Update Targets
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              <ProgressBar
                label="Calories"
                current={totals.calories}
                target={profile.dailyCalories}
                unit=""
                colorClass="bg-blue-500"
              />
              <ProgressBar
                label="Protein"
                current={totals.protein}
                target={profile.dailyProtein}
                unit="g"
                colorClass="bg-emerald-500"
              />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Aaj ka Log
              </p>
              <p className="text-xs text-slate-400">{today}</p>
            </div>

            {entries.length === 0 ? (
              <p className="mt-4 text-sm text-slate-300">
                Abhi kuch add nahi kiya. Neeche se khana add karein.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-white">{entry.foodName}</p>
                      <p className="text-xs text-slate-400">
                        {entry.servings}x {entry.servingLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs text-slate-300">
                        <p>{entry.calories} kcal</p>
                        <p>{entry.protein}g protein</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDelete(entry.id)}
                        className="rounded-lg border border-rose-400/30 px-2 py-1 text-xs text-rose-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className={`glass-panel rounded-2xl p-6 ${
              showSuggestions && suggestions.length > 0
                ? "relative z-50 mb-72 overflow-visible"
                : ""
            }`}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Khana Add Karein
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Example: chawal, daal, anda, kaju, peanut, roti, paneer
            </p>

            <div className="mt-4 space-y-4">
              <div ref={searchRef} className="relative">
                <input
                  type="text"
                  value={foodQuery}
                  onChange={(event) => {
                    setFoodQuery(event.target.value);
                    setSelectedFood(null);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className={inputClassName}
                  placeholder="Khane ka naam likhein..."
                />
                {showSuggestions && suggestions.length > 0 ? (
                  <div className="absolute z-[60] mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-white/20 bg-slate-950 shadow-2xl">
                    {suggestions.map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => handleSelectFood(food)}
                        className="flex w-full items-start justify-between gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5"
                      >
                        <div>
                          <p className="text-sm text-white">{food.name}</p>
                          <p className="text-xs text-slate-400">{food.servingLabel}</p>
                        </div>
                        <div className="text-right text-xs text-slate-400">
                          <p>{food.caloriesPerServing} kcal</p>
                          <p>{food.proteinPerServing}g protein</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {selectedFood ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">{selectedFood.name}</p>
                      <p className="text-xs text-slate-400">
                        Per {selectedFood.servingLabel}: {selectedFood.caloriesPerServing} kcal ·{" "}
                        {selectedFood.proteinPerServing}g protein
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SERVING_OPTIONS.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setServings(value)}
                          className={`rounded-full border px-3 py-1 text-xs ${
                            servings === value
                              ? "border-blue-400/40 bg-blue-500/20 text-white"
                              : "border-white/10 bg-white/5 text-slate-300"
                          }`}
                        >
                          {value}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {previewNutrition ? (
                    <p className="mt-3 text-sm text-emerald-200">
                      Total: {previewNutrition.calories} kcal · {previewNutrition.protein}g protein
                    </p>
                  ) : null}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void handleAddFood()}
                disabled={adding || !selectedFood}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {adding ? "Adding..." : "Add to Today"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}
    </MemberPortalShell>
  );
}
