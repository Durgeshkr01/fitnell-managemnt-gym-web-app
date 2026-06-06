"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const images: Array<string> = [
  "/images/durgesh.jpg",
  "/images/gym-owner.jpg",
  "/images/exercise-placeholder.svg",
];

export default function GymGallery() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const next = () => setIndex((i) => (i + 1) % (images.length + 1));
    timeoutRef.current = window.setInterval(next, 4000);
    return () => {
      if (timeoutRef.current) window.clearInterval(timeoutRef.current);
    };
  }, []);

  const totalSlides = images.length + 1;

  return (
    <section id="gallery" className="bg-[#0a0a0a] py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">/ Gallery</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Inside SG Fitness</h2>

        <div className="relative mt-8 overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-700"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((src, i) => (
              <div key={i} className="relative min-w-full h-64 sm:h-96">
                <Image src={src} alt={`gallery-${i}`} fill className="object-cover" priority={i === 0} />
              </div>
            ))}
            <div className="relative min-w-full h-64 sm:h-96 overflow-hidden">
              <iframe
                title="Gym Location"
                src="https://www.google.com/maps?q=Station%20Road%20Supaul&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-[var(--wtf-red)]" : "w-4 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
