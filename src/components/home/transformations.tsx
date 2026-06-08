"use client";

import { useEffect, useState } from "react";
import { BG_IMAGES, transformations } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

type Review = { author: string; text: string; rating: number; time?: string };

export default function Transformations() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch("/data/google-reviews.json")
      .then((r) => r.json())
      .then((d) => setReviews(d))
      .catch(() => setReviews([]));
  }, []);

  return (
    <SectionBackground id="reviews" image={BG_IMAGES.section2} variant="cool">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionLabel light>/ Success Stories</SectionLabel>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          Member Transformation Stories
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {transformations.map((t) => (
            <div key={t.name} className="sg-glass-panel overflow-hidden">
              <div className="grid grid-cols-2 gap-1 p-1">
                <div
                  className="flex aspect-[3/4] flex-col items-center justify-end rounded-lg bg-cover bg-center p-3"
                  style={{ backgroundImage: `url('${t.beforeImage ?? BG_IMAGES.section1}')` }}
                >
                  <span className="rounded bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/80">
                    Before
                  </span>
                </div>
                <div
                  className="flex aspect-[3/4] flex-col items-center justify-end rounded-lg bg-cover bg-center p-3"
                  style={{ backgroundImage: `url('${t.afterImage ?? BG_IMAGES.hero}')` }}
                >
                  <span className="rounded bg-emerald-600/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                    After
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-white">{t.name}</h3>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white/90">
                    {t.goal}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-amber-300">{t.result}</p>
                <p className="mt-3 text-sm italic text-white/80">&ldquo;{t.quote}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>

        {reviews.length > 0 && (
          <div className="mt-12">
            <h3 className="font-display text-xl font-bold text-white">Google Reviews</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.slice(0, 3).map((r) => (
                <div key={r.author} className="sg-glass-panel p-5">
                  <p className="text-sm text-white/85">&ldquo;{r.text}&rdquo;</p>
                  <p className="mt-3 text-xs text-white/60">
                    — {r.author} · {r.time ?? "recent"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionBackground>
  );
}
