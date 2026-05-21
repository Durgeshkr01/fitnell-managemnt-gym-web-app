"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import SectionHeader from "@/components/section-header";
import StatCard from "@/components/stat-card";
import { getMembers, type MemberRecord } from "@/lib/firebase/members";
import { autoCheckoutStale, getTodayAttendance } from "@/lib/firebase/attendance";
import { syncMemberNotifications } from "@/lib/firebase/notifications";

const statLabels = [
  "Active Members",
  "Expiring Soon",
  "Expired",
  "Attendance Today",
  "Dues",
] as const;

const statLinks: Record<(typeof statLabels)[number], string> = {
  "Active Members": "/trainer/members?filter=active",
  "Expiring Soon": "/trainer/members?filter=expiring",
  Expired: "/trainer/members?filter=expired",
  "Attendance Today": "/trainer/attendance",
  Dues: "/trainer/members?filter=dues",
};

export default function TrainerDashboard() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [attendanceToday, setAttendanceToday] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [trainerName, setTrainerName] = useState<string>("");
  const didSyncNotifications = useRef(false);

  useEffect(() => {
    let active = true;

    const loadMembers = async () => {
      try {
        await autoCheckoutStale();
        const [results, attendanceRows] = await Promise.all([
          getMembers(),
          getTodayAttendance(),
        ]);
        if (active) {
          setMembers(results);
          const today = new Date();
          const todayCount = attendanceRows.filter((record) => {
            if (!record.checkInAt) return false;
            const checkIn = new Date(record.checkInAt);
            return (
              checkIn.getFullYear() === today.getFullYear() &&
              checkIn.getMonth() === today.getMonth() &&
              checkIn.getDate() === today.getDate()
            );
          }).length;
          setAttendanceToday(todayCount);
        }
      } catch (loadError) {
        if (active) {
          setAttendanceToday(0);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMembers();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedName = window.localStorage.getItem("trainerName") ?? "";
    setTrainerName(storedName.trim());
  }, []);

  useEffect(() => {
    if (!loading && members.length > 0 && !didSyncNotifications.current) {
      didSyncNotifications.current = true;
      void syncMemberNotifications(members);
    }
  }, [loading, members]);

  const activeMembers = useMemo(
    () => members.filter((member) => member.status === "Active").length,
    [members]
  );
  const expiringMembers = useMemo(
    () => members.filter((member) => member.status === "Expiring Soon").length,
    [members]
  );
  const expiredMembers = useMemo(
    () => members.filter((member) => member.status === "Expired").length,
    [members]
  );
  const dueMembers = useMemo(
    () =>
      members.filter((member) => {
        const raw = String(member.dues ?? "").replace(/[^0-9.]/g, "");
        const amount = Number(raw);
        return !Number.isNaN(amount) && amount > 0;
      }).length,
    [members]
  );
  const statValues: Record<(typeof statLabels)[number], string> = {
    "Active Members": loading ? "--" : String(activeMembers),
    "Expiring Soon": loading ? "--" : String(expiringMembers),
    Expired: loading ? "--" : String(expiredMembers),
    "Attendance Today": loading
      ? "--"
      : String(attendanceToday ?? 0),
    Dues: loading ? "--" : String(dueMembers),
  };

  const dashboardStyle: CSSProperties = {
    "--trainer-accent": "#f59e0b",
    "--trainer-accent-2": "#22c55e",
  } as CSSProperties;

  return (
    <div className="space-y-6" style={dashboardStyle}>
      <SectionHeader
        title="Trainer Dashboard"
        subtitle="Daily attendance, plans, and member follow-ups."
      />

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(120deg,rgba(245,158,11,0.12),rgba(34,197,94,0.08),rgba(15,23,42,0.6))] p-6 shadow-2xl sm:p-8">
        <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.35),transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.35),transparent_60%)] blur-2xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">
              Session Focus
            </p>
            <h2 className="font-display mt-3 text-2xl text-white sm:text-3xl">
              {trainerName
                ? `Welcome back, ${trainerName}.`
                : "Welcome back, Trainer."}
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Quick snapshot for your shift. Track attendance, dues, and renewals at a glance.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/trainer/attendance"
                className="rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-xs text-amber-200"
              >
                ✅ Mark Attendance
              </Link>
              <Link
                href="/trainer/members"
                className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-200"
              >
                👥 View Members
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={statLinks["Active Members"]}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Active</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {statValues["Active Members"]}
              </p>
              <p className="mt-2 text-xs text-slate-400">Members on plan</p>
            </Link>
            <Link
              href={statLinks["Attendance Today"]}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Attendance</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {statValues["Attendance Today"]}
              </p>
              <p className="mt-2 text-xs text-slate-400">Check-ins today</p>
            </Link>
            <Link
              href={statLinks["Expiring Soon"]}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Expiring</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {statValues["Expiring Soon"]}
              </p>
              <p className="mt-2 text-xs text-slate-400">7-day window</p>
            </Link>
            <Link
              href={statLinks.Expired}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Expired</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {statValues.Expired}
              </p>
              <p className="mt-2 text-xs text-slate-400">Needs renewal</p>
            </Link>
            <Link
              href={statLinks.Dues}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Dues</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {statValues.Dues}
              </p>
              <p className="mt-2 text-xs text-slate-400">Pending members</p>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
