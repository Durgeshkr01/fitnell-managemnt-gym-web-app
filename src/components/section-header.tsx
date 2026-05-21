import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export default function SectionHeader({
  title,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <div className="section-header flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl text-white">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
