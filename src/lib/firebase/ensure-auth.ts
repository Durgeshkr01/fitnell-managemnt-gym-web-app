import { signInAnonymously } from "firebase/auth";
import { auth, firebaseEnabled } from "./client";

export async function ensureAnonymousAuth() {
  if (!firebaseEnabled || !auth) {
    throw new Error("Firebase Auth is not available.");
  }

  if (auth.currentUser) {
    return auth.currentUser;
  }

  const result = await signInAnonymously(auth);
  return result.user;
}
