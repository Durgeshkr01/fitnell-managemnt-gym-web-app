import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type QueryConstraint,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
  type Timestamp,
  where,
} from "firebase/firestore";
import { db, firebaseEnabled } from "./client";
import { ensureAnonymousAuth } from "./ensure-auth";

type MemberInput = {
  name: string;
  rollNumber?: string | null;
  gender: "Male" | "Female";
  dateOfBirth?: string | null;
  phone: string;
  trainerCode?: string | null;
  dues?: string | null;
  joinDate?: string | null;
  planStartDate?: string | null;
  planEndDate?: string | null;
  planName?: string | null;
  planAmount?: number | null;
  planDurationDays?: number | null;
};

export type MemberRecord = {
  id: string;
  name: string;
  rollNumber?: string | null;
  gender?: "Male" | "Female" | null;
  status: string;
  expiry: string;
  dues: string;
  trainerCode?: string | null;
  joinDate?: string | null;
  planStartDate?: string | null;
  planEndDate?: string | null;
  planName?: string | null;
  planAmount?: number | null;
  planDurationDays?: number | null;
  isNewAdmission?: boolean;
  dateOfBirth?: string | null;
  phone?: string;
};

const ensureReady = async (): Promise<Firestore> => {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  await ensureAnonymousAuth();
  return db;
};

const normalizePhone = (value: string) => value.replace(/\D/g, "");

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const isoMatch = value.match(/^\d{4}-\d{2}-\d{2}$/);
  if (isoMatch) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const displayMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (displayMatch) {
    const day = Number(displayMatch[1]);
    const month = Number(displayMatch[2]);
    const year = Number(displayMatch[3]);
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    if (date.getDate() !== day || date.getMonth() !== month - 1) {
      return null;
    }
    return date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDateValue(value: unknown) {
  if (!value) {
    return { date: null, iso: null };
  }

  if (typeof value === "string") {
    const parsed = parseDate(value);
    return {
      date: parsed,
      iso: parsed ? toDateInputValue(parsed) : null,
    };
  }

  if (typeof value === "object" && "toDate" in value) {
    const timestamp = value as Timestamp;
    if (typeof timestamp.toDate === "function") {
      const date = timestamp.toDate();
      return {
        date,
        iso: toDateInputValue(date),
      };
    }
  }

  return { date: null, iso: null };
}

function addOneMonth(date: Date) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getSixMonthsAgo() {
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  return date;
}

async function purgeExpiredMembers() {
  const firestore = await ensureReady();

  const cutoff = toDateInputValue(getSixMonthsAgo());
  const filters: QueryConstraint[] = [where("planEndDate", "<", cutoff)];
  const snapshot = await getDocs(
    query(collection(firestore, "members"), ...filters)
  );

  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(firestore, "members", docSnap.id));
  }
}

export async function addMember(input: MemberInput) {
  const firestore = await ensureReady();

  const today = new Date();
  const joinDate = input.joinDate?.trim() || toDateInputValue(today);
  const planStartDate = input.planStartDate?.trim() || joinDate;
  const parsedStart = parseDate(planStartDate) ?? today;
  const planEndDate =
    input.planEndDate?.trim() || toDateInputValue(addOneMonth(parsedStart));

  return addDoc(collection(firestore, "members"), {
    name: input.name,
    rollNumber: input.rollNumber?.trim() || null,
    gender: input.gender,
    dateOfBirth: input.dateOfBirth?.trim() || null,
    phone: input.phone,
    trainerCode: input.trainerCode?.trim() || null,
    dues: input.dues ?? "0",
    joinDate,
    planStartDate,
    planEndDate,
    planName: input.planName?.trim() || null,
    planAmount: typeof input.planAmount === "number" ? input.planAmount : 500,
    planDurationDays:
      typeof input.planDurationDays === "number" ? input.planDurationDays : null,
    createdAt: serverTimestamp(),
    status: "active",
  });
}

function mapMemberData(id: string, data: DocumentData) {
  const planEndParsed = parseDateValue(data.planEndDate);
  const planEndDate = planEndParsed.iso ??
    (typeof data.planEndDate === "string" ? data.planEndDate : null);
  const parsedEnd = planEndParsed.date;
  const now = new Date();
  const status = typeof data.status === "string" ? data.status : "active";
  const derivedStatus = parsedEnd
    ? parsedEnd < now
      ? "expired"
      : parsedEnd.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000
        ? "expiring"
        : "active"
    : status;
  const joinParsed = parseDateValue(data.joinDate);
  const joinDate = joinParsed.iso ??
    (typeof data.joinDate === "string" ? data.joinDate : null);
  const parsedJoin = joinParsed.date;
  const isNewAdmission = parsedJoin
    ? now.getTime() - parsedJoin.getTime() <= 7 * 24 * 60 * 60 * 1000
    : false;
  const dobParsed = parseDateValue(data.dateOfBirth);
  const dateOfBirth = dobParsed.iso ??
    (typeof data.dateOfBirth === "string" ? data.dateOfBirth : null);

  return {
    id,
    name: data.name ?? "Unnamed",
    rollNumber: typeof data.rollNumber === "string" ? data.rollNumber : null,
    gender:
      data.gender === "Male" || data.gender === "Female" ? data.gender : null,
    status:
      derivedStatus === "active"
        ? "Active"
        : derivedStatus === "expired"
          ? "Expired"
          : derivedStatus === "expiring"
            ? "Expiring Soon"
            : String(derivedStatus),
    expiry: planEndDate ?? data.expiry ?? "--",
    dues: data.dues ?? "--",
    trainerCode: typeof data.trainerCode === "string" ? data.trainerCode : null,
    joinDate,
    planStartDate: typeof data.planStartDate === "string" ? data.planStartDate : null,
    planEndDate,
    planName: typeof data.planName === "string" ? data.planName : null,
    planAmount: typeof data.planAmount === "number" ? data.planAmount : null,
    planDurationDays:
      typeof data.planDurationDays === "number" ? data.planDurationDays : null,
    isNewAdmission,
    dateOfBirth,
    phone: typeof data.phone === "string" ? data.phone : undefined,
  } satisfies MemberRecord;
}

function mapMember(doc: QueryDocumentSnapshot<DocumentData>) {
  return mapMemberData(doc.id, doc.data());
}

export async function getMembers() {
  const firestore = await ensureReady();

  await purgeExpiredMembers();

  const membersQuery = query(
    collection(firestore, "members"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(membersQuery);
  return snapshot.docs.map(mapMember);
}

export async function getMembersByTrainerCode(trainerCode: string) {
  const normalized = trainerCode.trim();
  if (!normalized) {
    return [];
  }

  const firestore = await ensureReady();

  await purgeExpiredMembers();

  const membersQuery = query(
    collection(firestore, "members"),
    where("trainerCode", "==", normalized),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(membersQuery);
  return snapshot.docs.map(mapMember);
}

export async function getMemberById(memberId: string) {
  const trimmedId = memberId.trim();
  if (!trimmedId) {
    return null;
  }

  const firestore = await ensureReady();
  const snapshot = await getDoc(doc(firestore, "members", trimmedId));
  if (!snapshot.exists()) {
    return null;
  }

  return mapMemberData(snapshot.id, snapshot.data());
}

export async function getMemberByPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) {
    return null;
  }

  const firestore = await ensureReady();
  const normalizedTarget = normalizePhone(trimmed);
  if (!normalizedTarget) {
    return null;
  }

  const snapshot = await getDocs(collection(firestore, "members"));
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const storedPhone = typeof data.phone === "string" ? data.phone : "";
    if (normalizePhone(storedPhone) === normalizedTarget) {
      return mapMemberData(docSnap.id, data);
    }
  }

  return null;
}

export async function getMembersByPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) {
    return [];
  }

  const firestore = await ensureReady();
  const normalizedTarget = normalizePhone(trimmed);
  if (!normalizedTarget) {
    return [];
  }

  const snapshot = await getDocs(collection(firestore, "members"));
  return snapshot.docs
    .map((docSnap) => ({ docSnap, data: docSnap.data() }))
    .filter(({ data }) => {
      const storedPhone = typeof data.phone === "string" ? data.phone : "";
      return normalizePhone(storedPhone) === normalizedTarget;
    })
    .map(({ docSnap, data }) => mapMemberData(docSnap.id, data));
}

export async function getMemberByRollNumber(rollNumber: string) {
  const trimmed = rollNumber.trim();
  if (!trimmed) {
    return null;
  }

  const firestore = await ensureReady();
  const snapshot = await getDocs(collection(firestore, "members"));
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const storedRoll = typeof data.rollNumber === "string" ? data.rollNumber : "";
    if (storedRoll.trim() === trimmed) {
      return mapMemberData(docSnap.id, data);
    }
  }

  return null;
}

export async function deleteMember(memberId: string) {
  const trimmedId = memberId.trim();
  if (!trimmedId) {
    throw new Error("Member ID is required");
  }

  const firestore = await ensureReady();
  await deleteDoc(doc(firestore, "members", trimmedId));
}

type PaymentUpdateInput = {
  planStartDate: string;
  planEndDate: string;
  planAmount: number;
  dues: string;
  paidOn: string;
  planDurationDays: number | null;
};

type MemberUpdateInput = {
  name: string;
  rollNumber: string;
  gender: "Male" | "Female";
  dateOfBirth: string | null;
  phone: string;
  trainerCode?: string | null;
  joinDate: string;
  planStartDate: string;
  planEndDate: string;
  planAmount: number;
  planDurationDays: number | null;
  dues: string;
};

export async function updateMemberPayment(
  memberId: string,
  input: PaymentUpdateInput
) {
  const trimmedId = memberId.trim();
  if (!trimmedId) {
    throw new Error("Member ID is required");
  }

  const firestore = await ensureReady();
  await updateDoc(doc(firestore, "members", trimmedId), {
    planStartDate: input.planStartDate,
    planEndDate: input.planEndDate,
    planAmount: input.planAmount,
    planDurationDays: input.planDurationDays,
    dues: input.dues,
    status: "active",
    paidOn: input.paidOn,
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateMemberProfile(
  memberId: string,
  input: MemberUpdateInput
) {
  const trimmedId = memberId.trim();
  if (!trimmedId) {
    throw new Error("Member ID is required");
  }

  const firestore = await ensureReady();
  await updateDoc(doc(firestore, "members", trimmedId), {
    name: input.name,
    rollNumber: input.rollNumber,
    gender: input.gender,
    dateOfBirth: input.dateOfBirth?.trim() || null,
    phone: input.phone,
    trainerCode: input.trainerCode ?? null,
    joinDate: input.joinDate,
    planStartDate: input.planStartDate,
    planEndDate: input.planEndDate,
    planAmount: input.planAmount,
    planDurationDays: input.planDurationDays,
    dues: input.dues,
    updatedAt: serverTimestamp(),
  });
}

type ClearDuesInput = {
  amount: number;
  paidOn: string;
};

export async function clearMemberDues(memberId: string, input: ClearDuesInput) {
  const trimmedId = memberId.trim();
  if (!trimmedId) {
    throw new Error("Member ID is required");
  }

  const firestore = await ensureReady();
  await updateDoc(doc(firestore, "members", trimmedId), {
    dues: "0",
    duesPaidAmount: input.amount,
    duesPaidOn: input.paidOn,
    updatedAt: serverTimestamp(),
  });
}
