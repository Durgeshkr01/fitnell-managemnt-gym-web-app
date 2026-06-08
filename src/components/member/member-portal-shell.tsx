"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import AuthGuard from "@/components/auth-guard";
import LogoutButton from "@/components/logout-button";
import SiteFooter from "@/components/site-footer";

type MemberPortalShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function MemberPortalShell({
  title,
  subtitle,
  children,
}: MemberPortalShellProps) {
  return (
    <AuthGuard role="member">
      <div className="app-bg min-h-screen text-slate-100">
        <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
          <div className="glass-panel rounded-2xl px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link
                  href="/member"
                  className="text-xs uppercase tracking-[0.3em] text-slate-400 transition hover:text-white"
                >
                  ← Member Portal
                </Link>
                <h1 className="font-display mt-2 text-2xl text-white">{title}</h1>
                {subtitle ? (
                  <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
                ) : null}
              </div>
              <LogoutButton />
            </div>
          </div>
          {children}
          <SiteFooter />
        </div>
      </div>
    </AuthGuard>
  );
}

export function useMemberSession() {
  const memberId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("memberId")
      : null;
  const memberName =
    typeof window !== "undefined"
      ? window.localStorage.getItem("memberName")
      : null;

  return { memberId, memberName };
}
