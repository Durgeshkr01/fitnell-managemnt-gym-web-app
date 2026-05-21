"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ActionButton from "@/components/action-button";
import MemberCard from "@/components/member-card";
import SectionHeader from "@/components/section-header";
import { getMembers, type MemberRecord } from "@/lib/firebase/members";
import {
  autoCheckoutStale,
  checkInMember,
  checkOutMember,
  getActiveAttendance,
} from "@/lib/firebase/attendance";

function TrainerMembersContent() {
  const searchParams = useSearchParams();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAttendance, setActiveAttendance] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (!filterParam) return;
    setActiveFilter(filterParam.toLowerCase());
  }, [searchParams]);

  const loadMembers = async () => {
    setError(null);
    setLoading(true);

    try {
      const results = await getMembers();
      setMembers(results);
      setVisibleCount(10);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      await autoCheckoutStale();
      const active = await getActiveAttendance();
      const map: Record<string, string> = {};
      active.forEach((record) => {
        if (record.memberId) {
          map[record.memberId] = record.id;
        }
      });
      setActiveAttendance(map);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load attendance.");
    }
  };

  useEffect(() => {
    loadMembers();
    loadAttendance();
  }, []);

  const parseRollNumber = (value?: string | null) => {
    const raw = String(value ?? "").trim();
    if (!raw) {
      return null;
    }

    const digits = raw.replace(/[^0-9]/g, "");
    if (!digits) {
      return null;
    }

    const numberValue = Number(digits);
    return Number.isNaN(numberValue) ? null : numberValue;
  };

  const compareRollNumbers = (left: MemberRecord, right: MemberRecord) => {
    const leftText = String(left.rollNumber ?? "").trim();
    const rightText = String(right.rollNumber ?? "").trim();
    const leftNumber = parseRollNumber(leftText);
    const rightNumber = parseRollNumber(rightText);

    if (leftNumber !== null && rightNumber !== null) {
      if (leftNumber !== rightNumber) {
        return leftNumber - rightNumber;
      }
      return leftText.localeCompare(rightText, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    }

    if (leftNumber !== null) return -1;
    if (rightNumber !== null) return 1;
    if (!leftText && !rightText) return 0;
    if (!leftText) return 1;
    if (!rightText) return -1;

    return leftText.localeCompare(rightText, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const normalizeValue = (value: string) => value.toLowerCase().trim();

  const filteredMembers = useMemo(() => {
    const normalizedSearch = normalizeValue(searchText);
    const hasDues = (value: string) => {
      const raw = String(value ?? "").replace(/[^0-9.]/g, "");
      const amount = Number(raw);
      return !Number.isNaN(amount) && amount > 0;
    };

    return members.filter((member) => {
      const matchesSearch = normalizedSearch
        ? normalizeValue(member.name ?? "").includes(normalizedSearch) ||
          normalizeValue(member.rollNumber ?? "").includes(normalizedSearch)
        : true;

      if (!matchesSearch) {
        return false;
      }

      if (activeFilter === "active") {
        return member.status === "Active";
      }
      if (activeFilter === "expiring") {
        return member.status === "Expiring Soon";
      }
      if (activeFilter === "expired") {
        return member.status === "Expired";
      }
      if (activeFilter === "dues") {
        return hasDues(member.dues ?? "");
      }

      return true;
    });
  }, [members, activeFilter, searchText]);

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort(compareRollNumbers);
  }, [filteredMembers]);

  const visibleMembers = useMemo(
    () => sortedMembers.slice(0, visibleCount),
    [sortedMembers, visibleCount]
  );

  const canLoadMore = visibleCount < sortedMembers.length;

  const assignedLabel = useMemo(() => {
    if (loading) {
      return "Loading members...";
    }

    return sortedMembers.length > 0
      ? `${sortedMembers.length} member(s) available`
      : "No members available yet.";
  }, [loading, sortedMembers.length]);

  const handleCheckIn = async (member: MemberRecord) => {
    try {
      await checkInMember({
        memberId: member.id,
        memberName: member.name,
        rollNumber: member.rollNumber ?? null,
        checkedInBy: "trainer",
      });
      await loadAttendance();
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : "Check-in failed.");
    }
  };

  const handleCheckOut = async (member: MemberRecord) => {
    const attendanceId = activeAttendance[member.id];
    if (!attendanceId) {
      return;
    }
    try {
      await checkOutMember(attendanceId);
      await loadAttendance();
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : "Check-out failed.");
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Members"
        subtitle="Assigned members with quick WhatsApp access."
      />

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg text-white">Assigned Members</h3>
            <p className="text-sm text-slate-300">{assignedLabel}</p>
          </div>
          <div className="flex w-full items-center gap-3 md:w-auto">
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white md:w-64"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setVisibleCount(10);
              }}
              placeholder="Search name or roll no."
            />
            <ActionButton
              actionName="Trainer Members: Refresh"
              onClick={(event) => {
                event.preventDefault();
                loadMembers();
                loadAttendance();
              }}
              className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300"
            >
              Refresh
            </ActionButton>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {error ? (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Loading members...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              No members available yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visibleMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  isInGym={Boolean(activeAttendance[member.id])}
                />
              ))}
            </div>
          )}

          {canLoadMore ? (
            <div className="flex justify-center">
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300"
                onClick={() => setVisibleCount((prev) => prev + 10)}
                type="button"
              >
                Load More
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function TrainerMembersPage() {
  return (
    <Suspense
      fallback={
        <div className="glass-panel mx-auto mt-8 max-w-3xl rounded-2xl p-6 text-sm text-slate-300">
          Loading members...
        </div>
      }
    >
      <TrainerMembersContent />
    </Suspense>
  );
}
