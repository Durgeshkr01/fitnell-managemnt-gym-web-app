"use client";

import { useState } from "react";
import { BG_IMAGES, faqs } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

export default function HomeFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SectionBackground id="faq" image={BG_IMAGES.hero} variant="light">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <SectionLabel light>/ FAQ</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="sg-glass-panel mt-10 divide-y divide-white/15 px-2">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-5 text-left"
              >
                <span className="pr-4 font-medium text-white">{f.q}</span>
                <span className="shrink-0 text-xl text-amber-300">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <p className="px-4 pb-5 text-sm leading-relaxed text-white/80">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionBackground>
  );
}
