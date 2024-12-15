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
  admin.initializeApp();

  const db = getFirestore(getApp());

  db.settings({
    ignoreUndefinedProperties: true,
  });
}

function getApp() {
  return admin.apps[0] as admin.app.App;
}

const firebaseApp = getApp();

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const functions = getFunctions(firebaseApp);
