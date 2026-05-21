"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, firebaseEnabled } from "@/lib/firebase/client";
import { ensureAnonymousAuth } from "@/lib/firebase/ensure-auth";

type Role = "admin" | "trainer";

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [trainerCode, setTrainerCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const headerText = useMemo(
    () => (role === "admin" ? "Admin Login" : "Trainer Login"),
    [role]
  );

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    setLoading(true);

    try {
      if (role === "admin") {
        const adminEmail = "admin@gmail.com";
        const adminPassword = "Vivek Babu";

        if (email.trim() !== adminEmail || password !== adminPassword) {
          setError("Invalid admin credentials.");
          setLoading(false);
          return;
        }

        router.push("/admin");
        return;
      }

      if (!firebaseEnabled) {
        setError("Firebase is not configured yet.");
        setLoading(false);
        return;
      }

      if (!db) {
        throw new Error("Database is not available.");
      }

      await ensureAnonymousAuth();


      const code = trainerCode.trim();
      if (!code) {
        setError("Trainer code is required.");
        setLoading(false);
        return;
      }

      const codesRef = collection(db, "trainerCodes");
      const codesQuery = query(codesRef, where("code", "==", code));
      const snapshot = await getDocs(codesQuery);

      const activeMatch = snapshot.docs.find((doc) => doc.data().active === true);
      if (!activeMatch) {
        setError("Invalid or inactive trainer code.");
        setLoading(false);
        return;
      }

      const trainerName = String(activeMatch.data().trainerName ?? "").trim();
      if (typeof window !== "undefined") {
        window.localStorage.setItem("trainerName", trainerName);
        window.localStorage.setItem("trainerCode", code);
      }

      router.push("/trainer");
    } catch (loginError) {
      const message =
        loginError instanceof Error
          ? loginError.message
          : "Login failed. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[color:var(--accent)] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-[color:var(--accent-2)] opacity-20 blur-3xl" />

      <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="glass-panel-strong neon-border animate-fade-up rounded-3xl p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Image
                src="/logo.svg"
                alt="SG FITNESS EVOLUTION"
                width={36}
                height={36}
                className="h-full w-full object-contain p-1"
                priority
              />
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              SG FITNESS EVOLUTION
            </p>
          </div>
          <h1 className="font-display mt-5 text-3xl font-semibold leading-tight text-white md:text-5xl">
            Gym Management System
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Admin and trainer dashboards for member management, payments,
            attendance, and AI-driven reminders.
          </p>
        </header>

        <div className="glass-panel rounded-3xl p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Access
              </p>
              <h2 className="font-display mt-2 text-2xl text-white">
                {headerText}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  role === "admin"
                    ? "border border-white/20 bg-white/10 text-white"
                    : "border border-white/10 text-slate-300"
                }`}
                type="button"
                onClick={() => setRole("admin")}
              >
                Admin
              </button>
              <button
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  role === "trainer"
                    ? "border border-white/20 bg-white/10 text-white"
                    : "border border-white/10 text-slate-300"
                }`}
                type="button"
                onClick={() => setRole("trainer")}
              >
                Trainer
              </button>
            </div>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
            {role === "admin" ? (
              <>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Admin Email
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="admin@gmail.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Password
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    placeholder="Vivek Babu"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Trainer Code
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  value={trainerCode}
                  onChange={(event) => setTrainerCode(event.target.value)}
                  placeholder="Enter trainer code"
                  required
                />
                <p className="mt-2 text-xs text-slate-400">
                  Trainer code is assigned and activated by admin.
                </p>
              </div>
            )}

            {error ? (
              <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              className="rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm text-white disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
