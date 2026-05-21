import SectionHeader from "@/components/section-header";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analytics"
        subtitle="Charts, progress tracking, and monthly reports."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">Membership Trends</h3>
          <p className="text-sm text-slate-300">
            Active, expiring, and expired comparisons.
          </p>
          <div className="mt-6 h-40 rounded-2xl border border-dashed border-white/10" />
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">Revenue vs Attendance</h3>
          <p className="text-sm text-slate-300">
            Compare collections with attendance rate.
          </p>
          <div className="mt-6 h-40 rounded-2xl border border-dashed border-white/10" />
        </div>
      </div>
    </div>
  );
}
