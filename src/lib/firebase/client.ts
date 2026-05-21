import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const firebaseEnabled = Object.values(firebaseConfig).every((value) => Boolean(value));

const app: FirebaseApp | null = firebaseEnabled
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

const auth: Auth | null = app ? getAuth(app) : null;
const db: Firestore | null = app ? getFirestore(app) : null;
const storage: FirebaseStorage | null = app ? getStorage(app) : null;

const analyticsPromise: Promise<Analytics | null> =
  typeof window !== "undefined" && app
    ? isSupported().then((supported) => (supported ? getAnalytics(app) : null))
    : Promise.resolve(null);

export { app, auth, db, storage, analyticsPromise, firebaseEnabled };
