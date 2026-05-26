import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, firebaseEnabled } from "./client";

type ActionMetadata = Record<string, unknown>;

export async function logAction(action: string, metadata?: ActionMetadata) {
  if (!firebaseEnabled || !db) {
    return;
  }

  try {
    await addDoc(collection(db, "activityLogs"), {
      action,
      metadata: metadata ?? null,
      createdAt: serverTimestamp(),
      source: "web",
    });
    // Notification logging removed
  } catch (error) {
    console.error("Failed to log action", error);
  }
}
