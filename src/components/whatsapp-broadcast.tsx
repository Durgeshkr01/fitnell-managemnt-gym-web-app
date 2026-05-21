"use client";

import { useState } from "react";

const DEFAULT_GROUP_LINK = "https://chat.whatsapp.com/H7Bg7hXumjhCTJKhYQSFLZ?mode=gi_t";

export default function WhatsAppBroadcast() {
  const [message, setMessage] = useState("");
  const groupLink = DEFAULT_GROUP_LINK.trim();
  const canSend = Boolean(groupLink);
  const qrUrl = groupLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        groupLink
      )}`
    : "";

  const handleOpenGroup = () => {
    if (!canSend) return;
    const target = message.trim()
      ? `${groupLink}?text=${encodeURIComponent(message.trim())}`
      : groupLink;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg text-white">WhatsApp Broadcast</h3>
          <p className="text-sm text-slate-300">
            Group message draft. Click send to open WhatsApp group.
          </p>
        </div>
      </div>

      {!canSend ? (
        <div className="mt-5 rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          WhatsApp group link not set yet.
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type message for WhatsApp group"
            rows={4}
            className="input-base min-h-[120px] w-full rounded-2xl px-4 py-3 text-sm"
          />
          <button
            type="button"
            onClick={handleOpenGroup}
            disabled={!canSend}
            className={`w-full rounded-xl border px-4 py-2 text-sm transition ${
              canSend
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                : "border-white/10 bg-white/5 text-slate-400"
            }`}
          >
            Open WhatsApp Group
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Scan to Join</p>
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="WhatsApp group QR"
              className="mx-auto mt-3 h-44 w-44 rounded-xl border border-white/10 bg-white"
            />
          ) : (
            <p className="mt-4 text-sm text-slate-400">QR available after link set.</p>
          )}
          <p className="mt-3 text-xs text-slate-500">Member ko QR scan karao.</p>
        </div>
      </div>
    </div>
  );
}
