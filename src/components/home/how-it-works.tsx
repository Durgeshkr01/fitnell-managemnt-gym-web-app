import Link from "next/link";
import { BG_IMAGES, howItWorks } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

export default function HowItWorks() {
  return (
    <SectionBackground image={BG_IMAGES.section2} variant="light">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <SectionLabel light>/ Process</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            How It Works
          </h2>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {howItWorks.map((s) => (
            <div key={s.title} className="sg-glass-panel text-center p-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-400/40 bg-amber-500/15 backdrop-blur">
                <span className="font-display text-2xl font-bold text-white">{s.step}</span>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/access" className="sg-btn-red">
            Join Now
          </Link>
        </div>
      </div>
    </SectionBackground>
  );
}
