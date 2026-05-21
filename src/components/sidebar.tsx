"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav, trainerNav } from "./navigation";

type SidebarProps = {
  role: "admin" | "trainer";
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin" || href === "/trainer") {
    return pathname === href;
  }
  return pathname.startsWith(href);
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNav : trainerNav;
  const badgeLabel = role === "admin" ? "Admin Panel" : "Trainer Panel";
  const orderedNavItems =
    role === "admin"
      ? [
          ...navItems.filter((item) => item.href === "/admin"),
          ...navItems.filter((item) => item.href !== "/admin"),
        ]
      : navItems;

  return (
    <aside className="glass-panel-strong panel-card sticky top-0 hidden h-screen w-72 flex-col gap-6 px-5 pb-6 pt-7 lg:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
          <Image
            src="/logo.svg"
            alt="SG FITNESS EVOLUTION"
            width={32}
            height={32}
            className="h-full w-full object-contain p-1"
          />
        </div>
        <div>
          <p className="font-display text-lg text-white">
            SG FITNESS EVOLUTION
          </p>
          <p className="text-xs text-slate-400">Gym Management System</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-300">
        {badgeLabel}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {orderedNavItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`flex h-8 min-w-8 items-center justify-center rounded-xl border text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                  isActive
                    ? "border-white/30 bg-white/15 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 group-hover:border-white/30"
                }`}
              >
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
