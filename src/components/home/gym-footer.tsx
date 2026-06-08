import Image from "next/image";
import Link from "next/link";
import { BG_IMAGES, GYM_ADDRESS, GYM_HOURS, GYM_PHONE, MAPS_LINK } from "@/lib/home-content";
import SectionBackground from "./section-background";

export default function GymFooter() {
  return (
    <SectionBackground image={BG_IMAGES.section1} variant="warm">
      <footer className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="sg-glass-panel grid gap-10 p-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="SG Fitness Evolution" width={32} height={32} />
                <div>
                  <p className="font-display font-bold text-white">SG FITNESS</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300">Evolution</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                Supaul&apos;s premium AC gym with personal training, diet guidance, and member app
                portal.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Links</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li><a href="#facilities" className="hover:text-white">Facilities</a></li>
                <li><a href="#gallery" className="hover:text-white">Gallery</a></li>
                <li><a href="#locations" className="hover:text-white">Locations</a></li>
                <li><a href="#trainers" className="hover:text-white">Trainers</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><Link href="/access" className="text-amber-300 hover:text-amber-200">Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Contact</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>{GYM_ADDRESS}</li>
                <li><a href={`tel:${GYM_PHONE}`} className="hover:text-white">{GYM_PHONE}</a></li>
                <li>{GYM_HOURS}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Get Started</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="#assessment" className="sg-btn-red text-xs">Join Now</Link>
                <a href={`tel:${GYM_PHONE}`} className="sg-btn-glass text-xs">Call</a>
                <a href="https://wa.me/918809551534" target="_blank" rel="noreferrer" className="sg-btn-glass text-xs">
                  WhatsApp
                </a>
                <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="sg-btn-glass text-xs">
                  Directions
                </a>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-white/50">
            © {new Date().getFullYear()} SG Fitness Evolution. All rights reserved.
          </p>
        </div>
      </footer>
    </SectionBackground>
  );
}
