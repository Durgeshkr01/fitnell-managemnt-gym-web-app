import React from "react";
import Image from "next/image";

const features = [
  { title: "Personal Training", desc: "One-on-one coaching for goals." },
  { title: "Diet Guidance", desc: "Nutrition plans for weight & muscle." },
  { title: "Strength Training", desc: "Free weights & machines." },
  { title: "Cardio Zone", desc: "Treadmills, bikes and more." },
  { title: "Certified Trainers", desc: "Experienced and certified staff." },
];

export default function GymFacilities() {
  return (
    <section className="glass-panel rounded-3xl p-8">
      <div className="section-header mb-6">
        <h2 className="font-display text-2xl font-semibold">Gym Facilities</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="panel-card rounded-2xl border border-white/10 p-4"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-white/5 flex items-center justify-center">
                <Image src="/icons/dumbbell.svg" alt="icon" width={36} height={36} className="object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
