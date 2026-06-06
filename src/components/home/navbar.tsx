"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Facilities", href: "#facilities" },
  { label: "Locations", href: "#locations" },
  { label: "Programs", href: "#workouts" },
  { label: "Trainers", href: "#trainers" },
  { label: "FAQ", href: "#faq" },
];

export default function HomeNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sg-nav">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="SG Fitness Evolution" width={36} height={36} className="h-9 w-9" />
          <div className="leading-tight">
            <span className="font-display text-sm font-bold text-white sm:text-base">SG FITNESS</span>
            <span className="block text-[10px] uppercase tracking-[0.25em] text-amber-300">Evolution</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="sg-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/access" className="sg-btn-glass text-xs sm:text-sm">
            Login
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="sg-btn-glass px-3 py-1.5 text-xs lg:hidden"
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/15 bg-white/10 px-4 py-4 backdrop-blur-xl lg:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-white/90"
            >
              {link.label}
            </a>
          ))}
          <Link href="/access" onClick={() => setOpen(false)} className="mt-2 block text-sm text-amber-300">
            Login
          </Link>
        </div>
      )}
    </header>
  );
}
