import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { EventStatsCollection } from "./interfaces";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  eventId: string;
};

export const externalRedirected = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { eventId } = data;

      const statsRef = db
        .collection("events")
        .doc(eventId)
        .collection("stats")
        .doc("stats");
      // check if doc exists

      try {
        await db.runTransaction(async (transaction) => {
          const statsDoc = await transaction.get(statsRef);
          if (!statsDoc.exists) {
            const newDoc: EventStatsCollection = {
              externalRedirected: 1,
              eventId: eventId,
            };
            await transaction.set(statsRef, newDoc);
          } else {
            const oldStats = statsDoc.data() as EventStatsCollection;
            await transaction.update(statsRef, {
              externalRedirected: (oldStats.externalRedirected ?? 0) + 1,
            });
          }
        });

        return {
          success: true,
          message: "External updated successfully",
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
