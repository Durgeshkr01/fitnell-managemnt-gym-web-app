"use client";

import { useEffect, useState } from "react";

type Review = { author: string; text: string; rating: number; time?: string };

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch("/data/google-reviews.json")
      .then((r) => r.json())
      .then((d) => setReviews(d))
      .catch(() => setReviews([]));
  }, []);

  return (
    <section id="reviews" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">/ Reviews</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-black sm:text-4xl">What Members Say</h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-black p-6 text-center text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Google Rating</p>
            <p className="mt-2 font-display text-5xl font-bold text-[var(--wtf-gold)]">4.9+</p>
            <p className="mt-2 text-sm text-white/50">Based on Google Maps</p>
          </div>

          {reviews.length === 0 && (
            <div className="col-span-3 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-gray-500">
              Reviews loading… Add real Google reviews to <code className="text-xs">public/data/google-reviews.json</code>.
            </div>
          )}

          {reviews.map((r) => (
            <div key={r.author} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-sm leading-relaxed text-gray-600">&ldquo;{r.text}&rdquo;</p>
              <p className="mt-4 text-xs text-gray-400">
                — {r.author} · {r.time ?? "recent"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
