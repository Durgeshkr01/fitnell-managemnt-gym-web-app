import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db, firebaseEnabled } from "./client";
import { ensureAnonymousAuth } from "./ensure-auth";

type PaymentInput = {
  memberId: string;
  memberName: string;
  rollNumber?: string | null;
  amount: number;
  type: "Payment Update" | "Dues Clear";
  paidOn: string;
};

export type PaymentRecord = PaymentInput & {
  id: string;
  createdAt?: string | null;
};

const mapPayment = (doc: QueryDocumentSnapshot<DocumentData>) => {
  const data = doc.data();
  const createdAt = data.createdAt as Timestamp | undefined;

  return {
    id: doc.id,
    memberId: String(data.memberId ?? ""),
    memberName: String(data.memberName ?? "Member"),
    rollNumber: typeof data.rollNumber === "string" ? data.rollNumber : null,
    amount: typeof data.amount === "number" ? data.amount : 0,
    type: data.type === "Dues Clear" ? "Dues Clear" : "Payment Update",
    paidOn: String(data.paidOn ?? ""),
    createdAt: createdAt ? createdAt.toDate().toISOString() : null,
  } satisfies PaymentRecord;
};

export async function addPaymentRecord(input: PaymentInput) {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  await ensureAnonymousAuth();

  return addDoc(collection(db, "payments"), {
    memberId: input.memberId,
    memberName: input.memberName,
    rollNumber: input.rollNumber ?? null,
    amount: input.amount,
    type: input.type,
    paidOn: input.paidOn,
    createdAt: serverTimestamp(),
  });
}

export async function getPayments() {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  await ensureAnonymousAuth();

  const paymentsQuery = query(
    collection(db, "payments"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(paymentsQuery);
  return snapshot.docs.map(mapPayment);
}

export async function deletePayment(paymentId: string) {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  const trimmedId = paymentId.trim();
  if (!trimmedId) {
    throw new Error("Payment ID is required");
  }

  await ensureAnonymousAuth();
  await deleteDoc(doc(db, "payments", trimmedId));
}
