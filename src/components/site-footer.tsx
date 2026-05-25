import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="glass-panel animate-fade-up mt-10 rounded-3xl px-6 py-5">
      <div className="grid gap-4 md:grid-cols-[1.2fr_auto] md:items-center">
        <div className="flex items-center gap-4">
          <div className="animate-float-slow flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <Image
              src="/images/durgesh.jpg"
              alt="Durgesh"
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Created by
            </p>
            <p className="font-display text-xl text-white">DURGESH</p>
            <p className="animate-type-reveal text-xs text-slate-400">
              Frontend + UI engineering. Maine banaya hai; kisi ko banana ho to contact kare.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span className="animate-fade-in delay-100 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                Premium UI
              </span>
              <span className="animate-fade-in delay-200 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                Fast Support
              </span>
              <span className="animate-fade-in delay-300 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                Full Setup
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
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
            className="btn-shine rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
