import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
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

const CHECKOUT_AFTER_MINUTES = 90;

export type AttendanceRecord = {
  id: string;
  memberId: string;
  memberName: string;
  rollNumber?: string | null;
  status: "in" | "out";
  checkInAt?: string | null;
  checkOutAt?: string | null;
  checkedInBy?: "admin" | "trainer" | null;
};

const mapAttendance = (docSnap: QueryDocumentSnapshot<DocumentData>) => {
  const data = docSnap.data();
  const checkInAt = data.checkInAt as Timestamp | undefined;
  const checkOutAt = data.checkOutAt as Timestamp | undefined;

  return {
    id: docSnap.id,
    memberId: String(data.memberId ?? ""),
    memberName: String(data.memberName ?? "Member"),
    rollNumber: typeof data.rollNumber === "string" ? data.rollNumber : null,
    status: data.status === "out" ? "out" : "in",
    checkInAt: checkInAt ? checkInAt.toDate().toISOString() : null,
    checkOutAt: checkOutAt ? checkOutAt.toDate().toISOString() : null,
    checkedInBy:
      data.checkedInBy === "trainer" || data.checkedInBy === "admin"
        ? data.checkedInBy
        : null,
  } satisfies AttendanceRecord;
};

const ensureReady = async (): Promise<Firestore> => {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }
  await ensureAnonymousAuth();
  return db;
};

const chunkList = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

export async function getActiveAttendance() {
  const firestore = await ensureReady();
  const attendanceQuery = query(
    collection(firestore, "attendance"),
    where("status", "==", "in"),
    orderBy("checkInAt", "desc")
  );
  const snapshot = await getDocs(attendanceQuery);
  return snapshot.docs.map(mapAttendance);
}

export async function getTodayAttendance() {
  const firestore = await ensureReady();
  const attendanceQuery = query(
    collection(firestore, "attendance"),
    orderBy("checkInAt", "desc"),
    limit(100)
  );
  const snapshot = await getDocs(attendanceQuery);
  return snapshot.docs.map(mapAttendance);
}

export async function getAttendanceByMember(memberId: string) {
  const trimmedId = memberId.trim();
  if (!trimmedId) {
    return [];
  }

  const firestore = await ensureReady();
  const attendanceQuery = query(
    collection(firestore, "attendance"),
    where("memberId", "==", trimmedId),
    orderBy("checkInAt", "desc")
  );
  const snapshot = await getDocs(attendanceQuery);
  return snapshot.docs.map(mapAttendance);
}

export async function checkInMember(params: {
  memberId: string;
  memberName: string;
  rollNumber?: string | null;
  checkedInBy: "admin" | "trainer";
}) {
  const firestore = await ensureReady();

  const existingQuery = query(
    collection(firestore, "attendance"),
    where("memberId", "==", params.memberId),
    where("status", "==", "in"),
    limit(1)
  );
  const existing = await getDocs(existingQuery);
  if (!existing.empty) {
    return mapAttendance(existing.docs[0]);
  }

  const docRef = await addDoc(collection(firestore, "attendance"), {
    memberId: params.memberId,
    memberName: params.memberName,
    rollNumber: params.rollNumber ?? null,
    status: "in",
    checkedInBy: params.checkedInBy,
    checkInAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  const created = await getDocs(
    query(
      collection(firestore, "attendance"),
      where("__name__", "==", docRef.id)
    )
  );
  return created.docs.length ? mapAttendance(created.docs[0]) : null;
}

export async function checkOutMember(attendanceId: string) {
  const firestore = await ensureReady();

  const trimmedId = attendanceId.trim();
  if (!trimmedId) {
    throw new Error("Attendance ID is required");
  }

  await updateDoc(doc(firestore, "attendance", trimmedId), {
    status: "out",
    checkOutAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAttendanceRecords(recordIds: string[]) {
  if (!recordIds.length) {
    return;
  }

  const firestore = await ensureReady();

  const trimmedIds = recordIds.map((id) => id.trim()).filter(Boolean);
  if (!trimmedIds.length) {
    return;
  }

  const batches = chunkList(trimmedIds, 450);

  for (const batchIds of batches) {
    const batch = writeBatch(firestore);
    batchIds.forEach((id) => {
      batch.delete(doc(firestore, "attendance", id));
    });
    await batch.commit();
  }
}

export async function deleteAttendanceRecord(recordId: string) {
  const trimmedId = recordId.trim();
  if (!trimmedId) {
    return;
  }

  const firestore = await ensureReady();
  await deleteDoc(doc(firestore, "attendance", trimmedId));
}

export async function autoCheckoutStale() {
  await ensureReady();

  const active = await getActiveAttendance();
  const now = Date.now();
  const cutoffMs = CHECKOUT_AFTER_MINUTES * 60 * 1000;

  const stale = active.filter((record) => {
    if (!record.checkInAt) return false;
    const checkIn = new Date(record.checkInAt).getTime();
    return now - checkIn >= cutoffMs;
  });

  for (const record of stale) {
    await checkOutMember(record.id);
  }

  return stale.length;
}
