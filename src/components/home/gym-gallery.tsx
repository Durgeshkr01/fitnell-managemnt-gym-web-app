import Image from "next/image";
import { galleryImages } from "@/lib/home-content";
import SectionLabel from "./section-label";

export default function GymGallery() {
  const slides = [...galleryImages, ...galleryImages];

  return (
    <section id="gallery" className="overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionLabel light>/ Gallery</SectionLabel>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          Inside SG Fitness Evolution
        </h2>
        <p className="mt-3 max-w-xl text-white/75">
          Take a look at our premium AC gym, equipment, and training space in Supaul.
        </p>
      </div>

      <div className="sg-gallery-marquee relative mt-10">
        <div className="sg-gallery-track flex w-max gap-4 px-4 sm:gap-5 sm:px-6">
          {slides.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-52 w-72 shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-lg sm:h-64 sm:w-96"
            >
              <Image
                src={src}
                alt={`SG Fitness gym photo ${(i % galleryImages.length) + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 288px, 384px"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
