"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "@/components/date-picker";
import {
  addDaysToIso,
  formatDateDisplay,
  formatDateTimeDisplay,
  toIsoDate,
} from "@/lib/date-utils";
import type { MemberRecord } from "@/lib/firebase/members";

const parseNumber = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
};

type PaymentPayload = {
  planStartDate: string;
  planEndDate: string;
  planAmount: number;
  dues: string;
  paidOn: string;
  planDurationDays: number | null;
  sendBill: boolean;
};

type UpdatePaymentModalProps = {
  member: MemberRecord;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: PaymentPayload) => void;
};

export default function UpdatePaymentModal({
  member,
  saving,
  onClose,
  onSave,
}: UpdatePaymentModalProps) {
  const initialPaidOn = useMemo(() => new Date().toISOString(), []);
  const initialStartDate = useMemo(
    () => member.planStartDate ?? toIsoDate(new Date()),
    [member.planStartDate]
  );
  const initialDurationDays =
    typeof member.planDurationDays === "number" && member.planDurationDays > 0
      ? String(member.planDurationDays)
      : "30";
  const initialEndDate = useMemo(
    () => addDaysToIso(initialStartDate, Number(initialDurationDays)),
    [initialStartDate, initialDurationDays]
  );
  const [form, setForm] = useState({
    planStartDate: initialStartDate,
    planEndDate: member.planEndDate ?? initialEndDate,
    planAmount: member.planAmount ? String(member.planAmount) : "500",
    dues: member.dues && member.dues !== "--" ? String(member.dues) : "0",
    paidOn: initialPaidOn,
    planDurationDays: initialDurationDays,
  });
  const [sendBill, setSendBill] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      paidOn: new Date().toISOString(),
    }));
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const amount = parseNumber(form.planAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (!form.planStartDate || !form.planEndDate) {
      setError("Start and end dates are required.");
      return;
    }

    const durationValue = parseNumber(form.planDurationDays);
    const durationDays = durationValue && durationValue > 0 ? durationValue : null;

    onSave({
      planStartDate: form.planStartDate,
      planEndDate: form.planEndDate,
      planAmount: amount,
      dues: form.dues,
      paidOn: form.paidOn || initialPaidOn,
      planDurationDays: durationDays,
      sendBill,
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg text-white">Update Payment</h3>
            <p className="text-sm text-slate-300">
              {member.name} - Roll {member.rollNumber ?? "--"}
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

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Start Date
              </label>
              <DatePicker
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.planStartDate}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    planStartDate: value,
                    planEndDate: addDaysToIso(
                      value,
                      Number(prev.planDurationDays || 0)
                    ),
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Duration (Days)
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.planDurationDays}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    planDurationDays: event.target.value,
                    planEndDate: addDaysToIso(
                      prev.planStartDate,
                      Number(event.target.value || 0)
                    ),
                  }))
                }
                placeholder="Days"
                type="number"
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              End Date
            </label>
            <DatePicker
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.planEndDate}
              onChange={() => undefined}
              readOnly
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Amount Paid
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.planAmount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, planAmount: event.target.value }))
                }
                placeholder="Amount"
                required
              />
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
                placeholder="Dues"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Paid On
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={formatDateTimeDisplay(form.paidOn)}
              type="text"
              readOnly
              required
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={sendBill}
              onChange={(event) => setSendBill(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-400"
            />
            Send bill on WhatsApp
          </label>

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
              {saving ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
