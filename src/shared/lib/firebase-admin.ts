import { type App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { type Firestore, getFirestore } from "firebase-admin/firestore";
import { type Storage, getStorage } from "firebase-admin/storage";

const REQUIRED_ENV_VARS = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_STORAGE_BUCKET",
] as const;

interface FirebaseAdminEnv {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  storageBucket: string;
}

function readFirebaseAdminEnv(): FirebaseAdminEnv {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required Firebase Admin env vars: ${missing.join(", ")}`);
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    // .env files can't hold literal newlines, so the key is stored with escaped "\n" sequences.
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  };
}

function initializeFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const { projectId, clientEmail, privateKey, storageBucket } = readFirebaseAdminEnv();

  try {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      storageBucket,
    });
  } catch {
    // Never rethrow or log the caught error — it may wrap the raw credential in its `cause`.
    throw new Error("Failed to initialize Firebase Admin SDK");
  }
}

// Module-level cache, backed by the SDK's own getApps() registry as a fallback
// in case dev hot-reload re-evaluates this module without resetting that registry.
let app: App | undefined;

function getFirebaseAdminApp(): App {
  if (!app) {
    app = initializeFirebaseAdminApp();
  }
  return app;
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(getFirebaseAdminApp());
}
