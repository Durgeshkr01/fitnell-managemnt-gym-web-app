"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AddMemberModal from "@/components/add-member-modal";
import Link from "next/link";
import SectionHeader from "@/components/section-header";
import StatCard from "@/components/stat-card";
import { getPayments, type PaymentRecord } from "@/lib/firebase/payments";
import { getMembers, type MemberRecord } from "@/lib/firebase/members";
import { syncMemberNotifications } from "@/lib/firebase/notifications";

const statLabels = [
  "Total Members",
  "Today Revenue",
  "Expiring Soon",
  "Expired",
  "Active",
  "Dues Pending",
  "New Admissions ✅",
] as const;

const statLinks: Record<(typeof statLabels)[number], string> = {
  "Total Members": "/admin/members?filter=all",
  "Today Revenue": "/admin/payments?scope=today",
  "Expiring Soon": "/admin/members?filter=expiring",
  Expired: "/admin/members?filter=expired",
  Active: "/admin/members?filter=active",
  "Dues Pending": "/admin/members?filter=dues",
  "New Admissions ✅": "/admin/members?filter=new",
};

export default function AdminDashboard() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const didSyncNotifications = useRef(false);

  useEffect(() => {
    let active = true;

    const loadMembers = async () => {
      try {
        const results = await getMembers();
        if (active) {
          setMembers(results);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load members.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const loadPayments = async () => {
      try {
        const results = await getPayments();
        if (active) {
          setPayments(results);
        }
      } catch (loadError) {
        if (active) {
          setPaymentsError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load payments."
          );
        }
      } finally {
        if (active) {
          setPaymentsLoading(false);
        }
      }
    };

    loadMembers();
    loadPayments();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && members.length > 0 && !didSyncNotifications.current) {
      didSyncNotifications.current = true;
      void syncMemberNotifications(members);
    }
  }, [loading, members]);

  const totalMembers = members.length;
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
  const duesPendingMembers = useMemo(() => {
    return members.filter((member) => {
      const raw = String(member.dues ?? "").replace(/[^0-9.]/g, "");
      const amount = Number(raw);
      return !Number.isNaN(amount) && amount > 0;
    }).length;
  }, [members]);
  const newAdmissions = useMemo(
    () => members.filter((member) => member.isNewAdmission).length,
    [members]
  );
  const totalDues = useMemo(() => {
    return members.reduce((sum, member) => {
      const raw = String(member.dues ?? "").replace(/[^0-9.]/g, "");
      const amount = Number(raw);
      return Number.isNaN(amount) ? sum : sum + amount;
    }, 0);
  }, [members]);
  const todayRevenue = useMemo(() => {
    const today = new Date();
    return payments.reduce((sum, payment) => {
      const paidOn = new Date(payment.paidOn);
      if (Number.isNaN(paidOn.getTime())) {
        return sum;
      }
      const sameDay =
        paidOn.getDate() === today.getDate() &&
        paidOn.getMonth() === today.getMonth() &&
        paidOn.getFullYear() === today.getFullYear();
      return sameDay ? sum + payment.amount : sum;
    }, 0);
  }, [payments]);
  const maleCount = useMemo(
    () => members.filter((member) => member.gender === "Male").length,
    [members]
  );
  const femaleCount = useMemo(
    () => members.filter((member) => member.gender === "Female").length,
    [members]
  );
  const genderSummary = loading
    ? "--"
    : `M ${maleCount} / F ${femaleCount}`;

  const genderTotal = maleCount + femaleCount;
  const maleRatio = genderTotal > 0 ? maleCount / genderTotal : 0;
  const femaleRatio = genderTotal > 0 ? femaleCount / genderTotal : 0;
  const maleDash = `${maleRatio * 100} ${100 - maleRatio * 100}`;
  const femaleDash = `${femaleRatio * 100} ${100 - femaleRatio * 100}`;

  const revenueSeries = useMemo(() => {
    const pad = (value: number) => String(value).padStart(2, "0");
    const toLocalKey = (date: Date) =>
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const today = new Date();
    const keys = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return toLocalKey(date);
    });

    const totals = keys.map((key) => {
      return payments.reduce((sum, payment) => {
        const paidOn = new Date(payment.paidOn);
        if (Number.isNaN(paidOn.getTime())) {
          return sum;
        }
        const paidKey = toLocalKey(paidOn);
        return paidKey === key ? sum + payment.amount : sum;
      }, 0);
    });

    return { keys, totals };
  }, [payments]);

  const revenueMax = Math.max(...revenueSeries.totals, 0);

  const statValues: Record<(typeof statLabels)[number], string> = {
    "Total Members": loading ? "--" : String(totalMembers),
    "Today Revenue": paymentsLoading ? "--" : todayRevenue ? `₹${todayRevenue}` : "--",
    "Expiring Soon": loading ? "--" : String(expiringMembers),
    Expired: loading ? "--" : String(expiredMembers),
    Active: loading ? "--" : String(activeMembers),
    "Dues Pending": loading ? "--" : String(duesPendingMembers),
    "New Admissions ✅": loading ? "--" : String(newAdmissions),
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(120deg,rgba(59,130,246,0.18),rgba(139,92,246,0.12),rgba(15,23,42,0.7))] p-6 shadow-2xl sm:p-8 animate-fade-in">
        <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.35),transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25),transparent_60%)] blur-2xl" />
        <div className="relative space-y-5">
          <SectionHeader
            title="Today's Summary"
            subtitle="Gym Management System"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <AddMemberModal />
                <Link
                  href="/admin/trainers"
                  className="btn-base px-4 py-2 text-sm text-white"
                >
                  Assign Trainer
                </Link>
              </div>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statLabels.map((label, index) => (
              <Link
                key={label}
                href={statLinks[label]}
                className={`group block focus:outline-none animate-fade-up delay-${Math.min(
                  80 * (index + 1),
                  320
                )}`}
              >
                <StatCard
                  label={label}
                  value={statValues[label]}
                  delta={label === "Total Members" ? genderSummary : undefined}
                  className="cursor-pointer transition group-hover:-translate-y-0.5 group-hover:border-white/30 group-hover:bg-white/10"
                />
              </Link>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-panel panel-card rounded-2xl p-5 animate-fade-up delay-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Male vs Female
                  </p>
                  <p className="mt-2 text-sm text-slate-300">Member split</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    M {maleCount}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    F {femaleCount}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-center">
                <svg width="140" height="140" viewBox="0 0 42 42">
                  <circle
                    cx="21"
                    cy="21"
                    r="15.5"
                    fill="none"
                    stroke="rgba(148,163,184,0.25)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.5"
                    fill="none"
                    stroke="rgb(56 189 248)"
                    strokeWidth="6"
                    pathLength={100}
                    strokeDasharray={maleDash}
                    strokeLinecap="round"
                    transform="rotate(-90 21 21)"
                    className="animate-pie-sweep"
                    style={{
                      "--pie-dasharray": maleDash,
                    } as React.CSSProperties}
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.5"
                    fill="none"
                    stroke="rgb(251 113 133)"
                    strokeWidth="6"
                    pathLength={100}
                    strokeDasharray={femaleDash}
                    strokeDashoffset={-(maleRatio * 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 21 21)"
                    className="animate-pie-sweep delay-100"
                    style={{
                      "--pie-dasharray": femaleDash,
                    } as React.CSSProperties}
                  />
                </svg>
              </div>
            </div>

            <div className="glass-panel panel-card rounded-2xl p-5 animate-fade-up delay-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Today Revenue
                  </p>
                  <p className="mt-2 text-sm text-slate-300">Last 7 days trend</p>
                </div>
                <p className="text-lg text-white">
                  {paymentsLoading ? "--" : todayRevenue ? `₹${todayRevenue}` : "--"}
                </p>
              </div>
              <div className="mt-6 animate-fade-up delay-100">
                <svg width="100%" height="80" viewBox="0 0 140 80" preserveAspectRatio="none">
                  {revenueSeries.totals.map((value, index) => {
                    const barWidth = 14;
                    const gap = 6;
                    const x = index * (barWidth + gap) + 4;
                    const height = revenueMax > 0
                      ? Math.max(4, (value / revenueMax) * 56)
                      : 4;
                    const y = 70 - height;
                    return (
                      <rect
                        key={`${revenueSeries.keys[index]}-${value}`}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        rx={4}
                        fill="rgba(59,130,246,0.8)"
                        className="animate-bar-grow"
                        style={{
                          animationDelay: `${index * 90}ms`,
                        }}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
