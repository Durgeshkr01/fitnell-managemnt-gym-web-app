import { BG_IMAGES, workoutCategories } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

export default function WorkoutCategories() {
  return (
    <SectionBackground id="workouts" image={BG_IMAGES.hero} variant="light">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <SectionLabel light>/ Programs</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Workout Categories
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            From yoga to boxing — structured programs for every fitness goal.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {workoutCategories.map((w) => (
            <a
              key={w.name}
              href="#assessment"
              className="sg-glass-panel group p-6 text-center transition hover:scale-[1.03]"
            >
              <span className="text-4xl transition group-hover:scale-110">{w.emoji}</span>
              <h3 className="mt-4 font-display font-bold text-white">{w.name}</h3>
              <p className="mt-2 text-xs text-white/75">{w.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </SectionBackground>
  );
}
