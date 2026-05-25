"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ActionButton from "@/components/action-button";
import ClearDuesModal from "@/components/clear-dues-modal";
import MemberCard from "@/components/member-card";
import SectionHeader from "@/components/section-header";
import UpdatePaymentModal from "@/components/update-payment-modal";
import AddMemberModal from "@/components/add-member-modal";
import EditMemberModal from "@/components/edit-member-modal";
import * as XLSX from "xlsx";
import {
  addMember,
  clearMemberDues,
  deleteMember,
  getMembers,
  updateMemberProfile,
  updateMemberPayment,
  type MemberRecord,
} from "@/lib/firebase/members";
import { addPaymentRecord } from "@/lib/firebase/payments";
import {
  addDaysToIso,
  formatDateDisplay,
  formatDateTimeDisplay,
  parseDisplayDate,
  parseDisplayToIso,
  toIsoDate,
  toLocalDate,
} from "@/lib/date-utils";
import { fillTemplate, resolveTemplate } from "@/lib/messages";
import { useMessageTemplates } from "@/lib/use-message-templates";
import {
  autoCheckoutStale,
  checkInMember,
  checkOutMember,
  getActiveAttendance,
} from "@/lib/firebase/attendance";

const filters = [
  "All Members",
  "Expiring in 7 Days",
  "Active",
  "Expired",
  "Dues Pending",
  "New Admissions",
];

const PAGE_SIZE = 10;

function AdminMembersContent() {
  const searchParams = useSearchParams();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<MemberRecord | null>(null);
  const [profileMember, setProfileMember] = useState<MemberRecord | null>(null);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [duesMember, setDuesMember] = useState<MemberRecord | null>(null);
  const [savingDues, setSavingDues] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeAttendance, setActiveAttendance] = useState<Record<string, string>>({});
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { templates } = useMessageTemplates();

  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (!filterParam) return;

    const normalized = filterParam.toLowerCase();
    const mapped =
      normalized === "all"
        ? "All Members"
        : normalized === "expiring"
          ? "Expiring in 7 Days"
          : normalized === "active"
            ? "Active"
            : normalized === "expired"
              ? "Expired"
              : normalized === "dues"
                ? "Dues Pending"
                : normalized === "new"
                  ? "New Admissions"
                  : null;

    if (mapped && mapped !== activeFilter) {
      setActiveFilter(mapped);
    }
  }, [searchParams, activeFilter]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await getMembers();
      setMembers(results);
      setVisibleCount(PAGE_SIZE);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
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
    fetchMembers();
    fetchAttendance();
  }, []);

  const memberCountLabel = useMemo(() => {
    if (loading) {
      return "Members: loading...";
    }

    return members.length > 0 ? `${members.length} Members` : "Members: --";
  }, [loading, members.length]);

  const normalizeValue = (value: string) => value.toLowerCase().trim();

  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 10) {
      return `91${digits}`;
    }
    return digits;
  };

  const hasDuesValue = (dues: string) => {
    const normalized = String(dues).replace(/\s/g, "").toLowerCase();
    return normalized !== "--" && normalized !== "0" && normalized !== "₹0";
  };

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

  const parseMemberDate = (value?: string | null) => {
    if (!value) return null;
    if (value.includes("-")) {
      return toLocalDate(value);
    }
    return parseDisplayDate(value);
  };

  const resolveExpiryDate = (member: MemberRecord) =>
    parseMemberDate(member.planEndDate ?? member.expiry ?? null);

  const resolveJoinDate = (member: MemberRecord) =>
    parseMemberDate(member.joinDate ?? null);

  const isExpiringSoon = (member: MemberRecord) => {
    const expiry = resolveExpiryDate(member);
    if (!expiry) {
      return member.status === "Expiring Soon";
    }
    const diffMs = expiry.getTime() - Date.now();
    return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
  };

  const isExpired = (member: MemberRecord) => {
    const expiry = resolveExpiryDate(member);
    if (!expiry) {
      return member.status === "Expired";
    }
    return expiry.getTime() < Date.now();
  };

  const isNewAdmission = (member: MemberRecord) => {
    const joined = resolveJoinDate(member);
    if (!joined) {
      return Boolean(member.isNewAdmission);
    }
    return Date.now() - joined.getTime() <= 7 * 24 * 60 * 60 * 1000;
  };

  const filteredMembers = useMemo(() => {
    const normalizedSearch = normalizeValue(searchText);

    return members.filter((member) => {
      const matchesSearch = normalizedSearch
        ? normalizeValue(member.name ?? "").includes(normalizedSearch) ||
          normalizeValue(member.rollNumber ?? "").includes(normalizedSearch)
        : true;

      if (!matchesSearch) {
        return false;
      }

      if (activeFilter === "Expiring in 7 Days") {
        return isExpiringSoon(member);
      }
      if (activeFilter === "Active") {
        return !isExpired(member) && !isExpiringSoon(member);
      }
      if (activeFilter === "Expired") {
        return isExpired(member);
      }
      if (activeFilter === "Dues Pending") {
        return hasDuesValue(member.dues ?? "--");
      }
      if (activeFilter === "New Admissions") {
        return isNewAdmission(member);
      }

      return true;
    });
  }, [members, searchText, activeFilter]);

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort(compareRollNumbers);
  }, [filteredMembers]);

  const visibleMembers = useMemo(
    () => sortedMembers.slice(0, visibleCount),
    [sortedMembers, visibleCount]
  );

  const canLoadMore = visibleCount < sortedMembers.length;

  const handleDelete = async (member: MemberRecord) => {
    if (deletingId) return;
    const confirmed = window.confirm(
      `Delete ${member.name}? This will remove the member permanently.`
    );
    if (!confirmed) return;

    setDeletingId(member.id);
    setError(null);

    try {
      await deleteMember(member.id);
      setMembers((prev) => prev.filter((item) => item.id !== member.id));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete member."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddSingle = () => {
    setAddOpen(true);
  };

  const handleExport = () => {
    if (members.length === 0) {
      setError("No members to export.");
      return;
    }

    const headers = [
      "rollNumber",
      "name",
      "gender",
      "dateOfBirth",
      "phone",
      "trainerCode",
      "joinDate",
      "planStartDate",
      "planEndDate",
      "planAmount",
      "planDurationDays",
      "dues",
    ];

    const rows = members.map((member) => ({
      rollNumber: member.rollNumber ?? "",
      name: member.name ?? "",
      gender: member.gender ?? "",
      dateOfBirth: member.dateOfBirth ?? "",
      phone: member.phone ?? "",
      trainerCode: member.trainerCode ?? "",
      joinDate: member.joinDate ?? "",
      planStartDate: member.planStartDate ?? "",
      planEndDate: member.planEndDate ?? "",
      planAmount: member.planAmount ?? "",
      planDurationDays: member.planDurationDays ?? "",
      dues: member.dues ?? "",
    }));

    const csv = [headers.join(","), ...rows.map((row) =>
      headers
        .map((key) => {
          const value = String((row as Record<string, unknown>)[key] ?? "");
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(",")
    )].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "members.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const normalizeKey = (key: string) =>
    key.toLowerCase().replace(/[^a-z0-9]/g, "");

  const toIsoFromValue = (value: unknown) => {
    if (typeof value === "number") {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (!parsed) {
        return null;
      }
      const date = new Date(parsed.y, parsed.m - 1, parsed.d);
      return toIsoDate(date);
    }
    if (typeof value === "string") {
      if (value.includes("-")) {
        return value.trim();
      }
      return parseDisplayToIso(value.trim());
    }
    return null;
  };

  const handleImportFile = async (file: File) => {
    setError(null);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    if (rows.length === 0) {
      setError("Import file is empty.");
      return;
    }

    let successCount = 0;
    let skippedCount = 0;
    const rollIndex = new Set(
      members
        .map((member) => String(member.rollNumber ?? "").trim())
        .filter(Boolean)
    );

    const getFirstValue = (
      normalized: Record<string, unknown>,
      keys: string[]
    ) => {
      for (const key of keys) {
        const value = normalized[key];
        if (value === null || value === undefined) {
          continue;
        }
        if (typeof value === "string" && !value.trim()) {
          continue;
        }
        return value;
      }
      return "";
    };

    for (const row of rows) {
      const normalized: Record<string, unknown> = {};
      Object.entries(row).forEach(([key, value]) => {
        normalized[normalizeKey(key)] = value;
      });

      const name = String(
        getFirstValue(normalized, ["name", "fullname", "membername"])
      ).trim();
      const rollNumber = String(
        getFirstValue(normalized, ["rollnumber", "rollno", "rollnum", "roll"])
      ).trim();
      const genderRaw = String(
        getFirstValue(normalized, ["gender"])
      )
        .trim()
        .toLowerCase();
      const gender = genderRaw === "female" ? "Female" : genderRaw === "male" ? "Male" : "";
      const phone = String(
        getFirstValue(normalized, ["phone", "mobilenumber", "mobile", "phonenumber"])
      ).trim();
      const dateOfBirth = toIsoFromValue(
        getFirstValue(normalized, ["dateofbirth", "dob"])
      );
      const trainerCode = String(
        getFirstValue(normalized, ["trainercode"])
      ).trim();
      const joinDate = toIsoFromValue(
        getFirstValue(normalized, ["joindate", "joiningdate", "join"])
      );
      const planStartDate = toIsoFromValue(
        getFirstValue(normalized, ["planstartdate", "startdate", "plandatestart"])
      );
      const planEndDate = toIsoFromValue(
        getFirstValue(normalized, ["planenddate", "expirydate", "expdate", "expiry"])
      );
      const planAmount = Number(normalized.planamount ?? 0);
      const planDurationDays = Number(normalized.plandurationdays ?? 0);
      const dues = String(normalized.dues ?? "").trim();

      if (!name || !rollNumber || !gender || !phone) {
        skippedCount += 1;
        continue;
      }

      if (rollIndex.has(rollNumber)) {
        skippedCount += 1;
        continue;
      }

      const resolvedJoinDate = joinDate ?? planStartDate ?? null;
      const resolvedPlanStart = planStartDate ?? joinDate ?? null;

      if (!resolvedJoinDate || !resolvedPlanStart) {
        skippedCount += 1;
        continue;
      }

      const resolvedPlanDuration = planDurationDays > 0 ? planDurationDays : null;
      const resolvedPlanEndDate = planEndDate
        ? planEndDate
        : resolvedPlanDuration
          ? addDaysToIso(resolvedPlanStart, resolvedPlanDuration)
          : resolvedPlanStart;

      const result = await addMember({
        name,
        rollNumber,
        gender,
        dateOfBirth: dateOfBirth ?? null,
        phone,
        trainerCode: trainerCode || null,
        joinDate: resolvedJoinDate,
        planStartDate: resolvedPlanStart,
        planEndDate: resolvedPlanEndDate,
        planName: null,
        planAmount: Number.isNaN(planAmount) || planAmount <= 0 ? 500 : planAmount,
        planDurationDays: resolvedPlanDuration,
        dues: dues || "0",
      });
      if (result?.id) {
        await addPaymentRecord({
          memberId: result.id,
          memberName: name,
          rollNumber,
          amount: Number.isNaN(planAmount) || planAmount <= 0 ? 500 : planAmount,
          type: "Admission",
          paidOn: resolvedJoinDate,
        });
      }
      rollIndex.add(rollNumber);
      successCount += 1;
    }

    setError(`Import done. Added ${successCount}, skipped ${skippedCount}.`);
    await fetchMembers();
  };

  const handleImportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleImportFile(file);
    event.target.value = "";
  };

  const handleUpdatePayment = (member: MemberRecord) => {
    setEditingMember(member);
  };

  const handleEditMember = (member: MemberRecord) => {
    setProfileMember(member);
  };

  const handleClearDues = (member: MemberRecord) => {
    setDuesMember(member);
  };

  const handleSavePayment = async (payload: {
    planStartDate: string;
    planEndDate: string;
    planAmount: number;
    dues: string;
    paidOn: string;
    planDurationDays: number | null;
    sendBill: boolean;
  }) => {
    if (!editingMember) return;

    setSavingPayment(true);
    setError(null);

    try {
      const { sendBill, ...updatePayload } = payload;
      await updateMemberPayment(editingMember.id, updatePayload);
      await addPaymentRecord({
        memberId: editingMember.id,
        memberName: editingMember.name,
        rollNumber: editingMember.rollNumber ?? null,
        amount: payload.planAmount,
        type: "Payment Update",
        paidOn: payload.paidOn,
      });
      setMembers((prev) =>
        prev.map((item) =>
          item.id === editingMember.id
            ? {
                ...item,
                planStartDate: payload.planStartDate,
                planEndDate: payload.planEndDate,
                planAmount: payload.planAmount,
                planDurationDays: payload.planDurationDays,
                dues: payload.dues,
                status: "Active",
                expiry: payload.planEndDate,
              }
            : item
        )
      );
      setEditingMember(null);

      if (sendBill) {
        const phone = editingMember.phone?.trim();
        if (phone) {
          const normalized = phone.replace(/\D/g, "");
          const waPhone = normalized.length === 10 ? `91${normalized}` : normalized;
          if (waPhone) {
            const message = fillTemplate(resolveTemplate(templates, "paymentReceipt"), {
              name: editingMember.name,
              roll: editingMember.rollNumber ?? "--",
              planStart: formatDateDisplay(payload.planStartDate),
              planEnd: formatDateDisplay(payload.planEndDate),
              amount: payload.planAmount,
              dues: payload.dues,
              paidOn: formatDateTimeDisplay(payload.paidOn),
            });
            const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
            window.location.href = waLink;
          }
        }
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update payment."
      );
    } finally {
      setSavingPayment(false);
    }
  };

  const handleSaveDues = async (payload: {
    amount: number;
    paidOn: string;
    sendMessage: boolean;
  }) => {
    if (!duesMember) return;

    setSavingDues(true);
    setError(null);

    try {
      await clearMemberDues(duesMember.id, payload);
      await addPaymentRecord({
        memberId: duesMember.id,
        memberName: duesMember.name,
        rollNumber: duesMember.rollNumber ?? null,
        amount: payload.amount,
        type: "Dues Clear",
        paidOn: payload.paidOn,
      });
      setMembers((prev) =>
        prev.map((item) =>
          item.id === duesMember.id
            ? {
                ...item,
                dues: "0",
              }
            : item
        )
      );
      if (payload.sendMessage) {
        const waPhone = normalizePhone(duesMember.phone ?? "");
        if (waPhone) {
          const message = fillTemplate(resolveTemplate(templates, "duesClear"), {
            name: duesMember.name,
            roll: duesMember.rollNumber ?? "--",
            amount: payload.amount,
            paidOn: formatDateTimeDisplay(payload.paidOn),
          });
          const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
          window.location.href = waLink;
        }
      }
      setDuesMember(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to clear dues."
      );
    } finally {
      setSavingDues(false);
    }
  };

  const handleSaveProfile = async (payload: {
    name: string;
    rollNumber: string;
    gender: "Male" | "Female";
    dateOfBirth: string | null;
    phone: string;
    trainerCode?: string | null;
    joinDate: string;
    planStartDate: string;
    planEndDate: string;
    planAmount: number;
    planDurationDays: number | null;
    dues: string;
  }) => {
    if (!profileMember) return;

    setSavingProfile(true);
    setError(null);

    try {
      const duplicateRoll = members.find(
        (item) =>
          item.id !== profileMember.id &&
          String(item.rollNumber ?? "").trim() === payload.rollNumber.trim()
      );
      if (duplicateRoll) {
        setError("Roll number already exists.");
        setSavingProfile(false);
        return;
      }

      await updateMemberProfile(profileMember.id, payload);
      setMembers((prev) =>
        prev.map((item) =>
          item.id === profileMember.id
            ? {
                ...item,
                name: payload.name,
                rollNumber: payload.rollNumber,
                gender: payload.gender,
              dateOfBirth: payload.dateOfBirth ?? null,
                phone: payload.phone,
                trainerCode: payload.trainerCode ?? null,
                joinDate: payload.joinDate,
                planStartDate: payload.planStartDate,
                planEndDate: payload.planEndDate,
                planAmount: payload.planAmount,
                planDurationDays: payload.planDurationDays,
                dues: payload.dues,
                expiry: payload.planEndDate,
              }
            : item
        )
      );
      setProfileMember(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update member."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCheckIn = async (member: MemberRecord) => {
    try {
      await checkInMember({
        memberId: member.id,
        memberName: member.name,
        rollNumber: member.rollNumber ?? null,
        checkedInBy: "admin",
      });
      await fetchAttendance();
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
      await fetchAttendance();
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : "Check-out failed.");
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Members" subtitle="Gym Management System" />

      <div className="glass-panel rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              {memberCountLabel}
            </div>
            <ActionButton
              actionName="Members: View All"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
            >
              See All Members
            </ActionButton>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ActionButton
              actionName="Members: Add Single"
              onClick={(event) => {
                event.preventDefault();
                handleAddSingle();
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
            >
              Add Single
            </ActionButton>
            <ActionButton
              actionName="Members: Import Excel"
              onClick={handleImportClick}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
            >
              Import Excel
            </ActionButton>
            <ActionButton
              actionName="Members: Export"
              onClick={(event) => {
                event.preventDefault();
                handleExport();
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
            >
              Export
            </ActionButton>
            <ActionButton
              actionName="Members: Refresh"
              onClick={(event) => {
                event.preventDefault();
                fetchMembers();
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
            >
              Refresh
            </ActionButton>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {filters.map((filter, index) => (
            <ActionButton
              key={filter}
              actionName={`Members: Filter ${filter}`}
              onClick={(event) => {
                event.preventDefault();
                setActiveFilter(filter);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`rounded-full px-4 py-2 text-xs transition ${
                filter === activeFilter
                  ? "border border-white/20 bg-white/10 text-white"
                  : "border border-white/10 text-slate-300"
              }`}
            >
              {filter}
            </ActionButton>
          ))}
        </div>

        <div className="mt-4">
          <input
            className="input-base w-full px-4 py-3 text-sm placeholder:text-slate-500"
            placeholder="Search name or roll number"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          />
        </div>

        <div className="mt-5 space-y-3 text-sm">
          {loading ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Loading members...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              No members loaded yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visibleMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  showPaymentAction
                  onUpdatePayment={handleUpdatePayment}
                  onClearDues={handleClearDues}
                  onEdit={handleEditMember}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  isInGym={Boolean(activeAttendance[member.id])}
                  onDelete={handleDelete}
                  deleting={deletingId === member.id}
                />
              ))}
            </div>
          )}
        </div>

        {canLoadMore && !loading && !error ? (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
            >
              Load more
            </button>
          </div>
        ) : null}
      </div>

      {editingMember ? (
        <UpdatePaymentModal
          member={editingMember}
          saving={savingPayment}
          onClose={() => setEditingMember(null)}
          onSave={handleSavePayment}
        />
      ) : null}

      <AddMemberModal
        hideTrigger
        isOpen={addOpen}
        onOpenChange={setAddOpen}
        onSaved={fetchMembers}
      />

      {duesMember ? (
        <ClearDuesModal
          member={duesMember}
          saving={savingDues}
          onClose={() => setDuesMember(null)}
          onSave={handleSaveDues}
        />
      ) : null}

      {profileMember ? (
        <EditMemberModal
          member={profileMember}
          saving={savingProfile}
          onClose={() => setProfileMember(null)}
          onSave={handleSaveProfile}
        />
      ) : null}

    </div>
  );
}

export default function AdminMembersPage() {
  return (
    <Suspense
      fallback={
        <div className="glass-panel mx-auto mt-8 max-w-3xl rounded-2xl p-6 text-sm text-slate-300">
          Loading members...
        </div>
      }
    >
      <AdminMembersContent />
    </Suspense>
  );
}
