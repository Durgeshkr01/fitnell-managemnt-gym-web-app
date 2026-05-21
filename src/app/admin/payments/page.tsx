"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ActionButton from "@/components/action-button";
import SectionHeader from "@/components/section-header";
import { formatDateDisplay, formatDateTimeDisplay } from "@/lib/date-utils";
import { getMembers, type MemberRecord } from "@/lib/firebase/members";
import { deletePayment, getPayments, type PaymentRecord } from "@/lib/firebase/payments";

type DateFilter = "all" | "today" | "7d" | "30d" | "custom";
const PAGE_SIZE = 10;

function AdminPaymentsContent() {
  const LOAD_TIMEOUT_MS = 8000;
  const searchParams = useSearchParams();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const isMounted = useRef(true);

  const withTimeout = async <T,>(promise: Promise<T>, label: string) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} load timed out.`));
      }, LOAD_TIMEOUT_MS);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  const loadMembers = async () => {
    try {
      const results = await withTimeout(getMembers(), "Members");
      if (isMounted.current) {
        setMembers(results);
      }
    } catch (loadError) {
      if (isMounted.current) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load payments.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const loadPayments = async () => {
    try {
      const results = await withTimeout(getPayments(), "Payments");
      if (isMounted.current) {
        setPayments(results);
      }
    } catch (loadError) {
      if (isMounted.current) {
        setPaymentsError(
          loadError instanceof Error ? loadError.message : "Failed to load history."
        );
      }
    } finally {
      if (isMounted.current) {
        setPaymentsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    loadMembers();
    loadPayments();

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (searchParams.get("scope") === "today") {
      setDateFilter("today");
    }
  }, [searchParams]);

  const resolveIsoDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString().slice(0, 10);
  };

  const dateFilterLabel = () => {
    if (dateFilter === "today") return "Today";
    if (dateFilter === "7d") return "Last 7 Days";
    if (dateFilter === "30d") return "Last 30 Days";
    if (dateFilter === "custom") {
      if (customFromDate && customToDate) {
        return `${formatDateDisplay(customFromDate)} - ${formatDateDisplay(customToDate)}`;
      }
      if (customFromDate) {
        return `From ${formatDateDisplay(customFromDate)}`;
      }
      if (customToDate) {
        return `Till ${formatDateDisplay(customToDate)}`;
      }
      return "Pick a range";
    }
    return "All";
  };

  const filteredPayments = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const startForDays = (days: number) => {
      const start = new Date();
      start.setDate(start.getDate() - (days - 1));
      return start.toISOString().slice(0, 10);
    };

    return payments.filter((payment) => {
      const paidIso = resolveIsoDate(payment.paidOn);
      if (!paidIso) return false;

      if (dateFilter === "today") {
        return paidIso === todayIso;
      }
      if (dateFilter === "7d") {
        return paidIso >= startForDays(7) && paidIso <= todayIso;
      }
      if (dateFilter === "30d") {
        return paidIso >= startForDays(30) && paidIso <= todayIso;
      }
      if (dateFilter === "custom") {
        if (customFromDate && customToDate) {
          return paidIso >= customFromDate && paidIso <= customToDate;
        }
        if (customFromDate) {
          return paidIso >= customFromDate;
        }
        if (customToDate) {
          return paidIso <= customToDate;
        }
        return false;
      }
      return true;
    });
  }, [payments, dateFilter, customFromDate, customToDate]);

  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      const aTime = new Date(a.paidOn).getTime();
      const bTime = new Date(b.paidOn).getTime();
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
      return bTime - aTime;
    });
  }, [filteredPayments]);

  const visiblePayments = useMemo(
    () => sortedPayments.slice(0, visibleCount),
    [sortedPayments, visibleCount]
  );

  const groupedPayments = useMemo(() => {
    const groups: Record<string, PaymentRecord[]> = {};
    const order: string[] = [];

    visiblePayments.forEach((payment) => {
      const paidIso = resolveIsoDate(payment.paidOn);
      if (!paidIso) return;
      if (!groups[paidIso]) {
        groups[paidIso] = [];
        order.push(paidIso);
      }
      groups[paidIso].push(payment);
    });

    return order.map((date) => ({ date, items: groups[date] }));
  }, [visiblePayments]);

  const canLoadMore = visibleCount < sortedPayments.length;

  const handleDelete = async (payment: PaymentRecord) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Delete payment for ${payment.memberName}? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(payment.id);
    setPaymentsError(null);

    try {
      await deletePayment(payment.id);
      setPayments((prev) => prev.filter((item) => item.id !== payment.id));
    } catch (deleteError) {
      setPaymentsError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete payment."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Payment History"
        subtitle="Renewals, dues, and transaction records."
        action={
          <ActionButton
            actionName="Payments: Refresh"
            onClick={(event) => {
              event.preventDefault();
              setError(null);
              setPaymentsError(null);
              setLoading(true);
              setPaymentsLoading(true);
              loadMembers();
              loadPayments();
            }}
            className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300"
          >
            Refresh
          </ActionButton>
        }
      />

      {error || paymentsError ? (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error || paymentsError}
        </div>
      ) : null}

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg text-white">Transactions</h3>
            <p className="text-sm text-slate-300">
              Latest renewals and payment updates.
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-3 text-sm">
          {paymentsLoading ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Loading payments...
            </div>
          ) : paymentsError ? (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
              {paymentsError}
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              No transactions yet.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "All", value: "all" },
                  { label: "Today", value: "today" },
                  { label: "7 Days", value: "7d" },
                  { label: "30 Days", value: "30d" },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => {
                      setDateFilter(chip.value as DateFilter);
                      if (chip.value !== "custom") {
                        setCustomFromDate("");
                        setCustomToDate("");
                      }
                      setVisibleCount(PAGE_SIZE);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      dateFilter === chip.value
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-slate-300"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilter("custom");
                      setVisibleCount(PAGE_SIZE);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      dateFilter === "custom"
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-slate-300"
                    }`}
                  >
                    Date
                  </button>
                  {dateFilter === "custom" ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="date"
                        value={customFromDate}
                        onChange={(event) => {
                          setCustomFromDate(event.target.value);
                          setVisibleCount(PAGE_SIZE);
                        }}
                        className="input-base h-8 w-[150px] rounded-full px-3 text-xs"
                      />
                      <span className="text-xs text-slate-400">to</span>
                      <input
                        type="date"
                        value={customToDate}
                        onChange={(event) => {
                          setCustomToDate(event.target.value);
                          setVisibleCount(PAGE_SIZE);
                        }}
                        className="input-base h-8 w-[150px] rounded-full px-3 text-xs"
                      />
                    </div>
                  ) : null}
                </div>
                <span className="text-xs text-slate-400">
                  Showing: {dateFilterLabel()}
                </span>
              </div>

              {sortedPayments.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  No payments for this filter.
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedPayments.map((group) => (
                    <div key={group.date} className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {formatDateDisplay(group.date)}
                      </div>
                      <div className="grid grid-cols-5 text-xs uppercase tracking-[0.3em] text-slate-400">
                        <span>Member</span>
                        <span>Type</span>
                        <span>Amount</span>
                        <span>Paid On</span>
                        <span className="text-right">Action</span>
                      </div>
                      {group.items.map((row) => (
                        <div
                          key={row.id}
                          className="grid grid-cols-5 items-center rounded-xl border border-white/10 bg-white/5 p-3"
                        >
                          <span className="text-slate-300">
                            {row.memberName}
                          </span>
                          <span className="text-slate-300">{row.type}</span>
                          <span className="text-slate-300">₹{row.amount}</span>
                          <span className="text-slate-300">
                            {formatDateTimeDisplay(row.paidOn)}
                          </span>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleDelete(row)}
                              disabled={deletingId === row.id}
                              className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingId === row.id ? "Deleting" : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {canLoadMore ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
                >
                  Load more
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="glass-panel mx-auto mt-8 max-w-3xl rounded-2xl p-6 text-sm text-slate-300">
          Loading payments...
        </div>
      }
    >
      <AdminPaymentsContent />
    </Suspense>
  );
}
