"use client";

import { useEffect, useMemo, useState } from "react";
import SectionHeader from "@/components/section-header";
import {
  defaultMessageTemplates,
  messageTemplateKeys,
  messageTemplateLabels,
  messageTemplateVariables,
  type MessageTemplateKey,
  type MessageTemplates,
} from "@/lib/messages";
import {
  getMessageTemplates,
  saveMessageTemplates,
} from "@/lib/firebase/message-templates";
import { clearMessageTemplatesCache } from "@/lib/use-message-templates";

const buildTemplateList = () =>
  messageTemplateKeys.map((key) => ({
    key,
    label: messageTemplateLabels[key],
    variables: messageTemplateVariables[key],
  }));

export default function AdminMessageSettingsPage() {
  const templateList = useMemo(() => buildTemplateList(), []);
  const [templates, setTemplates] = useState<MessageTemplates>(defaultMessageTemplates);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getMessageTemplates()
      .then((data) => {
        if (mounted) {
          setTemplates(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setTemplates(defaultMessageTemplates);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (key: MessageTemplateKey, value: string) => {
    setTemplates((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setTemplates(defaultMessageTemplates);
    setStatus("Templates reset to default.");
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      await saveMessageTemplates(templates);
      clearMessageTemplatesCache();
      setStatus("Templates saved successfully.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Failed to save templates."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Message Templates"
        subtitle="WhatsApp messages ko yahin se Hinglish me set karo."
      />

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg text-white">Templates</h3>
            <p className="text-sm text-slate-300">
              Variables ko {"{{ }}"} me use karo. Example: {"{{name}}"}, {"{{planEnd}}"}.
            </p>
            <p className="text-xs text-slate-400">
              Save ke baad naya template turant apply dekhne ke liye page reload kar lein.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
            >
              Reset Default
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Templates"}
            </button>
          </div>
        </div>

        {status ? (
          <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {status}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Loading templates...
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {templateList.map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-white">{item.label}</p>
                    <p className="text-xs text-slate-400">
                      Variables: {item.variables.map((value) => `{{${value}}}`).join(", ")}
                    </p>
                  </div>
                </div>
                <textarea
                  className="mt-3 min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
                  value={templates[item.key]}
                  onChange={(event) => handleChange(item.key, event.target.value)}
                  placeholder={messageTemplateLabels[item.key]}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
