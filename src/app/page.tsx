"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SiteFooter from "@/components/site-footer";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const storedRole = window.localStorage.getItem("authRole");
    const hasAdmin = window.localStorage.getItem("adminAuthed") === "true";
    const trainerCodeValue = window.localStorage.getItem("trainerCode");
    const memberId = window.localStorage.getItem("memberId");

    if (storedRole === "admin" && hasAdmin) {
      router.replace("/admin");
      return;
    }

    if (storedRole === "trainer" && trainerCodeValue) {
      router.replace("/trainer");
      return;
    }

    if (storedRole === "member" && memberId) {
      router.replace("/member");
    }
  }, [router]);

  return (
    <div className="app-bg min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[color:var(--accent)] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-[color:var(--accent-2)] opacity-20 blur-3xl" />

      <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="glass-panel-strong neon-border animate-fade-up rounded-3xl p-8 md:p-12">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-[0_0_24px_rgba(64,107,255,0.35)]">
              <Image
                src="/logo.svg"
                alt="SG FITNESS EVOLUTION"
                width={44}
                height={44}
                className="h-full w-full object-contain p-2"
                priority
              />
            </div>
            <h1 className="font-display text-3xl font-semibold leading-tight text-white md:text-5xl">
              SG Fitness Evolution
            </h1>
            <Link
              href="/access"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-xs uppercase tracking-[0.25em] text-slate-200"
            >
              Access Login
            </Link>
          </div>
        </header>

        <section className="glass-panel rounded-3xl p-8">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                <Image
                  src="/images/gym-owner.jpg"
                  alt="Gym Owner"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Gym Info
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Supaul ka premium AC gym. Structured training, diet guidance, aur
                consistent progress focus. Walk in for a quick tour.
              </p>

              <div className="mt-6 grid gap-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Address
                  </p>
                  <p className="mt-2 text-white">
                    Station Road, Near Central Bank of India, Prem Nagar, Supaul,
                    Bihar 852131
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Phone / WhatsApp
                    </p>
                    <p className="mt-2 text-white">8809551534</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Opening Hours
                    </p>
                    <p className="mt-2 text-white">5-10 AM, 4-10 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="tel:8809551534"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
                >
                  Call Now
                </a>
                <a
                  href="https://wa.me/918809551534"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-200"
                >
                  WhatsApp
                </a>
                <a
                  href="https://share.google/vSOLuqnbizuJN4sm3"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
                >
                  Get Directions
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="glass-panel-strong rounded-2xl border border-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Rating
                </p>
                <p className="mt-2 font-display text-3xl text-white">4.9</p>
                <p className="mt-2 text-xs text-slate-300">
                  Based on Google reviews
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  "AC Gym",
                  "Personal Training",
                  "Diet Guidance",
                  "Strength + Cardio Zone",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />

      </main>
    </div>
  );
}
