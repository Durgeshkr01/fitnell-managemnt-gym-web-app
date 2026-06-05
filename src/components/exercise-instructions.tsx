type ExerciseInstructionsProps = {
  sets?: string | number;
  reps?: string | number;
  restTime?: string;
};

export default function ExerciseInstructions({
  sets,
  reps,
  restTime,
}: ExerciseInstructionsProps) {
  return (
    <div className="mt-3 grid gap-3 text-xs text-slate-300 sm:grid-cols-3">
      <div>
        <p className="uppercase tracking-[0.2em] text-slate-500">Sets</p>
        <p className="text-sm text-white">{sets ?? "--"}</p>
      </div>
      <div>
        <p className="uppercase tracking-[0.2em] text-slate-500">Reps</p>
        <p className="text-sm text-white">{reps ?? "--"}</p>
      </div>
      <div>
        <p className="uppercase tracking-[0.2em] text-slate-500">Rest</p>
        <p className="text-sm text-white">{restTime ?? "--"}</p>
      </div>
    </div>
  );
}
