import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db, firebaseEnabled } from "./client";
import { ensureAnonymousAuth } from "./ensure-auth";

type PlanType = "diet" | "workout";

type PlanProfile = {
  name?: string;
  dateOfBirth?: string;
  goal?: string;
  activityLevel?: string;
  height?: string;
  weight?: string;
  allergies?: string;
  equipment?: string;
  daysPerWeek?: number;
  sessionMinutes?: number;
  notes?: string;
};

type SavePlanInput = {
  type: PlanType;
  plan: string;
  profile: PlanProfile;
};

export type AiPlanRecord = {
  id: string;
  type: PlanType;
  plan: string;
  profile: PlanProfile;
  createdAt: string;
};

export async function saveAiPlan(input: SavePlanInput) {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  await ensureAnonymousAuth();

  const planText = input.plan.trim();
  if (!planText) {
    throw new Error("Plan content is empty.");
  }

  return addDoc(collection(db, "aiPlans"), {
    type: input.type,
    plan: planText,
    profile: input.profile,
    createdAt: serverTimestamp(),
  });
}

function mapAiPlan(doc: QueryDocumentSnapshot<DocumentData>): AiPlanRecord {
  const data = doc.data();
  const createdAt = data.createdAt?.toDate?.()
    ? data.createdAt.toDate().toISOString()
    : "";

  return {
    id: doc.id,
    type: data.type === "workout" ? "workout" : "diet",
    plan: String(data.plan ?? ""),
    profile: (data.profile as PlanProfile) ?? {},
    createdAt,
  };
}

export async function getAiPlans() {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  await ensureAnonymousAuth();

  const plansQuery = query(collection(db, "aiPlans"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(plansQuery);
  return snapshot.docs.map(mapAiPlan);
}
