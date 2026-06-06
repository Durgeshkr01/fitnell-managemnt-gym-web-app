import Image from "next/image";
import { BG_IMAGES, trainers } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

export default function TrainerTeam() {
  return (
    <SectionBackground id="trainers" image={BG_IMAGES.section1} variant="warm">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <SectionLabel light>/ Team</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Meet Our Trainers
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Certified professionals dedicated to your fitness success.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((t) => (
            <div key={t.name} className="sg-glass-panel overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={t.image}
                  alt={t.name}
                  fill
                  className="object-cover transition duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="font-display text-lg font-bold text-white">{t.name}</p>
                  <p className="text-xs text-white/80">{t.role}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-100">
                    {t.cert}
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs text-white/80">
                    {t.exp}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionBackground>
  );
}
