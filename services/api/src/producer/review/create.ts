import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { ProducerReview } from "./interfaces";
import type { CallableRequest } from "firebase-functions/https";

export const createProducerReview = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },

    async (request: CallableRequest<ProducerReview>) => {
      const { data } = request;
      try {
        await db
          .collection("producers")
          .doc(data.producerId)
          .collection("reviews")
          .add({
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            ...data,
          });

        return {
          success: true,
          message: "Producer review created successfully",
        };
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
