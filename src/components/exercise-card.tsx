"use client";

import { useMemo } from "react";
import ExerciseGif from "@/components/exercise-gif";
import ExerciseInstructions from "@/components/exercise-instructions";
import { findExerciseByName, findExerciseInText } from "@/lib/exercise-search";

type ExerciseCardProps = {
  exerciseName?: string;
  sourceText?: string;
  sets?: string | number;
  reps?: string | number;
  restTime?: string;
};

export default function ExerciseCard({
  exerciseName,
  sourceText,
  sets,
  reps,
  restTime,
}: ExerciseCardProps) {
  const match = useMemo(() => {
    if (exerciseName) {
      const direct = findExerciseByName(exerciseName);
      if (direct) return direct;
    }
    if (sourceText) {
      return findExerciseInText(sourceText);
    }
    return null;
  }, [exerciseName, sourceText]);

  const displayName = match?.name || exerciseName || "Unknown Exercise";
  const muscleGroup = match?.muscleGroup || "--";
  const gifSrc = match?.gif || null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Exercise</p>
          <h3 className="text-lg text-white">{displayName}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
            Muscle: {muscleGroup}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
          {match ? "Matched" : "No Match"}
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
        <ExerciseGif
          src={gifSrc}
          alt={displayName}
          className="h-56 w-full object-contain"
        />
      </div>

      <ExerciseInstructions sets={sets} reps={reps} restTime={restTime} />
    </div>
  );
}
