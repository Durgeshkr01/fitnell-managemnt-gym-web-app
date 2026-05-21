import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, firebaseEnabled } from "./client";
import { addNotification, type NotificationCategory, type NotificationTone } from "./notifications";

type ActionMetadata = Record<string, unknown>;

const buildNotificationPayload = (action: string, metadata?: ActionMetadata) => {
  const lower = action.toLowerCase();
  let category: NotificationCategory = "General";
  let tone: NotificationTone = "neutral";

  if (lower.includes("dues")) {
    category = "Dues";
    tone = "warning";
  } else if (lower.includes("payment")) {
    category = "Payments";
    tone = "success";
  } else if (lower.includes("attendance") || lower.includes("check")) {
    category = "Attendance";
    tone = "info";
  } else if (lower.includes("expiring")) {
    category = "Expiring";
    tone = "warning";
  } else if (lower.includes("expired")) {
    category = "Expired";
    tone = "danger";
  } else if (lower.includes("birthday")) {
    category = "Birthday";
    tone = "success";
  }

  const detailParts: string[] = [];
  if (metadata?.name) {
    detailParts.push(`Member: ${metadata.name}`);
  }
  if (metadata?.memberName) {
    detailParts.push(`Member: ${metadata.memberName}`);
  }
  if (metadata?.amount) {
    detailParts.push(`Amount: ${metadata.amount}`);
  }

  const detail = detailParts.length ? detailParts.join(" | ") : "Activity update";

  return {
    title: action || "Activity",
    detail,
    category,
    tone,
  };
};

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
    await addNotification(buildNotificationPayload(action, metadata));
  } catch (error) {
    console.error("Failed to log action", error);
  }
}
