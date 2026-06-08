import Link from "next/link";
import { BG_IMAGES, heroStats } from "@/lib/home-content";

export default function HomeHero() {
  return (
    <section className="sg-hero">
      <div className="sg-hero-bg" style={{ backgroundImage: `url('${BG_IMAGES.hero}')` }} />
      <div className="sg-hero-overlay" />
      <div className="sg-hero-glow" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-28 sm:px-6">
        <div className="max-w-3xl animate-fade-up">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Premium Fitness · Supaul
          </p>

          <h1 className="sg-hero-title font-display drop-shadow-lg">
            STOP WAITING.
            <br />
            START <span className="text-amber-300">EVOLVING.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 drop-shadow sm:text-lg">
            Supaul&apos;s premium AC gym with personal training, diet guidance, and professional
            coaching for weight loss and muscle gain.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#assessment" className="sg-btn-red">
              Join Now
            </Link>
            <Link href="/access" className="sg-btn-glass">
              Login
            </Link>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-4 sm:max-w-lg sm:gap-8 animate-fade-up delay-200">
          {heroStats.map((s) => (
            <div key={s.label} className="sg-glass-stat">
              <p className="font-display text-2xl font-bold text-white sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/80 sm:text-xs">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
