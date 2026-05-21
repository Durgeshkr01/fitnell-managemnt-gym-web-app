"use client";

import { useEffect, useState } from "react";
import DatePicker from "@/components/date-picker";
import { addDaysToIso, diffDays, toIsoDate } from "@/lib/date-utils";
import { addMember } from "@/lib/firebase/members";
import { useAction } from "./action-provider";

type AddMemberModalProps = {
  hideTrigger?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  onSaved?: (memberId?: string) => void;
  initialValues?: Partial<ReturnType<typeof buildInitialFormState>>;
};

const buildInitialFormState = () => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return {
    rollNumber: "",
    gender: "Male",
    name: "",
    dateOfBirth: "",
    phone: "",
    joinDate: toIsoDate(today),
    planStartDate: toIsoDate(today),
    planEndDate: toIsoDate(nextMonth),
    planAmount: "500",
    planDurationDays: "30",
  };
};

export default function AddMemberModal({
  hideTrigger = false,
  isOpen,
  onOpenChange,
  triggerLabel = "Add Member ➕",
  onSaved,
  initialValues,
}: AddMemberModalProps) {
  const { runAction } = useAction();
  const [openState, setOpenState] = useState(false);
  const [form, setForm] = useState(buildInitialFormState());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isControlled = typeof isOpen === "boolean";
  const isDialogOpen = isControlled ? isOpen : openState;

  const setDialogOpen = (nextValue: boolean) => {
    if (!isControlled) {
      setOpenState(nextValue);
    }
    onOpenChange?.(nextValue);
  };

  const closeModal = () => {
    setDialogOpen(false);
    setForm(buildInitialFormState());
    setError(null);
    setSaving(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedName = form.name.trim();
    const trimmedRollNumber = form.rollNumber.trim();
    const trimmedGender = form.gender.trim();
    const trimmedPhone = form.phone.trim();
    const planAmountNumber = Number(form.planAmount);
    const planDaysNumber = form.planDurationDays ? Number(form.planDurationDays) : null;

    if (!trimmedName || !trimmedRollNumber || !trimmedGender || !trimmedPhone) {
      setError("Name, roll number, gender, and phone are required.");
      return;
    }


    if (!/^[0-9+\-()\s]{7,15}$/.test(trimmedPhone)) {
      setError("Enter a valid phone number.");
      return;
    }

    if (!form.joinDate || !form.planStartDate || !form.planEndDate) {
      setError("Join date, plan start, and plan end are required.");
      return;
    }

    if (Number.isNaN(planAmountNumber) || planAmountNumber <= 0) {
      setError("Plan amount must be a valid number.");
      return;
    }

    if (planDaysNumber !== null && (Number.isNaN(planDaysNumber) || planDaysNumber <= 0)) {
      setError("Plan days must be a valid number.");
      return;
    }

    setSaving(true);

    try {
      const result = await addMember({
        name: trimmedName,
        rollNumber: trimmedRollNumber,
        gender: trimmedGender === "Female" ? "Female" : "Male",
        dateOfBirth: form.dateOfBirth.trim() || null,
        phone: trimmedPhone,
        trainerCode: null,
        joinDate: form.joinDate,
        planStartDate: form.planStartDate,
        planEndDate: form.planEndDate,
        planName: null,
        planAmount: planAmountNumber,
        planDurationDays: planDaysNumber,
      });
      runAction("Members: Add", {
        name: trimmedName,
        dateOfBirth: form.dateOfBirth.trim() || null,
        phone: trimmedPhone,
        planAmount: planAmountNumber,
      });
      onSaved?.(result?.id);
      closeModal();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to add member.";
      setError(message);
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isDialogOpen) return;
    if (!initialValues) {
      setForm(buildInitialFormState());
      return;
    }

    setForm((prev) => ({
      ...buildInitialFormState(),
      ...initialValues,
      rollNumber: initialValues.rollNumber ?? prev.rollNumber ?? "",
      name: initialValues.name ?? prev.name ?? "",
      phone: initialValues.phone ?? prev.phone ?? "",
      dateOfBirth: initialValues.dateOfBirth ?? prev.dateOfBirth ?? "",
      gender: initialValues.gender ?? prev.gender ?? "Male",
    }));
  }, [isDialogOpen, initialValues]);

  return (
    <>
      {!hideTrigger ? (
        <button
          className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm text-white"
          onClick={() => setDialogOpen(true)}
          type="button"
        >
          {triggerLabel}
        </button>
      ) : null}

      {isDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg text-white">Add Member</h3>
                <p className="text-sm text-slate-300">
                  Required fields: name, roll number, gender, phone number.
                </p>
              </div>
              <button
                className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300"
                onClick={closeModal}
                type="button"
              >
                Close
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Join Date
                  </label>
                  <DatePicker
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    value={form.joinDate ?? ""}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, joinDate: value }))
                    }
                    required
                  />
                </div>
                <div />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Roll Number
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  value={form.rollNumber ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, rollNumber: event.target.value }))
                  }
                  placeholder="Roll number"
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
                    setForm((prev) => ({ ...prev, gender: event.target.value }))
                  }
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Name
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  value={form.name ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Member name"
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Date of Birth
                </label>
                <DatePicker
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  value={form.dateOfBirth ?? ""}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, dateOfBirth: value }))
                  }
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Phone Number
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  value={form.phone ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="Mobile number"
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
                    value={form.planStartDate ?? ""}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        planStartDate: value,
                        planEndDate: prev.planDurationDays
                          ? addDaysToIso(value, Number(prev.planDurationDays))
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
                    value={form.planEndDate ?? ""}
                    onChange={(value) => {
                      const duration = diffDays(form.planStartDate, value);
                      setForm((prev) => ({
                        ...prev,
                        planEndDate: value,
                        planDurationDays:
                          duration !== null ? String(duration) : prev.planDurationDays,
                      }));
                    }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Plan Days
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  value={form.planDurationDays ?? ""}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setForm((prev) => ({
                      ...prev,
                      planDurationDays: nextValue,
                      planEndDate:
                        nextValue && !Number.isNaN(Number(nextValue))
                          ? addDaysToIso(prev.planStartDate, Number(nextValue))
                          : prev.planEndDate,
                    }));
                  }}
                  placeholder="30"
                  type="number"
                  min={1}
                />
                <p className="mt-1 text-xs text-slate-500">
                  End date updates based on days from the start date.
                </p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Plan Amount
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  value={form.planAmount ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, planAmount: event.target.value }))
                  }
                  placeholder="500"
                  type="number"
                  min={1}
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <button
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300"
                  onClick={closeModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-60"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
