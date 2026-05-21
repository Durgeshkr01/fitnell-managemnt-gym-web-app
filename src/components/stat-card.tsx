type StatCardTone = "positive" | "negative" | "neutral";

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  tone?: StatCardTone;
  className?: string;
};

const toneStyles: Record<StatCardTone, string> = {
  positive: "text-emerald-300",
  negative: "text-rose-300",
  neutral: "text-slate-300",
};

export default function StatCard({
  label,
  value,
  delta,
  tone = "neutral",
  className,
}: StatCardProps) {
  return (
    <div
      className={["glass-panel panel-card rounded-2xl p-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between">
        <span className="font-display text-2xl text-white">{value}</span>
        {delta ? (
          <span className={`text-xs ${toneStyles[tone]}`}>{delta}</span>
        ) : null}
      </div>
    </div>
  );
}
