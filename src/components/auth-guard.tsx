"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({
  role,
  children,
}: {
  role: "admin" | "trainer";
  children: ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedRole = window.localStorage.getItem("authRole");
    const hasAdmin = window.localStorage.getItem("adminAuthed") === "true";
    const trainerCode = window.localStorage.getItem("trainerCode");

    if (role === "admin") {
      if (storedRole === "admin" && hasAdmin) {
        setReady(true);
        return;
      }
    } else {
      if (storedRole === "trainer" && trainerCode) {
        setReady(true);
        return;
      }
    }

    router.replace("/");
  }, [role, router]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
