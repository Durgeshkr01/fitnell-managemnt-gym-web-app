import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db, firebaseEnabled } from "./client";
import { ensureAnonymousAuth } from "./ensure-auth";

export type EnquiryRecord = {
  id: string;
  name: string;
  phone: string;
  notes?: string | null;
  status: "open" | "joined";
  createdAt?: string | null;
  joinedAt?: string | null;
  memberId?: string | null;
};

type EnquiryInput = {
  name: string;
  phone: string;
  notes?: string | null;
};

const mapEnquiry = (docSnap: QueryDocumentSnapshot<DocumentData>) => {
  const data = docSnap.data();
  const createdAt = data.createdAt as Timestamp | undefined;
  const joinedAt = data.joinedAt as Timestamp | undefined;

  return {
    id: docSnap.id,
    name: String(data.name ?? "Unnamed"),
    phone: String(data.phone ?? ""),
    notes: typeof data.notes === "string" ? data.notes : null,
    status: data.status === "joined" ? "joined" : "open",
    createdAt: createdAt ? createdAt.toDate().toISOString() : null,
    joinedAt: joinedAt ? joinedAt.toDate().toISOString() : null,
    memberId: typeof data.memberId === "string" ? data.memberId : null,
  } satisfies EnquiryRecord;
};

export async function addEnquiry(input: EnquiryInput) {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  await ensureAnonymousAuth();

  const trimmedName = input.name.trim();
  const trimmedPhone = input.phone.trim();

  return addDoc(collection(db, "enquiries"), {
    name: trimmedName,
    phone: trimmedPhone,
    notes: input.notes?.trim() || null,
    status: "open",
    createdAt: serverTimestamp(),
  });
}

export async function getEnquiries() {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  await ensureAnonymousAuth();

  const enquiriesQuery = query(
    collection(db, "enquiries"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(enquiriesQuery);
  return snapshot.docs.map(mapEnquiry);
}

export async function markEnquiryJoined(enquiryId: string, memberId?: string) {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  const trimmedId = enquiryId.trim();
  if (!trimmedId) {
    throw new Error("Enquiry ID is required");
  }

  await ensureAnonymousAuth();

  await updateDoc(doc(db, "enquiries", trimmedId), {
    status: "joined",
    joinedAt: serverTimestamp(),
    memberId: memberId ?? null,
  });
}

export async function deleteEnquiry(enquiryId: string) {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  const trimmedId = enquiryId.trim();
  if (!trimmedId) {
    throw new Error("Enquiry ID is required");
  }

  await ensureAnonymousAuth();
  await deleteDoc(doc(db, "enquiries", trimmedId));
}
