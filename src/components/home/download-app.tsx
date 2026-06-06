import Link from "next/link";
import { APP_URL, BG_IMAGES } from "@/lib/home-content";
import SectionBackground from "./section-background";
import SectionLabel from "./section-label";

const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(APP_URL)}`;

export default function DownloadApp() {
  return (
    <SectionBackground image={BG_IMAGES.section1} variant="warm">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="sg-glass-panel grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <SectionLabel light>/ Download</SectionLabel>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Get the SG Fitness App
            </h2>
            <p className="mt-4 text-white/85">
              Scan the QR code or visit our app to access your membership, payments, workout plans,
              and trainer support.
            </p>
            <p className="mt-2 break-all text-sm text-amber-200/80">{APP_URL}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href={APP_URL} target="_blank" rel="noreferrer" className="sg-btn-android">
                <span className="text-2xl">▶</span>
                <span>
                  <span className="block text-[10px] uppercase">Open</span>
                  <span className="font-semibold">SG Fitness App</span>
                </span>
              </a>
              <Link href="/access" className="sg-btn-glass">
                Login
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center lg:justify-end">
            <div className="rounded-2xl bg-white/95 p-4 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt="Scan to open SG Fitness app"
                width={160}
                height={160}
                className="rounded-lg"
              />
              <p className="mt-2 text-center text-xs text-gray-600">Scan to open app</p>
            </div>
            <div className="sg-phone sg-phone-sm">
              <div className="sg-phone-notch" />
              <div className="sg-phone-screen flex flex-col items-center justify-center p-4 text-center">
                <img src="/logo.svg" alt="" width={48} height={48} className="mb-3" />
                <p className="font-display text-sm font-bold text-black">SG FITNESS</p>
                <p className="text-[10px] text-gray-400">EVOLUTION</p>
                <p className="mt-4 rounded-full bg-[var(--sg-red)] px-4 py-1 text-[10px] font-semibold text-white">
                  Scan & Open
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionBackground>
  );
}
