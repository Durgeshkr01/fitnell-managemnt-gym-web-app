import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db, firebaseEnabled } from "./client";
import { ensureAnonymousAuth } from "./ensure-auth";

export type NotificationCategory =
  | "Birthday"
  | "Expiring"
  | "Expired"
  | "Dues"
  | "Payments"
  | "Attendance"
  | "General";

export type NotificationTone = "warning" | "success" | "danger" | "info" | "neutral";

export type NotificationRecord = {
  id: string;
  title: string;
  detail: string;
  category: NotificationCategory;
  tone: NotificationTone;
  read: boolean;
  key?: string | null;
  createdAt?: string | null;
};

type NotificationInput = {
  title: string;
  detail: string;
  category?: NotificationCategory;
  tone?: NotificationTone;
  key?: string | null;
};

const mapNotification = (docSnap: QueryDocumentSnapshot<DocumentData>) => {
  const data = docSnap.data();
  const createdAt = data.createdAt as Timestamp | undefined;

  return {
    id: docSnap.id,
    title: String(data.title ?? "Notification"),
    detail: String(data.detail ?? ""),
    category: (data.category as NotificationCategory) ?? "General",
    tone: (data.tone as NotificationTone) ?? "neutral",
    read: Boolean(data.read),
    key: typeof data.key === "string" ? data.key : null,
    createdAt: createdAt ? createdAt.toDate().toISOString() : null,
  } satisfies NotificationRecord;
};

const ensureReady = async (): Promise<Firestore> => {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  await ensureAnonymousAuth();
  return db;
};

const ensureReadyOptional = async (): Promise<Firestore | null> => {
  if (!firebaseEnabled || !db) {
    return null;
  }

  await ensureAnonymousAuth();
  return db;
};

export async function addNotification(input: NotificationInput) {
  const firestore = await ensureReadyOptional();
  if (!firestore) {
    return;
  }

  return addDoc(collection(firestore, "notifications"), {
    title: input.title,
    detail: input.detail,
    category: input.category ?? "General",
    tone: input.tone ?? "neutral",
    key: input.key ?? null,
    read: false,
    createdAt: serverTimestamp(),
  });
}

const createKeyedNotificationIfMissing = async (input: NotificationInput) => {
  const trimmedKey = input.key?.trim();
  if (!trimmedKey) {
    await addNotification({ ...input, key: null });
    return;
  }

  const firestore = await ensureReadyOptional();
  if (!firestore) {
    return;
  }

  await runTransaction(firestore, async (transaction) => {
    const ref = doc(firestore, "notifications", trimmedKey);
    const existing = await transaction.get(ref);
    if (existing.exists()) {
      return;
    }

    transaction.set(ref, {
      title: input.title,
      detail: input.detail,
      category: input.category ?? "General",
      tone: input.tone ?? "neutral",
      key: trimmedKey,
      read: false,
      createdAt: serverTimestamp(),
    });
  });
};

export async function getNotifications(maxCount = 60) {
  const firestore = await ensureReady();

  const notificationsQuery = query(
    collection(firestore, "notifications"),
    orderBy("createdAt", "desc"),
    limit(maxCount)
  );
  const snapshot = await getDocs(notificationsQuery);
  return snapshot.docs.map(mapNotification);
}

export async function getUnreadNotificationsCount() {
  const firestore = await ensureReady();

  const unreadQuery = query(
    collection(firestore, "notifications"),
    where("read", "==", false)
  );
  const snapshot = await getDocs(unreadQuery);
  return snapshot.size;
}

export async function markAllNotificationsRead() {
  const firestore = await ensureReady();

  const unreadQuery = query(
    collection(firestore, "notifications"),
    where("read", "==", false)
  );
  const snapshot = await getDocs(unreadQuery);
  if (snapshot.empty) {
    return;
  }

  const batch = writeBatch(firestore);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });
  await batch.commit();
}

export async function clearAllNotifications() {
  const firestore = await ensureReady();

  const snapshot = await getDocs(query(collection(firestore, "notifications")));
  if (snapshot.empty) {
    return;
  }

  const batch = writeBatch(firestore);
  snapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();
}

export async function markNotificationRead(notificationId: string) {
  const trimmedId = notificationId.trim();
  if (!trimmedId) {
    return;
  }

  const firestore = await ensureReady();
  await updateDoc(doc(firestore, "notifications", trimmedId), { read: true });
}

export async function markNotificationsReadByKey(notificationKey: string) {
  const trimmedKey = notificationKey.trim();
  if (!trimmedKey) {
    return;
  }

  const firestore = await ensureReady();

  const keyedQuery = query(
    collection(firestore, "notifications"),
    where("key", "==", trimmedKey)
  );
  const snapshot = await getDocs(keyedQuery);
  if (snapshot.empty) {
    return;
  }

  const batch = writeBatch(firestore);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });
  await batch.commit();
}

const chunkList = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const buildKeySet = async (keys: string[]) => {
  if (keys.length === 0) {
    return new Set<string>();
  }

  const firestore = await ensureReadyOptional();
  if (!firestore) {
    return new Set<string>();
  }

  const keySet = new Set<string>();
  const batches = chunkList(keys, 10);

  for (const batchKeys of batches) {
    const snapshot = await getDocs(
      query(collection(firestore, "notifications"), where("key", "in", batchKeys))
    );
    snapshot.docs.forEach((docSnap) => {
      const key = docSnap.data().key;
      if (typeof key === "string") {
        keySet.add(key);
      }
    });
  }

  return keySet;
};

const parseDuesAmount = (dues: string) => {
  const raw = String(dues ?? "").replace(/[^0-9.]/g, "");
  const amount = Number(raw);
  return Number.isNaN(amount) ? 0 : amount;
};

export async function syncMemberNotifications(members: {
  id: string;
  name?: string | null;
  rollNumber?: string | null;
  status?: string | null;
  dues?: string | null;
  planEndDate?: string | null;
}[]) {
  const firestore = await ensureReadyOptional();
  if (!firestore) {
    return;
  }

  const items: NotificationInput[] = [];

  members.forEach((member) => {
    const name = member.name ?? "Member";
    const roll = member.rollNumber ? ` (Roll ${member.rollNumber})` : "";

    if (member.status === "Expiring Soon") {
      const key = `expiring:${member.id}:${member.planEndDate ?? "--"}`;
      items.push({
        title: `Expiring soon: ${name}${roll}`,
        detail: `Plan ends on ${member.planEndDate ?? "--"}`,
        category: "Expiring",
        tone: "warning",
        key,
      });
    }

    if (member.status === "Expired") {
      const key = `expired:${member.id}:${member.planEndDate ?? "--"}`;
      items.push({
        title: `Expired plan: ${name}${roll}`,
        detail: `Plan expired on ${member.planEndDate ?? "--"}`,
        category: "Expired",
        tone: "danger",
        key,
      });
    }

    const duesAmount = parseDuesAmount(member.dues ?? "");
    if (duesAmount > 0) {
      const key = `dues:${member.id}:${duesAmount}`;
      items.push({
        title: `Dues pending: ${name}${roll}`,
        detail: `Pending amount ₹${duesAmount}`,
        category: "Dues",
        tone: "warning",
        key,
      });
    }
  });

  if (items.length === 0) {
    return;
  }

  const keys = items.map((item) => item.key).filter(Boolean) as string[];
  const existingKeys = await buildKeySet(keys);

  const pending = items.filter((item) => !item.key || !existingKeys.has(item.key));
  for (const item of pending) {
    await createKeyedNotificationIfMissing(item);
  }
}
