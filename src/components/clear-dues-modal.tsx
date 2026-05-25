"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDateTimeDisplay } from "@/lib/date-utils";
import type { MemberRecord } from "@/lib/firebase/members";

const parseNumber = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
};

type ClearDuesPayload = {
  amount: number;
  paidOn: string;
  sendMessage: boolean;
};

type ClearDuesModalProps = {
  member: MemberRecord;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: ClearDuesPayload) => void;
};

export default function ClearDuesModal({
  member,
  saving,
  onClose,
  onSave,
}: ClearDuesModalProps) {
  const initialPaidOn = useMemo(() => new Date().toISOString(), []);
  const [form, setForm] = useState({
    amount:
      member.dues && member.dues !== "--" ? String(member.dues) : "0",
    paidOn: initialPaidOn,
    sendMessage: true,
  });
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

    const amount = parseNumber(form.amount);
    if (!amount || amount <= 0) {
      setError("Enter a valid dues amount.");
      return;
    }

    onSave({
      amount,
      paidOn: form.paidOn || initialPaidOn,
      sendMessage: form.sendMessage,
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg text-white">Clear Dues</h3>
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
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Dues Amount
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={form.amount}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, amount: event.target.value }))
              }
              placeholder="Amount"
              required
            />
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
              checked={form.sendMessage}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, sendMessage: event.target.checked }))
              }
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-400"
            />
            Send dues clear WhatsApp message
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
              {saving ? "Saving..." : "Clear Dues"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
