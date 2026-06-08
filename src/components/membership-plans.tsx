const plans = [
  { name: "Basic Monthly", price: "₹500", perks: ["Unlimited gym access", "Locker"], featured: false },
  {
    name: "Premium Monthly",
    price: "₹1000",
    perks: ["Unlimited access", "Trainer guidance", "Trade meal included"],
    featured: true,
  },
];

export default function MembershipPlans() {
  return (
    <section id="plans" className="bg-[#0a0a0a] py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">/ Membership</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Choose Your Plan</h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 ${
                p.featured
                  ? "border-2 border-[var(--wtf-red)] bg-[var(--wtf-red)]/5"
                  : "border border-white/10 bg-white/5"
              }`}
            >
              {p.featured && (
                <span className="mb-4 inline-block rounded-full bg-[var(--wtf-red)] px-3 py-0.5 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-white">{p.name}</h3>
              <p className="mt-2 font-display text-4xl font-bold text-[var(--wtf-gold)]">{p.price}</p>
              <p className="text-sm text-white/40">per month</p>
              <ul className="mt-6 space-y-2 text-sm text-white/70">
                {p.perks.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="text-[var(--wtf-red)]">✓</span> {t}
                  </li>
                ))}
              </ul>
              <a href="#assessment" className={`mt-8 inline-flex w-full justify-center ${p.featured ? "wtf-btn-red" : "wtf-btn-outline"}`}>
                Join Now
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
