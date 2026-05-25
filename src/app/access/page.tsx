"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, firebaseEnabled } from "@/lib/firebase/client";
import { ensureAnonymousAuth } from "@/lib/firebase/ensure-auth";
import { getMembersByPhone } from "@/lib/firebase/members";

type Role = "admin" | "trainer" | "member";

export default function AccessPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [trainerCode, setTrainerCode] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const headerText = useMemo(
    () =>
      role === "admin"
        ? "Admin Login"
        : role === "trainer"
          ? "Trainer Login"
          : "Member Login",
    [role]
  );

  useEffect(() => {
    const storedRole = window.localStorage.getItem("authRole");
    const hasAdmin = window.localStorage.getItem("adminAuthed") === "true";
    const trainerCodeValue = window.localStorage.getItem("trainerCode");

    if (storedRole === "admin" && hasAdmin) {
      router.replace("/admin");
      return;
    }

    if (storedRole === "trainer" && trainerCodeValue) {
      router.replace("/trainer");
    }

    const memberId = window.localStorage.getItem("memberId");
    if (storedRole === "member" && memberId) {
      router.replace("/member");
    }
  }, [router]);

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

        if (typeof window !== "undefined") {
          window.localStorage.setItem("authRole", "admin");
          window.localStorage.setItem("adminAuthed", "true");
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

      if (role === "member") {
        const phone = memberPhone.trim();
        if (!phone) {
          setError("Mobile number is required.");
          setLoading(false);
          return;
        }

        const members = await getMembersByPhone(phone);
        if (members.length === 0) {
          setError("No member found for this mobile number.");
          setLoading(false);
          return;
        }

        if (typeof window !== "undefined") {
          window.localStorage.setItem("authRole", "member");
          window.localStorage.setItem("memberPhone", phone);
          if (members.length === 1) {
            window.localStorage.setItem("memberId", members[0].id);
            window.localStorage.setItem("memberName", members[0].name ?? "Member");
          } else {
            window.localStorage.removeItem("memberId");
            window.localStorage.setItem("memberName", "Member");
          }
        }

        router.push("/member");
        return;
      }

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
        window.localStorage.setItem("authRole", "trainer");
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

      <main className="relative mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16">
        <header className="glass-panel-strong neon-border animate-fade-up rounded-3xl p-8 md:p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-[0_0_24px_rgba(64,107,255,0.35)]">
              <Image
                src="/logo.svg"
                alt="SG FITNESS EVOLUTION"
                width={40}
                height={40}
                className="h-full w-full object-contain p-2"
                priority
              />
            </div>
            <h1 className="font-display text-2xl font-semibold text-white md:text-4xl">
              Access Portal
            </h1>
            <p className="text-sm text-slate-300">
              Choose your role to continue.
            </p>
          </div>
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
              <button
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  role === "member"
                    ? "border border-white/20 bg-white/10 text-white"
                    : "border border-white/10 text-slate-300"
                }`}
                type="button"
                onClick={() => setRole("member")}
              >
                Member
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
                    placeholder="Enter password"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                {role === "trainer" ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Mobile Number
                    </label>
                    <input
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      value={memberPhone}
                      onChange={(event) => setMemberPhone(event.target.value)}
                      placeholder="Enter mobile number"
                      type="tel"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      Login with the mobile number registered by admin.
                    </p>
                  </>
                )}
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
