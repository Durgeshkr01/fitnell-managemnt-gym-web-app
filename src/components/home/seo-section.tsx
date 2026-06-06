import { BG_IMAGES, GYM_ADDRESS, GYM_HOURS, GYM_PHONE, seoKeywords } from "@/lib/home-content";
import SectionBackground from "./section-background";

export default function SeoSection() {
  return (
    <SectionBackground image={BG_IMAGES.section2} variant="cool">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="sr-only">SG Fitness Evolution — Best Gym in Supaul</h2>

        <div className="flex flex-wrap gap-2">
          {seoKeywords.map((kw) => (
            <span
              key={kw}
              className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs text-white/90 backdrop-blur"
            >
              {kw}
            </span>
          ))}
        </div>

        <div className="mt-8 space-y-4 text-sm leading-relaxed text-white/80">
          <p>
            <strong className="text-white">Best Gym in Supaul</strong> — SG Fitness Evolution is
            Supaul&apos;s premium fitness center offering AC training floors, personal trainers,
            diet guidance, and structured programs for weight loss and muscle gain.
          </p>
          <p>
            Looking for a <strong className="text-white">Fitness Center in Supaul</strong>? Visit us
            at {GYM_ADDRESS}. Open {GYM_HOURS}. Call {GYM_PHONE} or WhatsApp for membership
            enquiries.
          </p>
          <p>
            Our <strong className="text-white">Personal Trainer in Supaul</strong> team provides
            one-on-one coaching, form correction, and customized workout plans. Whether you need a{" "}
            <strong className="text-white">Weight Loss Gym in Supaul</strong> or{" "}
            <strong className="text-white">Muscle Gain Training in Supaul</strong>, we have
            programs designed for your body and goals.
          </p>
        </div>
      </div>
    </SectionBackground>
  );
}
