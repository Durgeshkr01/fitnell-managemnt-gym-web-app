"use client";

import { useEffect, useMemo, useState } from "react";
import SectionHeader from "@/components/section-header";
import { formatDateDisplay, formatDateTimeDisplay } from "@/lib/date-utils";
import {
  autoCheckoutStale,
  deleteAttendanceRecords,
  getActiveAttendance,
  getTodayAttendance,
  type AttendanceRecord,
} from "@/lib/firebase/attendance";

type DateFilter = "all" | "today" | "7d" | "30d" | "custom";
const PAGE_SIZE = 10;

export default function AdminAttendancePage() {
  const [active, setActive] = useState<AttendanceRecord[]>([]);
  const [today, setToday] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadAttendance = async () => {
      try {
        await autoCheckoutStale();
        const [activeRows, todayRows] = await Promise.all([
          getActiveAttendance(),
          getTodayAttendance(),
        ]);
        if (mounted) {
          setActive(activeRows);
          setToday(todayRows);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load attendance.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAttendance();
    return () => {
      mounted = false;
    };
  }, []);

  const activeCount = active.length;
  const todayCount = today.length;
  const checkedOutCount = useMemo(
    () => today.filter((record) => record.status === "out").length,
    [today]
  );

  const resolveIsoDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString().slice(0, 10);
  };

  const filteredHistory = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const startForDays = (days: number) => {
      const start = new Date();
      start.setDate(start.getDate() - (days - 1));
      return start.toISOString().slice(0, 10);
    };

    return today.filter((record) => {
      const baseTime = record.checkInAt ?? record.checkOutAt;
      const iso = resolveIsoDate(baseTime);
      if (!iso) return false;

      if (dateFilter === "today") {
        return iso === todayIso;
      }
      if (dateFilter === "7d") {
        return iso >= startForDays(7) && iso <= todayIso;
      }
      if (dateFilter === "30d") {
        return iso >= startForDays(30) && iso <= todayIso;
      }
      if (dateFilter === "custom") {
        if (customFromDate && customToDate) {
          return iso >= customFromDate && iso <= customToDate;
        }
        if (customFromDate) {
          return iso >= customFromDate;
        }
        if (customToDate) {
          return iso <= customToDate;
        }
        return false;
      }
      return true;
    });
  }, [today, dateFilter, customFromDate, customToDate]);

  const sortedHistory = useMemo(() => {
    return [...filteredHistory].sort((a, b) => {
      const aTime = new Date(a.checkInAt ?? "").getTime();
      const bTime = new Date(b.checkInAt ?? "").getTime();
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
      return bTime - aTime;
    });
  }, [filteredHistory]);

  const visibleHistory = useMemo(
    () => sortedHistory.slice(0, visibleCount),
    [sortedHistory, visibleCount]
  );

  const groupedHistory = useMemo(() => {
    const groups: Record<string, AttendanceRecord[]> = {};
    const order: string[] = [];

    visibleHistory.forEach((record) => {
      const baseTime = record.checkInAt ?? record.checkOutAt;
      const iso = resolveIsoDate(baseTime);
      if (!iso) return;
      if (!groups[iso]) {
        groups[iso] = [];
        order.push(iso);
      }
      groups[iso].push(record);
    });

    return order.map((date) => ({ date, items: groups[date] }));
  }, [visibleHistory]);

  const canLoadMore = visibleCount < sortedHistory.length;
  const allSelected = sortedHistory.length > 0 && selectedIds.size === sortedHistory.length;

  useEffect(() => {
    setSelectedIds(new Set());
    setDeleteMode(false);
  }, [dateFilter, customFromDate, customToDate, today]);

  const toggleSelection = (recordId: string) => {
    if (!deleteMode) {
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(sortedHistory.map((record) => record.id)));
  };

  const handleDeleteSelected = async () => {
    if (deleting || selectedIds.size === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedIds.size} attendance record(s)? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const ids = Array.from(selectedIds);
      await deleteAttendanceRecords(ids);
      setToday((prev) => prev.filter((record) => !selectedIds.has(record.id)));
      setActive((prev) => prev.filter((record) => !selectedIds.has(record.id)));
      setSelectedIds(new Set());
      setDeleteMode(false);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete attendance history."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Attendance"
        subtitle="Daily check-ins and attendance history."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">Today Attendance</h3>
          <p className="text-sm text-slate-300">
            Present, absent, and late counts.
          </p>
          {error ? (
            <div className="mt-5 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : loading ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Loading attendance...
            </div>
          ) : (
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-slate-300">Checked In</span>
                <span className="text-white">{activeCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-slate-300">Checked Out</span>
                <span className="text-white">{checkedOutCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-slate-300">Total Check-ins</span>
                <span className="text-white">{todayCount}</span>
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">Recent History</h3>
          <p className="text-sm text-slate-300">
            Date-wise attendance history.
          </p>
          {error ? (
            <div className="mt-5 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : loading ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Loading history...
            </div>
          ) : today.length === 0 ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              No attendance data yet.
            </div>
          ) : (
            <div className="mt-5 space-y-4 text-sm">
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
              </div>

              {sortedHistory.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  {deleteMode ? (
                    <>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                        >
                          {allSelected ? "Clear Selection" : "Select All"}
                        </button>
                        <span className="text-xs text-slate-400">
                          {selectedIds.size} selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIds(new Set());
                            setDeleteMode(false);
                          }}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteSelected}
                          disabled={deleting || selectedIds.size === 0}
                          className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deleting ? "Deleting..." : "Delete Selected"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteMode(true)}
                      className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ) : null}

              {sortedHistory.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  No attendance for this filter.
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedHistory.map((group) => (
                    <div key={group.date} className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {formatDateDisplay(group.date)}
                      </div>
                      {group.items.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            {deleteMode ? (
                              <input
                                type="checkbox"
                                checked={selectedIds.has(record.id)}
                                onChange={() => toggleSelection(record.id)}
                                className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-400"
                              />
                            ) : null}
                            <div>
                              <p className="text-white">{record.memberName}</p>
                              <p className="text-xs text-slate-400">
                                Roll {record.rollNumber ?? "--"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-xs text-slate-400">
                            <p>{record.status === "in" ? "In Gym" : "Checked Out"}</p>
                            <p>{formatDateTimeDisplay(record.checkInAt)}</p>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
