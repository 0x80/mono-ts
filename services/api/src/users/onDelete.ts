import * as functions from "firebase-functions/v1";
import type admin from "firebase-admin";
//import { deleteNeoUser } from "..";

export const onDeleteUser = (db: admin.firestore.Firestore) => {
  return functions.auth.user().onDelete(async (user) => {
    const uid = user.uid;
    const docRef = db.collection("users").doc(uid);

    try {
      await docRef.delete();
      //await deleteNeoUser(uid);
      console.log(`User document with ID ${uid} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting user document with ID ${uid}:`, error);
    }
  });
};
