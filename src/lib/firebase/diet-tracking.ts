import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db, firebaseEnabled } from "./client";
import { ensureAnonymousAuth } from "./ensure-auth";
import type {
  ActivityLevel,
  Gender,
  NutritionGoal,
} from "@/lib/nutrition/bmi-calculator";

export type MemberNutritionProfile = {
  memberId: string;
  heightCm: number;
  weightKg: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  dailyProtein: number;
  updatedAt: string;
};

export type DietLogEntry = {
  id: string;
  memberId: string;
  date: string;
  foodId: string;
  foodName: string;
  servingLabel: string;
  servings: number;
  calories: number;
  protein: number;
  loggedAt: string;
};

type SaveNutritionProfileInput = Omit<MemberNutritionProfile, "updatedAt">;

type AddDietLogInput = {
  memberId: string;
  date: string;
  foodId: string;
  foodName: string;
  servingLabel: string;
  servings: number;
  calories: number;
  protein: number;
};

const ensureReady = async (): Promise<Firestore> => {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }
  await ensureAnonymousAuth();
  return db;
};

const mapNutritionProfile = (
  memberId: string,
  data: DocumentData
): MemberNutritionProfile => {
  const updatedAt = data.updatedAt as Timestamp | undefined;
  return {
    memberId,
    heightCm: Number(data.heightCm ?? 0),
    weightKg: Number(data.weightKg ?? 0),
    age: Number(data.age ?? 0),
    gender: data.gender === "female" ? "female" : "male",
    activityLevel: (data.activityLevel as ActivityLevel) ?? "moderate",
    goal: (data.goal as NutritionGoal) ?? "maintain",
    bmi: Number(data.bmi ?? 0),
    bmiCategory: String(data.bmiCategory ?? ""),
    dailyCalories: Number(data.dailyCalories ?? 0),
    dailyProtein: Number(data.dailyProtein ?? 0),
    updatedAt: updatedAt ? updatedAt.toDate().toISOString() : "",
  };
};

const mapDietLog = (docSnap: QueryDocumentSnapshot<DocumentData>): DietLogEntry => {
  const data = docSnap.data();
  const loggedAt = data.loggedAt as Timestamp | undefined;
  return {
    id: docSnap.id,
    memberId: String(data.memberId ?? ""),
    date: String(data.date ?? ""),
    foodId: String(data.foodId ?? ""),
    foodName: String(data.foodName ?? ""),
    servingLabel: String(data.servingLabel ?? ""),
    servings: Number(data.servings ?? 1),
    calories: Number(data.calories ?? 0),
    protein: Number(data.protein ?? 0),
    loggedAt: loggedAt ? loggedAt.toDate().toISOString() : "",
  };
};

export async function saveMemberNutritionProfile(input: SaveNutritionProfileInput) {
  const firestore = await ensureReady();
  const profileRef = doc(firestore, "memberNutrition", input.memberId);

  await setDoc(profileRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function getMemberNutritionProfile(memberId: string) {
  const firestore = await ensureReady();
  const profileRef = doc(firestore, "memberNutrition", memberId);
  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    return null;
  }

  return mapNutritionProfile(memberId, snapshot.data());
}

export async function addDietLogEntry(input: AddDietLogInput) {
  const firestore = await ensureReady();
  return addDoc(collection(firestore, "dietLogs"), {
    ...input,
    loggedAt: serverTimestamp(),
  });
}

export async function getDietLogsForDate(memberId: string, date: string) {
  const firestore = await ensureReady();
  const logsQuery = query(
    collection(firestore, "dietLogs"),
    where("memberId", "==", memberId),
    where("date", "==", date)
  );
  const snapshot = await getDocs(logsQuery);
  return snapshot.docs
    .map(mapDietLog)
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
}

export async function deleteDietLogEntry(entryId: string) {
  const firestore = await ensureReady();
  await deleteDoc(doc(firestore, "dietLogs", entryId));
}

export function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function sumDietLogs(entries: DietLogEntry[]) {
  return entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: Math.round((totals.protein + entry.protein) * 10) / 10,
    }),
    { calories: 0, protein: 0 }
  );
}
