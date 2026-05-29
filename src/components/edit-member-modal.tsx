"use client";

import { useState } from "react";
import DatePicker from "@/components/date-picker";
import { addPlanDaysToIso, diffDaysInclusive } from "@/lib/date-utils";
import type { MemberRecord } from "@/lib/firebase/members";

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

type EditMemberPayload = {
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
};

type EditMemberModalProps = {
  member: MemberRecord;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: EditMemberPayload) => void;
};

export default function EditMemberModal({
  member,
  saving,
  onClose,
  onSave,
}: EditMemberModalProps) {
  const [form, setForm] = useState({
    name: member.name ?? "",
    rollNumber: member.rollNumber ?? "",
    gender: member.gender ?? "Male",
    dateOfBirth: member.dateOfBirth ?? "",
    phone: member.phone ?? "",
    trainerCode: member.trainerCode ?? "",
    joinDate: member.joinDate ?? "",
    planStartDate: member.planStartDate ?? "",
    planEndDate: member.planEndDate ?? "",
    planAmount: member.planAmount ? String(member.planAmount) : "",
    planDurationDays: member.planDurationDays ? String(member.planDurationDays) : "",
    dues: member.dues ?? "0",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const name = form.name.trim();
    const rollNumber = form.rollNumber.trim();
    const phone = form.phone.trim();
    const planAmount = toNumber(form.planAmount);
    const planDays = toNumber(form.planDurationDays);

    if (!name || !rollNumber || !phone) {
      setError("Name, roll number, and phone are required.");
      return;
    }

    if (!form.joinDate || !form.planStartDate || !form.planEndDate) {
      setError("Join date, plan start, and plan end are required.");
      return;
    }

    if (!planAmount || planAmount <= 0) {
      setError("Plan amount must be valid.");
      return;
    }

    onSave({
      name,
      rollNumber,
      gender: form.gender === "Female" ? "Female" : "Male",
      dateOfBirth: form.dateOfBirth.trim() || null,
      phone,
      trainerCode: form.trainerCode.trim() || null,
      joinDate: form.joinDate,
      planStartDate: form.planStartDate,
      planEndDate: form.planEndDate,
      planAmount,
      planDurationDays: planDays && planDays > 0 ? planDays : null,
      dues: form.dues.trim() || "0",
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg text-white">Edit Member</h3>
            <p className="text-sm text-slate-300">
              Update member details and plan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300"
          >
            Close
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Roll Number
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.rollNumber}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, rollNumber: event.target.value }))
              }
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Name
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Gender
              </label>
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.gender}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    gender: event.target.value === "Female" ? "Female" : "Male",
                  }))
                }
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Date of Birth
              </label>
              <DatePicker
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.dateOfBirth}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, dateOfBirth: value }))
                }
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Phone
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Trainer Code
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.trainerCode}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, trainerCode: event.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Join Date
            </label>
            <DatePicker
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.joinDate}
              onChange={(value) => setForm((prev) => ({ ...prev, joinDate: value }))}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Plan Start Date
              </label>
              <DatePicker
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.planStartDate}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    planStartDate: value,
                    planEndDate: prev.planDurationDays
                      ? addPlanDaysToIso(value, Number(prev.planDurationDays))
                      : prev.planEndDate,
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Plan End Date
              </label>
              <DatePicker
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.planEndDate}
                onChange={(value) => {
                  const duration = diffDaysInclusive(form.planStartDate, value);
                  setForm((prev) => ({
                    ...prev,
                    planEndDate: value,
                    planDurationDays: duration !== null ? String(duration) : prev.planDurationDays,
                  }));
                }}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Plan Days
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.planDurationDays}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    planDurationDays: nextValue,
                    planEndDate:
                      nextValue && !Number.isNaN(Number(nextValue))
                        ? addPlanDaysToIso(prev.planStartDate, Number(nextValue))
                        : prev.planEndDate,
                  }));
                }}
                type="number"
                min={1}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Plan Amount
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.planAmount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, planAmount: event.target.value }))
                }
                type="number"
                min={1}
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Dues
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.dues}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dues: event.target.value }))
              }
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
