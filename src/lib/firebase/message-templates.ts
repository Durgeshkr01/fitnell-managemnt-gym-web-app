import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Firestore,
  type Timestamp,
} from "firebase/firestore";
import { db, firebaseEnabled } from "./client";
import { ensureAnonymousAuth } from "./ensure-auth";
import {
  defaultMessageTemplates,
  type MessageTemplates,
} from "@/lib/messages";

const TEMPLATE_DOC_ID = "default";

const ensureReadyOptional = async (): Promise<Firestore | null> => {
  if (!firebaseEnabled || !db) {
    return null;
  }

  await ensureAnonymousAuth();
  return db;
};

type MessageTemplateDoc = {
  templates?: Partial<MessageTemplates>;
  updatedAt?: Timestamp;
};

const mergeTemplates = (templates?: Partial<MessageTemplates>) => {
  return {
    ...defaultMessageTemplates,
    ...(templates ?? {}),
  } satisfies MessageTemplates;
};

export async function getMessageTemplates(): Promise<MessageTemplates> {
  const firestore = await ensureReadyOptional();
  if (!firestore) {
    return mergeTemplates();
  }

  const snapshot = await getDoc(doc(firestore, "message-templates", TEMPLATE_DOC_ID));
  if (!snapshot.exists()) {
    return mergeTemplates();
  }

  const data = snapshot.data() as DocumentData as MessageTemplateDoc;
  return mergeTemplates(data.templates ?? undefined);
}

export async function saveMessageTemplates(templates: MessageTemplates) {
  const firestore = await ensureReadyOptional();
  if (!firestore) {
    return;
  }

  await setDoc(
    doc(firestore, "message-templates", TEMPLATE_DOC_ID),
    {
      templates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
