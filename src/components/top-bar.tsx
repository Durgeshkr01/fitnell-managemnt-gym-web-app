"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import LogoutButton from "./logout-button";
import { adminNav, trainerNav } from "./navigation";

type TopBarProps = {
  role: "admin" | "trainer";
};

export default function TopBar({ role }: TopBarProps) {
  const navItems = role === "admin" ? adminNav : trainerNav;
  const heading = role === "admin" ? "Gym Management System" : "Trainer Workspace";
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const orderedNavItems =
    role === "admin"
      ? [
          ...navItems.filter((item) => item.href === "/admin"),
          ...navItems.filter((item) => item.href !== "/admin"),
        ]
      : navItems;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const mobileNavDrawer = isMobileNavOpen ? (
    <div className="fixed inset-0 z-[9998] lg:hidden">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsMobileNavOpen(false)}
      />
      <div className="glass-panel-strong absolute left-0 top-0 h-full w-72 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Navigation</p>
            <p className="text-xs text-slate-400">Quick access</p>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {orderedNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="px-6 pt-6">
      <div className="glass-panel panel-card rounded-2xl px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs uppercase tracking-[0.2em] text-slate-300 lg:hidden"
            >
              Menu
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
              <Image
                src="/logo.svg"
                alt="SG FITNESS EVOLUTION"
                width={28}
                height={28}
                className="h-full w-full object-contain p-1"
              />
            </div>
            <div>
              <p className="font-display text-xl text-white">
                SG FITNESS EVOLUTION
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {heading}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 md:inline">
              Status: --
            </span>
            <LogoutButton />
            {isMounted && mobileNavDrawer
              ? createPortal(mobileNavDrawer, document.body)
              : null}
          </div>
        </div>
      </div>

    </div>
  );
}
