import SectionHeader from "@/components/section-header";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        subtitle="Admin access control and system preferences."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">Access Control</h3>
          <p className="text-sm text-slate-300">
            Manage admin login and trainer permissions.
          </p>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            {[
              "Fixed admin email",
              "Trainer code activation",
              "Role-based restrictions",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">System Preferences</h3>
          <p className="text-sm text-slate-300">
            Configure reminders, alerts, and UI preferences.
          </p>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            {[
              "Notification channels",
              "AI auto reminders",
              "Date picker defaults",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
