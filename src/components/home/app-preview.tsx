import Link from "next/link";
import { BG_IMAGES } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="sg-phone">
      <div className="sg-phone-notch" />
      <div className="sg-phone-screen">{children}</div>
    </div>
  );
}

export default function AppPreview() {
  return (
    <SectionBackground image={BG_IMAGES.section2} variant="light">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <SectionLabel light>/ Member App</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Your Fitness Hub in Your Pocket
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/85">
            Access membership details, payment history, workout plans, and trainer chat — all from one
            app.
          </p>
        </div>

        <div className="mt-14 flex flex-wrap items-end justify-center gap-8 lg:gap-12">
          <PhoneMockup>
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Membership</p>
              <div className="mt-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 p-4 text-white">
                <p className="text-xs text-white/70">SG FITNESS EVOLUTION</p>
                <p className="mt-2 font-display text-lg font-bold">Rahul Kumar</p>
                <p className="text-xs text-white/60">Roll: SG-0042</p>
                <div className="mt-4 flex justify-between text-xs">
                  <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-emerald-200">
                    Active
                  </span>
                  <span className="text-white/70">Expires: Dec 2026</span>
                </div>
              </div>
            </div>
          </PhoneMockup>

          <PhoneMockup>
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Payments</p>
              <div className="mt-3 space-y-2">
                {[
                  { date: "01 Jun 2026", amt: "₹1000", plan: "Premium" },
                  { date: "01 May 2026", amt: "₹1000", plan: "Premium" },
                  { date: "01 Apr 2026", amt: "₹500", plan: "Basic" },
                ].map((p) => (
                  <div key={p.date} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-black">{p.amt}</span>
                      <span className="text-gray-400">{p.date}</span>
                    </div>
                    <p className="mt-1 text-[10px] text-gray-500">{p.plan} Monthly</p>
                  </div>
                ))}
              </div>
            </div>
          </PhoneMockup>

          <PhoneMockup>
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Workout</p>
              <div className="mt-3 space-y-2">
                {["Bench Press 4×8", "Squats 4×10", "Lat Pulldown 3×12"].map((w) => (
                  <div key={w} className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-xs">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-gray-700">{w}</span>
                  </div>
                ))}
              </div>
              <Link href="/access" className="mt-4 block text-center text-xs font-semibold text-[var(--sg-red)]">
                Open Member Portal →
              </Link>
            </div>
          </PhoneMockup>
        </div>
      </div>
    </SectionBackground>
  );
}
