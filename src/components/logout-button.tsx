"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Logout failed", error);
      }
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("authRole");
      window.localStorage.removeItem("adminAuthed");
      window.localStorage.removeItem("trainerName");
      window.localStorage.removeItem("trainerCode");
      window.localStorage.removeItem("memberId");
      window.localStorage.removeItem("memberPhone");
      window.localStorage.removeItem("memberName");
    }

    router.push("/");
  };

  return (
    <button
      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
      onClick={handleLogout}
      type="button"
    >
      Logout
    </button>
  );
}
