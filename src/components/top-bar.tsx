"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ActionButton from "./action-button";
import LogoutButton from "./logout-button";
import NotificationPanel from "./notification-panel";
import { adminNav, trainerNav } from "./navigation";
import { getUnreadNotificationsCount } from "@/lib/firebase/notifications";

type TopBarProps = {
  role: "admin" | "trainer";
};

export default function TopBar({ role }: TopBarProps) {
  const navItems = role === "admin" ? adminNav : trainerNav;
  const heading = role === "admin" ? "Gym Management System" : "Trainer Workspace";
  const [isMounted, setIsMounted] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const notificationsPanelRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    let isActive = true;

    const refreshUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationsCount();
        if (isActive) {
          setUnreadCount(count);
        }
      } catch (loadError) {
        if (isActive) {
          setUnreadCount(0);
        }
      }
    };

    void refreshUnreadCount();
    const intervalId = window.setInterval(refreshUnreadCount, 30000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const insideButton = notificationsRef.current?.contains(target) ?? false;
      const insidePanel = notificationsPanelRef.current?.contains(target) ?? false;
      if (!insideButton && !insidePanel) {
        setIsNotificationsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const notificationsPanel = isNotificationsOpen ? (
    <div
      ref={notificationsPanelRef}
      className="fixed right-6 top-24 z-[9999] w-[360px] max-w-[90vw]"
    >
      <NotificationPanel
        role={role}
        onUnreadCountChange={(count) => {
          setUnreadCount(count);
        }}
      />
    </div>
  ) : null;

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
            <div ref={notificationsRef} className="relative">
              <ActionButton
                actionName="Open notifications"
                onClick={(event) => {
                  event.preventDefault();
                  setIsNotificationsOpen((prev) => !prev);
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[10px] uppercase tracking-[0.2em] text-slate-300"
              >
                🔔
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 rounded-full border border-black/60 bg-rose-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </ActionButton>
            </div>
            {isMounted && notificationsPanel
              ? createPortal(notificationsPanel, document.body)
              : null}
            {isMounted && mobileNavDrawer
              ? createPortal(mobileNavDrawer, document.body)
              : null}
          </div>
        </div>
      </div>

    </div>
  );
}
