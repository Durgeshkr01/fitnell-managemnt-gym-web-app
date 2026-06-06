import { BG_IMAGES, branches, MAPS_EMBED, MAPS_LINK } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

export default function Locations() {
  return (
    <SectionBackground id="locations" image={BG_IMAGES.hero} variant="light">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionLabel light>/ Locations</SectionLabel>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          Find Us in Supaul
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {branches.map((b) => (
              <div key={b.name} className="sg-glass-panel p-6">
                {b.primary && (
                  <span className="mb-3 inline-block rounded-full bg-[var(--sg-red)] px-3 py-0.5 text-xs font-semibold text-white">
                    Main Branch
                  </span>
                )}
                <h3 className="font-display text-lg font-bold text-white">{b.name}</h3>
                <p className="mt-2 text-sm text-white/85">{b.address}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
                  <span>🕐 {b.hours}</span>
                  <a href={`tel:${b.phone}`} className="text-amber-300 hover:underline">
                    📞 {b.phone}
                  </a>
                </div>
                <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="sg-btn-red mt-5 inline-flex text-xs">
                  Get Directions
                </a>
              </div>
            ))}
          </div>

          <div className="sg-glass-panel overflow-hidden p-1">
            <iframe
              title="SG Fitness Evolution Location"
              src={MAPS_EMBED}
              className="h-72 w-full rounded-xl border-0 sm:h-full sm:min-h-[320px]"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </SectionBackground>
  );
}
