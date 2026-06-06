type SectionBackgroundProps = {
  image: string;
  variant?: "hero" | "warm" | "cool" | "light";
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export default function SectionBackground({
  image,
  variant = "warm",
  children,
  className = "",
  id,
}: SectionBackgroundProps) {
  return (
    <section id={id} className={`sg-bg-section sg-bg-${variant} ${className}`}>
      <div className="sg-bg-image" style={{ backgroundImage: `url('${image}')` }} />
      <div className="sg-bg-overlay" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
