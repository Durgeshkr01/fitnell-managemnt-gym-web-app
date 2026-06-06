type SectionLabelProps = {
  children: React.ReactNode;
  light?: boolean;
};

export default function SectionLabel({ children, light }: SectionLabelProps) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.35em] ${
        light ? "text-amber-300/70" : "text-red-500"
      }`}
    >
      {children}
    </p>
  );
}
