import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { FollowRequest } from "./interfaces";
import type { CallableRequest } from "firebase-functions/https";

export const createFollowRequest = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<FollowRequest>) => {
      const { data } = request;
      try {
        const followRequestRef = db.collection("followRequest");
        await followRequestRef.add({
          ...data,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          success: true,
          message: "User created successfully",
        };
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, message: error.message };
        } else {
          return { success: false, message: "An error occurred" };
        }
      }
    }
  );
};
