"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db, firebaseEnabled } from "@/lib/firebase/client";
import {
  createTrainerCode,
  deleteTrainerCode,
  toggleTrainerCode,
  type TrainerCodeRecord,
} from "@/lib/firebase/trainer-codes";
import { useAction } from "./action-provider";
import { ensureAnonymousAuth } from "@/lib/firebase/ensure-auth";

const emptyForm = {
  code: "",
  trainerName: "",
};

export default function TrainerCodeManager() {
  const { runAction } = useAction();
  const [form, setForm] = useState(emptyForm);
  const [codes, setCodes] = useState<TrainerCodeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const configError = !firebaseEnabled || !db ? "Firebase is not configured." : null;

  useEffect(() => {
    if (configError) {
      return;
    }

    if (!db) {
      setInitError("Database is not available.");
      return;
    }

    let unsubscribe: (() => void) | null = null;

    ensureAnonymousAuth()
      .then(() => {
        const codesRef = collection(db, "trainerCodes");
        const codesQuery = query(codesRef, orderBy("createdAt", "desc"));
        unsubscribe = onSnapshot(
          codesQuery,
          (snapshot) => {
            const next = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                code: String(data.code ?? ""),
                trainerName: data.trainerName
                  ? String(data.trainerName)
                  : null,
                active: Boolean(data.active),
              } as TrainerCodeRecord;
            });
            setCodes(next);
          },
          (snapshotError) => {
            setInitError(snapshotError.message);
          }
        );
      })
      .catch((authError) => {
        const message =
          authError instanceof Error
            ? authError.message
            : "Firebase auth failed.";
        setInitError(message);
      });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [configError]);

  const memberCountLabel = useMemo(() => {
    if (codes.length === 0) {
      return "No codes assigned yet.";
    }
    return `${codes.length} trainer code(s)`;
  }, [codes.length]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const code = form.code.trim();
    if (!code) {
      setError("Trainer code is required.");
      return;
    }

    setLoading(true);

    try {
      await createTrainerCode({
        code,
        trainerName: form.trainerName.trim() || null,
      });
      runAction("Trainer Code: Create", {
        code,
        trainerName: form.trainerName.trim() || null,
      });
      setForm(emptyForm);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to create trainer code.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (record: TrainerCodeRecord) => {
    if (busyIds.includes(record.id) || deletingId === record.id) {
      return;
    }

    setBusyIds((prev) => [...prev, record.id]);

    try {
      await toggleTrainerCode(record.id, !record.active);
      runAction("Trainer Code: Toggle", {
        code: record.code,
        active: !record.active,
      });
    } catch (toggleError) {
      const message =
        toggleError instanceof Error
          ? toggleError.message
          : "Failed to update trainer code.";
      setError(message);
    } finally {
      setBusyIds((prev) => prev.filter((id) => id !== record.id));
    }
  };

  const handleDelete = async (record: TrainerCodeRecord) => {
    if (deletingId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete trainer code ${record.code}? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(record.id);
    setError(null);

    try {
      await deleteTrainerCode(record.id);
      runAction("Trainer Code: Delete", {
        code: record.code,
      });
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete trainer code.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-display text-lg text-white">Assign Trainer Code</h3>
        <p className="text-sm text-slate-300">
          Code once assigned stays fixed until you deactivate it.
        </p>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Trainer Code
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.code}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, code: event.target.value }))
                }
                placeholder="Enter code"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Trainer Name (optional)
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                value={form.trainerName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, trainerName: event.target.value }))
                }
                placeholder="Trainer name"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end">
            <button
              className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Saving..." : "Assign Code"}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg text-white">Trainer Codes</h3>
            <p className="text-sm text-slate-300">{memberCountLabel}</p>
          </div>
        </div>

        {configError || initError ? (
          <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {configError ?? initError}
          </div>
        ) : null}

        <div className="mt-4 space-y-3 text-sm">
          {codes.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              No trainer codes yet.
            </div>
          ) : (
            codes.map((record) => (
              <div
                key={record.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-white">{record.code}</p>
                  <p className="text-xs text-slate-400">
                    {record.trainerName || "Trainer"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${
                      record.active
                        ? "border-emerald-400/30 text-emerald-300"
                        : "border-rose-400/30 text-rose-300"
                    }`}
                  >
                    {record.active ? "Active" : "Inactive"}
                  </span>
                  <button
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 disabled:opacity-60"
                    onClick={() => handleToggle(record)}
                    type="button"
                    disabled={busyIds.includes(record.id)}
                  >
                    {record.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 disabled:opacity-60"
                    onClick={() => handleDelete(record)}
                    type="button"
                    disabled={deletingId === record.id}
                  >
                    {deletingId === record.id ? "Deleting" : "Delete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
