"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/auth-guard";
import AiChatbot from "@/components/ai-chatbot";
import LogoutButton from "@/components/logout-button";
import MemberCard from "@/components/member-card";
import SectionHeader from "@/components/section-header";
import SiteFooter from "@/components/site-footer";
import { formatDateTimeDisplay } from "@/lib/date-utils";
import { getAttendanceByMember, type AttendanceRecord } from "@/lib/firebase/attendance";
import {
  getMemberById,
  getMembersByPhone,
  type MemberRecord,
} from "@/lib/firebase/members";
import { getPaymentsByMember, type PaymentRecord } from "@/lib/firebase/payments";

type AttendanceFilter = "week" | "month" | "all";

export default function MemberPortalPage() {
  const [member, setMember] = useState<MemberRecord | null>(null);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadMember = async () => {
      try {
        const memberId = window.localStorage.getItem("memberId");
        const memberPhone = window.localStorage.getItem("memberPhone");
        if (!memberId && !memberPhone) {
          throw new Error("Member session not found.");
        }

        if (memberId) {
          const [memberData, paymentData, attendanceData] = await Promise.all([
            getMemberById(memberId),
            getPaymentsByMember(memberId),
            getAttendanceByMember(memberId),
          ]);

          if (!memberData) {
            throw new Error("Member profile not found.");
          }

          if (isActive) {
            setMember(memberData);
            setMembers([memberData]);
            setPayments(paymentData);
            setAttendance(attendanceData);
          }
          return;
        }

        const matchedMembers = await getMembersByPhone(memberPhone ?? "");
        if (matchedMembers.length === 0) {
          throw new Error("Member profile not found.");
        }

        const [paymentsList, attendanceList] = await Promise.all([
          Promise.all(matchedMembers.map((record) => getPaymentsByMember(record.id))),
          Promise.all(matchedMembers.map((record) => getAttendanceByMember(record.id))),
        ]);
        const mergedPayments = paymentsList.flat();
        const mergedAttendance = attendanceList.flat();

        if (isActive) {
          setMembers(matchedMembers);
          setMember(matchedMembers[0] ?? null);
          setPayments(mergedPayments);
          setAttendance(mergedAttendance);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load member portal."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadMember();

    return () => {
      isActive = false;
    };
  }, []);

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      const aTime = new Date(a.paidOn).getTime();
      const bTime = new Date(b.paidOn).getTime();
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
      return bTime - aTime;
    });
  }, [payments]);

  const attendanceRangeStart = useMemo(() => {
    if (attendanceFilter === "all") {
      return null;
    }
    const days = attendanceFilter === "month" ? 30 : 7;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    return start.getTime();
  }, [attendanceFilter]);

  const filteredAttendance = useMemo(() => {
    if (!attendanceRangeStart) {
      return attendance;
    }
    return attendance.filter((record) => {
      if (!record.checkInAt) return false;
      const checkInTime = new Date(record.checkInAt).getTime();
      return checkInTime >= attendanceRangeStart;
    });
  }, [attendance, attendanceRangeStart]);

  const attendanceByMember = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {};
    filteredAttendance.forEach((record) => {
      if (!record.memberId) return;
      if (!map[record.memberId]) {
        map[record.memberId] = [];
      }
      map[record.memberId].push(record);
    });
    return map;
  }, [filteredAttendance]);

  const getAttendanceDaysCount = (records: AttendanceRecord[]) => {
    const daySet = new Set<string>();
    records.forEach((record) => {
      if (!record.checkInAt) return;
      const date = new Date(record.checkInAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;
      daySet.add(key);
    });
    return daySet.size;
  };

  return (
    <AuthGuard role="member">
      <div className="app-bg min-h-screen text-slate-100">
        <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
          <div className="glass-panel rounded-2xl px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Member Portal
                </p>
                <h1 className="font-display mt-2 text-2xl text-white">
                  {member?.name ?? "Your Membership"}
                </h1>
              </div>
              <LogoutButton />
            </div>
          </div>

          <SectionHeader
            title="Membership Card"
            subtitle="Read-only view of your details."
          />

          {error ? (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="glass-panel rounded-2xl p-6 text-sm text-slate-300">
              Loading member details...
            </div>
          ) : members.length > 1 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {members.map((entry) => (
                <MemberCard key={entry.id} member={entry} readOnly />
              ))}
            </div>
          ) : member ? (
            <MemberCard member={member} readOnly />
          ) : null}

          <SectionHeader
            title="Fitness Tools"
            subtitle="BMI, diet aur exercise — sab ek jagah."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/member/bmi-calculator"
              className="glass-panel group rounded-2xl border border-white/10 p-6 transition hover:border-blue-400/30 hover:bg-white/5"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Tool 01
              </p>
              <h3 className="font-display mt-2 text-xl text-white group-hover:text-blue-200">
                BMI Calculator
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Apna BMI, daily calories aur protein target nikalein.
              </p>
            </Link>
            <Link
              href="/member/diet-tracker"
              className="glass-panel group rounded-2xl border border-white/10 p-6 transition hover:border-emerald-400/30 hover:bg-white/5"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Tool 02
              </p>
              <h3 className="font-display mt-2 text-xl text-white group-hover:text-emerald-200">
                Diet Tracker
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Khana ka naam likhein — calorie aur protein auto track ho.
              </p>
            </Link>
            <Link
              href="/member/exercises"
              className="glass-panel group rounded-2xl border border-white/10 p-6 transition hover:border-violet-400/30 hover:bg-white/5"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Tool 03
              </p>
              <h3 className="font-display mt-2 text-xl text-white group-hover:text-violet-200">
                Exercise Lookup
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Exercise ka naam likhein — GIF aur form guide dekhein.
              </p>
            </Link>
          </div>

          <SectionHeader
            title="Payment History"
            subtitle="Your latest renewals and dues payments."
          />

          <div className="glass-panel rounded-2xl p-6">
            {loading ? (
              <p className="text-sm text-slate-300">Loading payments...</p>
            ) : sortedPayments.length === 0 ? (
              <p className="text-sm text-slate-300">No payments recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-white">
                        {payment.type} - ₹{payment.amount}
                      </p>
                      <p className="text-xs text-slate-400">
                        {payment.memberName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white">
                        {formatDateTimeDisplay(payment.paidOn)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Roll {payment.rollNumber ?? "--"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SectionHeader
            title="Attendance History"
            subtitle="Your check-ins for this week, month, or all time."
          />

          <div className="glass-panel rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {[
                  { label: "This Week", value: "week" },
                  { label: "This Month", value: "month" },
                  { label: "All", value: "all" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setAttendanceFilter(item.value as AttendanceFilter)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      attendanceFilter === item.value
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="text-xs text-slate-400">
                Days in gym: {getAttendanceDaysCount(filteredAttendance)}
              </div>
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-slate-300">Loading attendance...</p>
            ) : filteredAttendance.length === 0 ? (
              <p className="mt-4 text-sm text-slate-300">No attendance records yet.</p>
            ) : members.length > 1 ? (
              <div className="mt-4 space-y-4">
                {members.map((entry) => {
                  const records = attendanceByMember[entry.id] ?? [];
                  if (records.length === 0) {
                    return null;
                  }
                  return (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-white">{entry.name}</p>
                        <p className="text-xs text-slate-400">
                          Days in gym: {getAttendanceDaysCount(records)}
                        </p>
                      </div>
                      <div className="mt-3 space-y-2">
                        {records.map((record) => (
                          <div
                            key={record.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs"
                          >
                            <div>
                              <p className="text-slate-200">Check-in</p>
                              <p className="text-slate-400">
                                {formatDateTimeDisplay(record.checkInAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-200">Check-out</p>
                              <p className="text-slate-400">
                                {record.checkOutAt
                                  ? formatDateTimeDisplay(record.checkOutAt)
                                  : "--"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {filteredAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs"
                  >
                    <div>
                      <p className="text-slate-200">Check-in</p>
                      <p className="text-slate-400">
                        {formatDateTimeDisplay(record.checkInAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-200">Check-out</p>
                      <p className="text-slate-400">
                        {record.checkOutAt
                          ? formatDateTimeDisplay(record.checkOutAt)
                          : "--"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SiteFooter />
        </div>
        <AiChatbot role="member" />
      </div>
    </AuthGuard>
  );
}
