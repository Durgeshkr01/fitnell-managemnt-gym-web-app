"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/section-header";
import { formatDateTimeDisplay } from "@/lib/date-utils";
import {
  autoCheckoutStale,
  deleteAttendanceRecords,
  getActiveAttendance,
  getTodayAttendance,
  type AttendanceRecord,
} from "@/lib/firebase/attendance";

export default function TrainerAttendancePage() {
  const [active, setActive] = useState<AttendanceRecord[]>([]);
  const [today, setToday] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    setSelectedIds(new Set());
    setDeleteMode(false);
  }, [today]);

  const visibleHistory = today.slice(0, 8);
  const allSelected = visibleHistory.length > 0 && selectedIds.size === visibleHistory.length;

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

    setSelectedIds(new Set(visibleHistory.map((record) => record.id)));
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
        subtitle="Mark attendance and review member history."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">Daily Check-in</h3>
          <p className="text-sm text-slate-300">
            Mark present or absent for assigned members.
          </p>
          {error ? (
            <div className="mt-5 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : loading ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Loading attendance...
            </div>
          ) : active.length === 0 ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              No active check-ins.
            </div>
          ) : (
            <div className="mt-5 space-y-3 text-sm">
              {active.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-white">{record.memberName}</p>
                    <p className="text-xs text-slate-400">
                      Roll {record.rollNumber ?? "--"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>Checked In</p>
                    <p>{formatDateTimeDisplay(record.checkInAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">Attendance History</h3>
          <p className="text-sm text-slate-300">
            Review trends for the last 30 days.
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
              No attendance history yet.
            </div>
          ) : (
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
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
              {visibleHistory.map((record) => (
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
          )}
        </div>
      </div>
    </div>
  );
}
