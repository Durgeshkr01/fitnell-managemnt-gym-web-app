"use client";

import ActionButton from "@/components/action-button";
import { formatDateDisplay } from "@/lib/date-utils";
import type { MemberRecord } from "@/lib/firebase/members";
import { fillTemplate, resolveTemplate } from "@/lib/messages";
import { useMessageTemplates } from "@/lib/use-message-templates";

const statusStyles: Record<string, string> = {
  Active: "border-emerald-400/30 text-emerald-300",
  "Expiring Soon": "border-amber-400/30 text-amber-300",
  Expired: "border-rose-400/30 text-rose-300",
};

type MemberCardProps = {
  member: MemberRecord;
  readOnly?: boolean;
  showPaymentAction?: boolean;
  onUpdatePayment?: (member: MemberRecord) => void;
  onClearDues?: (member: MemberRecord) => void;
  onEdit?: (member: MemberRecord) => void;
  onCheckIn?: (member: MemberRecord) => void;
  onCheckOut?: (member: MemberRecord) => void;
  isInGym?: boolean;
  onDelete?: (member: MemberRecord) => void;
  deleting?: boolean;
};

const hasDuesValue = (dues: string) => {
  const normalized = String(dues).replace(/\s/g, "").toLowerCase();
  return normalized !== "--" && normalized !== "0" && normalized !== "₹0";
};

export default function MemberCard({
  member,
  readOnly = false,
  showPaymentAction = false,
  onUpdatePayment,
  onClearDues,
  onEdit,
  onCheckIn,
  onCheckOut,
  isInGym = false,
  onDelete,
  deleting = false,
}: MemberCardProps) {
  const showPayment = showPaymentAction;
  const showDuesActions = hasDuesValue(member.dues);
  const { templates } = useMessageTemplates();

  const buildStatusMessage = () => {
    const name = member.name ?? "Member";
    const expiryLabel = member.expiry ?? "--";

    if (member.status === "Expiring Soon") {
      return fillTemplate(resolveTemplate(templates, "planExpiring"), {
        name,
        expiry: expiryLabel,
        detail: "",
      });
    }

    if (member.status === "Expired") {
      return fillTemplate(resolveTemplate(templates, "planExpired"), {
        name,
        expiry: expiryLabel,
        detail: "",
      });
    }

    return fillTemplate(resolveTemplate(templates, "statusActive"), { name });
  };

  const buildDuesMessage = () => {
    const name = member.name ?? "Member";
    const duesLabel = member.dues ?? "";
    return fillTemplate(resolveTemplate(templates, "duesReminder"), {
      name,
      dues: duesLabel,
      detail: "",
    });
  };

  const handleSendMessage = () => {
    const phone = member.phone?.trim();
    if (!phone) {
      return;
    }

    const message = buildStatusMessage();
    const smsLink = `sms:${phone}?&body=${encodeURIComponent(message)}`;
    window.location.href = smsLink;
  };

  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 10) {
      return `91${digits}`;
    }
    return digits;
  };

  const handleWhatsApp = () => {
    const phone = member.phone?.trim();
    if (!phone) {
      return;
    }

    const message = buildStatusMessage();
    const normalized = normalizePhone(phone);
    if (!normalized) {
      return;
    }

    const waLink = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
    window.location.href = waLink;
  };

  const handleDuesReminderWhatsApp = () => {
    if (!showDuesActions) return;
    const phone = member.phone?.trim();
    if (!phone) {
      return;
    }

    const message = buildDuesMessage();
    const normalized = normalizePhone(phone);
    if (!normalized) {
      return;
    }

    const waLink = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
    window.location.href = waLink;
  };

  return (
    <div className="glass-panel panel-card rounded-2xl border border-white/10 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base text-white">{member.name}</p>
            {member.isNewAdmission ? (
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                New ✅
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-400">
            Roll No: {member.rollNumber ?? "--"}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span
            className={`w-fit rounded-full border px-3 py-1 text-xs ${
              statusStyles[member.status] ?? "border-white/20 text-slate-300"
            }`}
          >
            {member.status}
          </span>
          {showDuesActions ? (
            <span className="rounded-full border border-rose-400/40 bg-rose-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-rose-200">
              ⚠️ Dues
            </span>
          ) : null}
          {isInGym ? (
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
              In Gym
            </span>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(member)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
            >
              ✏️ Edit
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-xs text-slate-300 sm:grid-cols-2">
        <div>
          <p className="uppercase tracking-[0.2em] text-slate-500">Expiry</p>
          <p className="text-sm text-white">{formatDateDisplay(member.expiry)}</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.2em] text-slate-500">Dues</p>
          <p className="text-sm text-white">{member.dues}</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.2em] text-slate-500">Phone</p>
          <p className="text-sm text-white">{member.phone ?? "--"}</p>
        </div>
      </div>

      {!readOnly ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <ActionButton
            actionName={`Member: Send Message ${member.id}`}
            onClick={handleSendMessage}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-300"
          >
            ✉️ Send Msg
          </ActionButton>
          <ActionButton
            actionName={`Member: WhatsApp Reminder ${member.id}`}
            onClick={handleWhatsApp}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-300"
          >
            🟢 WhatsApp
          </ActionButton>
          {showDuesActions ? (
            <ActionButton
              actionName={`Member: Dues Reminder WhatsApp ${member.id}`}
              onClick={handleDuesReminderWhatsApp}
              className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-amber-200"
            >
              🟢 Dues WhatsApp
            </ActionButton>
          ) : null}
          {showDuesActions && onClearDues ? (
            <button
              type="button"
              onClick={() => onClearDues(member)}
              className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-emerald-200"
            >
              ✅ Clear Dues
            </button>
          ) : null}
          {showPayment ? (
            <ActionButton
              actionName={`Member: Update Payment ${member.id}`}
              onClick={(event) => {
                if (onUpdatePayment) {
                  event.preventDefault();
                  onUpdatePayment(member);
                }
              }}
              className="rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-2 text-blue-200"
            >
              Update Payment
            </ActionButton>
          ) : null}
          {onCheckIn && !isInGym ? (
            <button
              type="button"
              onClick={() => onCheckIn(member)}
              className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-emerald-200"
            >
              ✅ Check In
            </button>
          ) : null}
          {onCheckOut && isInGym ? (
            <button
              type="button"
              onClick={() => onCheckOut(member)}
              className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-amber-200"
            >
              ⏱️ Check Out
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(member)}
              disabled={deleting}
              title="Delete"
              className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-rose-200 hover:border-rose-400/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "..." : "🗑️"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
