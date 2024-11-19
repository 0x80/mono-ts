import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getFunctions } from "firebase-admin/functions";
import { getStorage } from "firebase-admin/storage";
export type { DecodedIdToken } from "firebase-admin/auth";
export { FieldValue, Timestamp } from "firebase-admin/firestore";
export type { Firestore } from "firebase-admin/firestore";

export type { UpdateData } from "firebase-admin/firestore";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || "early-dev-73f4d",
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET || "early-dev-73f4d.appspot.com",
    });
    console.log("Firebase Admin initialized successfully");

    // Get Firestore instance
    const db = getFirestore();

    // Configure Firestore settings
    db.settings({
      ignoreUndefinedProperties: true,
      timestampsInSnapshots: true,
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    throw error;
  }
}

function getApp() {
  return admin.apps[0] as admin.app.App;
}

export const firebaseApp = getApp();
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const functions = getFunctions(firebaseApp);
