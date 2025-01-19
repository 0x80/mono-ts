import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getFunctions } from "firebase-admin/functions";
import { getStorage } from "firebase-admin/storage";
import { getOrThrow } from "get-or-throw";

export type { DecodedIdToken } from "firebase-admin/auth";
export { FieldValue, Timestamp } from "firebase-admin/firestore";
export type { Firestore, UpdateData } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp();

  const db = getFirestore(getApp());

  db.settings({
    ignoreUndefinedProperties: true,
  });
}

function getApp() {
  return getOrThrow(admin.apps, 0);
}

const firebaseApp = getApp();

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const functions = getFunctions(firebaseApp);
