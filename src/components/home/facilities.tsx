import { BG_IMAGES, facilities } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

export default function Facilities() {
  return (
    <SectionBackground id="facilities" image={BG_IMAGES.section2} variant="cool">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <SectionLabel light>/ Facilities</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            World-Class Gym Facilities
          </h2>
          <p className="mt-4 text-white/85">
            Everything you need for a complete fitness experience — under one premium roof.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f) => (
            <div
              key={f.title}
              className="sg-glass-panel group p-6 transition hover:scale-[1.02] hover:border-amber-300/30"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl backdrop-blur">
                {f.icon}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionBackground>
  );
}
