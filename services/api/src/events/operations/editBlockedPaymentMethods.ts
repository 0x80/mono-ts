import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { Event } from "@repo/types";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  options: string[];
  eventId: string;
};

export const editBlockedPaymentMethods = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { eventId, options } = data;
      const eventRef = db.collection("events").doc(eventId);

      try {
        await db.runTransaction(async (transaction) => {
          const eventDoc = await transaction.get(eventRef);
          const eventData = eventDoc.data() as Event;

          await transaction.update(eventRef, {
            operations: {
              ...eventData.operations,
              blockedPaymentMethods: options,
            },
          });
        });

        return {
          success: true,
          message: "Schedule updated successfully",
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
