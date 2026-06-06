import { BG_IMAGES, comparisonRows } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

export default function WhyChoose() {
  return (
    <SectionBackground image={BG_IMAGES.section1} variant="warm">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <SectionLabel light>/ Why Us</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Why Choose SG Fitness Evolution
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            See how we compare to regular gyms in Supaul.
          </p>
        </div>

        <div className="sg-glass-panel mt-12 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-6 py-4 text-left font-medium text-white/70">Feature</th>
                  <th className="px-6 py-4 text-center font-display font-bold text-amber-300">
                    SG Fitness
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-white/70">Regular Gym</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-white/10">
                    <td className="px-6 py-4 text-white/90">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {row.sg ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/25 text-emerald-300">
                          ✓
                        </span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.regular ? (
                        <span className="text-white/70">✓</span>
                      ) : (
                        <span className="text-white/30">✗</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { stat: "4.9+", label: "Google Rating" },
            { stat: "500+", label: "Happy Members" },
            { stat: "100%", label: "AC Facility" },
          ].map((s) => (
            <div key={s.label} className="sg-glass-stat text-center">
              <p className="font-display text-3xl font-bold text-amber-300">{s.stat}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionBackground>
  );
}
