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

export async function createTrainerCode(input: TrainerCodeInput) {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  await ensureAnonymousAuth();


  const code = input.code.trim();
  if (!code) {
    throw new Error("Trainer code is required");
  }

  const codesRef = collection(db, "trainerCodes");
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
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  await ensureAnonymousAuth();

  const docRef = doc(db, "trainerCodes", id);
  return updateDoc(docRef, { active });
}

export async function deleteTrainerCode(id: string) {
  if (!firebaseEnabled || !db) {
    throw new Error("Firebase not configured");
  }

  const trimmedId = id.trim();
  if (!trimmedId) {
    throw new Error("Trainer code ID is required");
  }

  await ensureAnonymousAuth();
  await deleteDoc(doc(db, "trainerCodes", trimmedId));
}
