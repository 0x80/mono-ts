import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

export type Data = {
  isPublic: boolean;
};

export const updateUserPrivacy = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { isPublic } = data;

      try {
        if (request.auth != null) {
          await db.collection("users").doc(request.auth?.uid).update({
            isPublic,
          });

          return {
            success: true,
            message: "User updated successfully",
          };
        }
        return { success: false, message: "User must be authenticated" };
      } catch (error) {
        if (error instanceof Error) {
          // Standard JavaScript error handling
          functions.logger.warn(error);
          return { success: false, message: error.message };
        } else {
          // If the error doesn't match the Error type, handle it generically
          functions.logger.warn("An unknown error occurred", error);
          return { success: false, message: "An unknown error occurred." };
        }
      }
    }
  );
};
