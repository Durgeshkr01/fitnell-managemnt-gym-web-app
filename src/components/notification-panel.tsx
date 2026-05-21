"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ActionButton from "./action-button";
import {
  clearAllNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationsReadByKey,
  markNotificationRead,
  type NotificationRecord,
} from "@/lib/firebase/notifications";
import { getMemberById } from "@/lib/firebase/members";
import { formatDateTimeDisplay } from "@/lib/date-utils";

const tabs = [
  "All",
  "Birthday",
  "Expiring",
  "Expired",
  "Dues",
  "Payments",
];

const toneStyles: Record<string, string> = {
  warning: "text-amber-300",
  success: "text-emerald-300",
  danger: "text-rose-300",
  info: "text-sky-300",
  neutral: "text-slate-300",
};

type NotificationPanelProps = {
  role: "admin" | "trainer";
  onUnreadCountChange?: (count: number) => void;
};

export default function NotificationPanel({
  role,
  onUnreadCountChange,
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [searchText, setSearchText] = useState("");

  const notificationsHref =
    role === "admin" ? "/admin/notifications" : "/trainer/notifications";

  const refreshNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      if (onUnreadCountChange) {
        onUnreadCountChange(data.filter((item) => !item.read).length);
      }
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, []);

  const parseMemberIdFromKey = (key?: string | null) => {
    if (!key) {
      return null;
    }

    const [prefix, memberId] = key.split(":");
    if (!memberId) {
      return null;
    }

    const supportedPrefixes = new Set(["expiring", "expired", "dues"]);
    return supportedPrefixes.has(prefix) ? memberId : null;
  };

  const extractMemberNameFromTitle = (title: string) => {
    const parts = title.split(":");
    if (parts.length < 2) {
      return "Member";
    }

    const namePart = parts.slice(1).join(":").trim();
    const cleaned = namePart.replace(/\(.*\)$/g, "").trim();
    return cleaned || "Member";
  };

  const normalizePhoneForWhatsApp = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) {
      return null;
    }

    if (digits.length === 10) {
      return `91${digits}`;
    }

    if (digits.length === 11 && digits.startsWith("0")) {
      return `91${digits.slice(1)}`;
    }

    return digits;
  };

  const buildWhatsAppMessage = (
    alert: NotificationRecord,
    memberName: string
  ) => {
    const detail = alert.detail ? ` ${alert.detail}` : "";

    switch (alert.category) {
      case "Dues":
        return `Namaste ${memberName}, aapka dues pending hai.${detail} Kripya payment complete karein.`;
      case "Expiring":
        return `Namaste ${memberName}, aapka plan jaldi expire ho raha hai.${detail} Renewal ke liye gym se sampark karein.`;
      case "Expired":
        return `Namaste ${memberName}, aapka plan expire ho chuka hai.${detail} Renewal ke liye gym se sampark karein.`;
      case "Birthday":
        return `Happy birthday ${memberName}! SG Fitness ki taraf se shubhkamnayein.`;
      case "Payments":
        return `Namaste ${memberName}, payment update: ${alert.title}.${detail}`;
      default:
        return `Namaste ${memberName}, ${alert.title}.${detail}`;
    }
  };

  const handleSendWhatsApp = async (alert: NotificationRecord) => {
    if (sendingId) {
      return;
    }

    setSendError(null);
    setSendingId(alert.id);

    try {
      const memberId = parseMemberIdFromKey(alert.key ?? null);
      const fallbackName = extractMemberNameFromTitle(alert.title);
      const member = memberId ? await getMemberById(memberId) : null;
      const memberName = member?.name ?? fallbackName;
      const phone = member?.phone ? normalizePhoneForWhatsApp(member.phone) : null;

      if (!phone) {
        setSendError("Member phone not available for this notification.");
        return;
      }

      const message = buildWhatsAppMessage(alert, memberName);
      const target = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(target, "_blank", "noopener,noreferrer");
    } catch (sendError) {
      setSendError(
        sendError instanceof Error ? sendError.message : "Unable to send WhatsApp message."
      );
    } finally {
      setSendingId(null);
    }
  };

  const filteredNotifications = useMemo(() => {
    const normalized = searchText.trim().toLowerCase();

    return notifications.filter((item) => {
      const matchesTab = activeTab === "All" || item.category === activeTab;
      if (!matchesTab) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return (
        item.title.toLowerCase().includes(normalized) ||
        item.detail.toLowerCase().includes(normalized)
      );
    });
  }, [notifications, activeTab, searchText]);

  return (
    <div className="glass-panel rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg text-white">Notifications</h3>
          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Live
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <ActionButton
            actionName="Notifications: Mark All Read"
            onClick={async (event) => {
              event.preventDefault();
              await markAllNotificationsRead();
              await refreshNotifications();
            }}
            className="rounded-full border border-white/10 px-2 py-1"
          >
            Mark All Read
          </ActionButton>
          <ActionButton
            actionName="Notifications: Clear All"
            onClick={async (event) => {
              event.preventDefault();
              await clearAllNotifications();
              await refreshNotifications();
            }}
            className="rounded-full border border-white/10 px-2 py-1"
          >
            Clear All
          </ActionButton>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <ActionButton
            key={tab}
            actionName={`Notifications: Filter ${tab}`}
            onClick={(event) => {
              event.preventDefault();
              setActiveTab(tab);
            }}
            className={`rounded-full px-3 py-1 text-xs transition ${
              tab === activeTab
                ? "border border-white/20 bg-white/10 text-white"
                : "border border-white/10 text-slate-300"
            }`}
          >
            {tab}
          </ActionButton>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          className="input-base flex-1 px-3 py-2 text-xs placeholder:text-slate-500"
          placeholder="Search alerts"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <ActionButton
          actionName="Notifications: Clear Search"
          onClick={(event) => {
            event.preventDefault();
            setSearchText("");
          }}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300"
        >
          Clear
        </ActionButton>
      </div>

      {sendError ? (
        <div className="mt-5 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {sendError}
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            No notifications yet.
          </div>
        ) : (
          filteredNotifications.map((alert) => (
            <div
              key={alert.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white">{alert.title}</p>
                  {!alert.read ? (
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  ) : null}
                </div>
                <span className={`text-xs ${toneStyles[alert.tone]}`}>
                  {formatDateTimeDisplay(alert.createdAt)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-300">{alert.detail}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void handleSendWhatsApp(alert);
                    }}
                    disabled={sendingId === alert.id}
                    className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] transition ${
                      sendingId === alert.id
                        ? "border-white/10 bg-white/5 text-slate-500"
                        : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                    }`}
                  >
                    {sendingId === alert.id ? "Sending" : "WhatsApp"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (alert.key) {
                        await markNotificationsReadByKey(alert.key);
                      } else {
                        await markNotificationRead(alert.id);
                      }
                      await refreshNotifications();
                    }}
                    className="text-[10px] uppercase tracking-[0.2em] text-slate-400"
                  >
                    Mark Read
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Link
        href={notificationsHref}
        className="mt-4 inline-flex text-xs text-slate-300"
      >
        See all notifications
      </Link>
    </div>
  );
}
