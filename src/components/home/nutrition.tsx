import { BG_IMAGES, nutritionFeatures } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

export default function Nutrition() {
  return (
    <SectionBackground image={BG_IMAGES.section2} variant="cool">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="sg-glass-panel grid grid-cols-2 gap-3 p-6">
              {[
                { cal: "2,100", label: "Daily Calories", macro: "Balanced" },
                { cal: "140g", label: "Protein", macro: "High" },
                { cal: "220g", label: "Carbs", macro: "Moderate" },
                { cal: "65g", label: "Fats", macro: "Healthy" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-white/15 p-4 text-center backdrop-blur">
                  <p className="font-display text-2xl font-bold text-amber-300">{m.cal}</p>
                  <p className="mt-1 text-xs text-white/90">{m.label}</p>
                  <p className="text-[10px] text-white/60">{m.macro}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <SectionLabel light>/ Nutrition</SectionLabel>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Diet & Nutrition Planning
            </h2>
            <p className="mt-4 text-white/85">
              Fuel your body right. Our trainers create practical, Indian-friendly meal plans you can
              actually follow.
            </p>
            <ul className="mt-8 space-y-3">
              {nutritionFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/90">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/25 text-xs text-amber-200">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/918809551534?text=Hi%2C%20I%20need%20a%20diet%20plan"
              target="_blank"
              rel="noreferrer"
              className="sg-btn-red mt-8 inline-flex"
            >
              Get Diet Plan
            </a>
          </div>
        </div>
      </div>
    </SectionBackground>
  );
}
