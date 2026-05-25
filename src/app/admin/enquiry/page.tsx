"use client";

import { useEffect, useMemo, useState } from "react";
import AddMemberModal from "@/components/add-member-modal";
import SectionHeader from "@/components/section-header";
import {
  addEnquiry,
  deleteEnquiry,
  getEnquiries,
  markEnquiryJoined,
  type EnquiryRecord,
} from "@/lib/firebase/enquiries";
import { fillTemplate, resolveTemplate } from "@/lib/messages";
import { useMessageTemplates } from "@/lib/use-message-templates";

const buildInitialForm = () => ({
  name: "",
  phone: "",
  notes: "",
});

export default function AdminEnquiryPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(buildInitialForm());
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(
    null
  );
  const { templates } = useMessageTemplates();

  const refreshEnquiries = async () => {
    try {
      const data = await getEnquiries();
      setEnquiries(data);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshEnquiries();
  }, []);

  const openEnquiries = useMemo(
    () => enquiries.filter((item) => item.status === "open"),
    [enquiries]
  );

  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 10) {
      return `91${digits}`;
    }
    return digits;
  };

  const handleGymCard = (enquiry: EnquiryRecord) => {
    const normalized = normalizePhone(enquiry.phone);
    if (!normalized) return;

    const baseUrl = window.location.origin;
    const cardUrl = `${baseUrl}/enquiry-card.png`;
    const message = fillTemplate(resolveTemplate(templates, "enquiryCard"), {
      phone: "8809551534",
      location: "Near Station Supaul",
    });
    const waLink = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
    window.location.href = waLink;
  };

  const handleAddEnquiry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedName = form.name.trim();
    const trimmedPhone = form.phone.trim();

    if (!trimmedName || !trimmedPhone) {
      setError("Name and phone number are required.");
      return;
    }

    if (!/^[0-9+\-()\s]{7,15}$/.test(trimmedPhone)) {
      setError("Enter a valid phone number.");
      return;
    }

    setSaving(true);
    try {
      await addEnquiry({
        name: trimmedName,
        phone: trimmedPhone,
        notes: form.notes.trim() || null,
      });
      setForm(buildInitialForm());
      await refreshEnquiries();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to add enquiry."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (enquiry: EnquiryRecord) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Delete enquiry for ${enquiry.name}? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(enquiry.id);
    setError(null);

    try {
      await deleteEnquiry(enquiry.id);
      setEnquiries((prev) => prev.filter((item) => item.id !== enquiry.id));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete enquiry."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Enquiry 📩" subtitle="Lead tracking and follow-ups." />

      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-display text-lg text-white">Add New Enquiry</h3>
        <p className="text-sm text-slate-300">
          Visitor ka naam aur number add karo. Gym card yahin se bhej sakte ho.
        </p>

        <form className="mt-5 grid gap-4 md:grid-cols-3" onSubmit={handleAddEnquiry}>
          <input
            className="input-base px-3 py-2 text-sm"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            className="input-base px-3 py-2 text-sm"
            placeholder="Phone"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            required
          />
          <input
            className="input-base px-3 py-2 text-sm"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
          <div className="md:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : "Add Enquiry"}
            </button>
            {error ? (
              <span className="text-xs text-rose-200">{error}</span>
            ) : null}
          </div>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-lg text-white">Open Enquiries</h3>
          <p className="text-sm text-slate-300">Pending follow-ups and conversions.</p>
          <div className="mt-5 space-y-4">
            {loading ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Loading enquiries...
              </div>
            ) : openEnquiries.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                No open enquiries yet.
              </div>
            ) : (
              openEnquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">{enquiry.name}</p>
                      <p className="text-xs text-slate-400">{enquiry.phone}</p>
                    </div>
                    <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-amber-200">
                      Open
                    </span>
                  </div>
                  {enquiry.notes ? (
                    <p className="mt-2 text-xs text-slate-300">{enquiry.notes}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleGymCard(enquiry)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-300"
                    >
                      🟢 Gym Card
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEnquiry(enquiry);
                        setMemberModalOpen(true);
                      }}
                      className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-emerald-200"
                    >
                      ✅ Convert to Member
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(enquiry)}
                      disabled={deletingId === enquiry.id}
                      className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === enquiry.id ? "Deleting..." : "🗑️ Delete"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AddMemberModal
        hideTrigger
        isOpen={memberModalOpen}
        onOpenChange={(open) => {
          setMemberModalOpen(open);
          if (!open) {
            setSelectedEnquiry(null);
          }
        }}
        initialValues={
          selectedEnquiry
            ? {
                name: selectedEnquiry.name,
                phone: selectedEnquiry.phone,
                rollNumber: "",
                dateOfBirth: "",
                gender: "Male",
              }
            : undefined
        }
        onSaved={async (memberId) => {
          if (!selectedEnquiry) return;
          await markEnquiryJoined(selectedEnquiry.id, memberId);
          setSelectedEnquiry(null);
          setMemberModalOpen(false);
          await refreshEnquiries();
        }}
      />
    </div>
  );
}
