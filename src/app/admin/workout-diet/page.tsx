import SectionHeader from "@/components/section-header";

export default function AdminWorkoutDietPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Workout & Diet"
        subtitle="AI-driven plans for member goals."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">Diet Planner</h3>
          <p className="text-sm text-slate-300">
            Create diet plans by date of birth, goal, and body type.
          </p>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            No diet plans generated yet.
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">Workout Planner</h3>
          <p className="text-sm text-slate-300">
            Strength, fat loss, and endurance routines.
          </p>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            No workout plans generated yet.
          </div>
        </div>
      </div>
    </div>
  );
}
