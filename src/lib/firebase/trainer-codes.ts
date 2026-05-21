import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import { db, firebaseEnabled } from "./client";
import { ensureAnonymousAuth } from "./ensure-auth";

type TrainerCodeInput = {
  code: string;
  trainerName?: string | null;
};

export type TrainerCodeRecord = {
  id: string;
  code: string;
  trainerName?: string | null;
  active: boolean;
};

const ensureReady = async (): Promise<Firestore> => {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  await ensureAnonymousAuth();
  return db;
};

export async function createTrainerCode(input: TrainerCodeInput) {
  const firestore = await ensureReady();

  const code = input.code.trim();
  if (!code) {
    throw new Error("Trainer code is required");
  }

  const codesRef = collection(firestore, "trainerCodes");
  const existingQuery = query(codesRef, where("code", "==", code));
  const existingSnapshot = await getDocs(existingQuery);
  if (!existingSnapshot.empty) {
    throw new Error("Trainer code already exists");
  }

  return addDoc(codesRef, {
    code,
    trainerName: input.trainerName?.trim() || null,
    active: true,
    createdAt: serverTimestamp(),
  });
}

export async function toggleTrainerCode(id: string, active: boolean) {
  const firestore = await ensureReady();
  const docRef = doc(firestore, "trainerCodes", id);
  return updateDoc(docRef, { active });
}

export async function deleteTrainerCode(id: string) {
  const trimmedId = id.trim();
  if (!trimmedId) {
    throw new Error("Trainer code ID is required");
  }

  const firestore = await ensureReady();
  await deleteDoc(doc(firestore, "trainerCodes", trimmedId));
}
