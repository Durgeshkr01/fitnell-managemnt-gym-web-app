import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="glass-panel mt-10 rounded-3xl px-6 py-5">
      <div className="mb-5 h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <Image
              src="/images/durgesh.jpg"
              alt="Durgesh"
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm text-white">Made by DURGESH</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                Software Engineer
              </span>
              <span className="text-xs text-slate-400">
                Premium builds + fast support
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300">
          <p>Maintenance/Support: Quick help & fixes.</p>
          <p>New app/website: Premium UI + full setup.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <a
            href="tel:9939128165"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200"
          >
            9939128165
          </a>
          <a
            href="https://www.instagram.com/dp.visualdiary?igsh=bHhwamptNHpqOW9i"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
