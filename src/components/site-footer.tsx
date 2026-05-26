import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="mt-10 rounded-[28px] border border-amber-300/30 bg-[linear-gradient(135deg,rgba(245,158,11,0.2),rgba(2,6,23,0.9))] px-6 py-5 shadow-[0_0_45px_rgba(245,158,11,0.18)]">
      <div className="relative grid gap-5 overflow-hidden rounded-[24px] border border-amber-300/30 bg-[linear-gradient(135deg,rgba(2,6,23,0.9),rgba(245,158,11,0.16))] p-4 md:grid-cols-[1.2fr_auto] md:items-center">
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.45),transparent_60%)] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-0 h-36 w-36 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.35),transparent_60%)] blur-2xl" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[18px] border border-white/15 bg-white/5 shadow-[0_0_24px_rgba(59,130,246,0.25)]">
            <Image
              src="/images/durgesh.jpg"
              alt="Durgesh"
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.45em] text-slate-400">
                Created by
              </span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">
                Live
              </span>
            </div>
            <p className="font-display text-xl text-white">DURGESH</p>
            <p className="text-xs text-slate-400">
              Frontend + UI engineering. Maine banaya hai; kisi ko banana ho to contact kare.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                Premium UI
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                Fast Support
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                Full Setup
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-start gap-2 text-xs">
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
            Click to view
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
          <a
            href="https://durgesh-portfolio-five.vercel.app/"
            target="_blank"
            rel="noreferrer"
              className="btn-shine rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.25)]"
          >
            View Portfolio ↗
          </a>
          <a
            href="tel:9939128165"
            className="btn-shine rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200"
          >
            9939128165
          </a>
          <a
            href="https://www.instagram.com/dp.visualdiary?igsh=bHhwamptNHpqOW9i"
            target="_blank"
            rel="noreferrer"
              className="btn-shine rounded-full border border-amber-300/40 bg-amber-500/10 px-3 py-1 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.25)]"
          >
            📸 Follow on Instagram
          </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
