import * as functions from "firebase-functions";
import type admin from "firebase-admin";

export const convertProducersToArray = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (_) => {
      try {
        const events = await db.collection("events").get();
        const batch = db.batch();
        events.forEach((doc) => {
          const event = doc.data();

          batch.update(doc.ref, { producer: event.producer[0] });
        });

        await batch.commit();

        return {
          success: true,
          message: "Schedule added successfully",
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
