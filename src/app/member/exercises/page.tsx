"use client";

import { useEffect, useRef, useState } from "react";
import ExerciseCard from "@/components/exercise-card";
import MemberPortalShell from "@/components/member/member-portal-shell";
import { searchExercises } from "@/lib/exercise-search";

const inputClassName = "portal-input";

export default function MemberExercisesPage() {
  const [exerciseInput, setExerciseInput] = useState("");
  const [exerciseSets, setExerciseSets] = useState("");
  const [exerciseReps, setExerciseReps] = useState("");
  const [exerciseRest, setExerciseRest] = useState("");
  const [suggestions, setSuggestions] = useState<
    { name: string; muscleGroup?: string | null }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exerciseInput.trim()) {
      setSuggestions([]);
      return;
    }
    setSuggestions(searchExercises(exerciseInput, 8));
  }, [exerciseInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectExercise = (name: string) => {
    setExerciseInput(name);
    setShowSuggestions(false);
  };

  return (
    <MemberPortalShell
      title="Exercise Lookup"
      subtitle="Exercise ka naam likhein — GIF, muscle group aur form guide dekhein."
    >
      <div className="space-y-6">
        <div
          className={`glass-panel rounded-2xl p-6 ${
            showSuggestions && suggestions.length > 0
              ? "relative z-50 overflow-visible"
              : ""
          }`}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Search Exercise
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Example: bench press, deadlift, squat, bicep curl, lat pulldown
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.4fr_0.4fr_0.5fr]">
            <div ref={searchRef} className="relative">
              <label className="text-xs text-slate-400">
                Exercise Name
                <input
                  value={exerciseInput}
                  onChange={(event) => {
                    setExerciseInput(event.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Bench press, deadlift, etc."
                  className={`${inputClassName} mt-2`}
                />
              </label>
              {showSuggestions && suggestions.length > 0 ? (
                <div className="absolute z-[60] mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-white/20 bg-slate-950 shadow-2xl">
                  {suggestions.map((exercise) => (
                    <button
                      key={exercise.name}
                      type="button"
                      onClick={() => handleSelectExercise(exercise.name)}
                      className="flex w-full items-center justify-between gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5"
                    >
                      <p className="text-sm text-white">{exercise.name}</p>
                      <p className="text-xs text-slate-400">
                        {exercise.muscleGroup ?? "General"}
                      </p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <label className="text-xs text-slate-400">
              Sets
              <input
                value={exerciseSets}
                onChange={(event) => setExerciseSets(event.target.value)}
                placeholder="4"
                className={`${inputClassName} mt-2`}
              />
            </label>
            <label className="text-xs text-slate-400">
              Reps
              <input
                value={exerciseReps}
                onChange={(event) => setExerciseReps(event.target.value)}
                placeholder="10"
                className={`${inputClassName} mt-2`}
              />
            </label>
            <label className="text-xs text-slate-400">
              Rest Time
              <input
                value={exerciseRest}
                onChange={(event) => setExerciseRest(event.target.value)}
                placeholder="60s"
                className={`${inputClassName} mt-2`}
              />
            </label>
          </div>
        </div>

        {exerciseInput.trim() ? (
          <ExerciseCard
            exerciseName={exerciseInput}
            sourceText={exerciseInput}
            sets={exerciseSets}
            reps={exerciseReps}
            restTime={exerciseRest}
          />
        ) : (
          <div className="glass-panel rounded-2xl p-6 text-sm text-slate-300">
            Upar exercise ka naam likhein — form guide aur GIF yahan dikhega.
          </div>
        )}
      </div>
    </MemberPortalShell>
  );
}
