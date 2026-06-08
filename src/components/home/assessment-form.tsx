"use client";

import { FormEvent, useState } from "react";
import { BG_IMAGES, GYM_WHATSAPP } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

const goals = [
  "Weight Loss",
  "Muscle Gain",
  "General Fitness",
  "Strength Training",
  "Cardio & Endurance",
];

export default function AssessmentForm() {
  const [form, setForm] = useState({ name: "", phone: "", gender: "", goal: "" });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const msg = [
      "Hi! I'd like a fitness assessment at SG Fitness Evolution.",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      form.gender ? `Gender: ${form.gender}` : "",
      form.goal ? `Goal: ${form.goal}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${GYM_WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <SectionBackground id="assessment" image={BG_IMAGES.assessment} variant="warm">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionLabel light>/ Fitness Assessment</SectionLabel>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          Start Your Transformation
        </h2>
        <p className="mt-3 max-w-xl text-white/85">
          Tell us about your goals. Our trainers will reach out with a personalized plan.
        </p>

        <form
          onSubmit={handleSubmit}
          className="sg-glass-panel mt-10 grid gap-4 p-6 sm:grid-cols-2 sm:gap-5 sm:p-8"
        >
          <label className="sg-field">
            <span>Name *</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
            />
          </label>
          <label className="sg-field">
            <span>Phone *</span>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Mobile number"
            />
          </label>
          <label className="sg-field">
            <span>Gender</span>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="sg-field">
            <span>Goal *</span>
            <select
              required
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
            >
              <option value="">Select your goal</option>
              {goals.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2 sm:flex sm:justify-end">
            <button type="submit" className="sg-btn-red w-full sm:w-auto">
              Continue on WhatsApp →
            </button>
          </div>
        </form>
      </div>
    </SectionBackground>
  );
}
