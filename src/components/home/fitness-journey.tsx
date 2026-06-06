import { BG_IMAGES, journeyFeatures } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

export default function FitnessJourney() {
  return (
    <SectionBackground image={BG_IMAGES.section1} variant="warm">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionLabel light>/ Your Journey</SectionLabel>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Personalized Fitness Journey
            </h2>
            <p className="mt-4 text-white/85">
              Track every rep, every meal, and every milestone — with your trainer by your side.
            </p>

            <div className="mt-8 space-y-4">
              {journeyFeatures.map((f) => (
                <div key={f.title} className="sg-glass-panel flex gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl backdrop-blur">
                    {f.icon}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-white">{f.title}</h3>
                    <p className="mt-1 text-sm text-white/80">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sg-glass-panel p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Sample Progress</p>
            <div className="mt-6 space-y-5">
              {[
                { label: "Workouts This Month", value: 18, max: 24 },
                { label: "Attendance Streak", value: 12, max: 15 },
                { label: "Goal Completion", value: 78, max: 100 },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/90">{bar.label}</span>
                    <span className="font-semibold text-amber-300">
                      {bar.label === "Goal Completion" ? `${bar.value}%` : bar.value}
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                      style={{ width: `${(bar.value / bar.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-white/60">
              Available in your member portal after joining
            </p>
          </div>
        </div>
      </div>
    </SectionBackground>
  );
}
