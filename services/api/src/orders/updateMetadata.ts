import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

type Input = {
  orderId: string;
  metadata: {
    [key: string]: string;
  };
};

export const updateOrderMetadata = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Input>) => {
      const { data } = request;
      const { orderId, metadata } = data;

      try {
        await db.collection("orders").doc(orderId).update({
          metadata,
        });

        return { success: true };
      } catch (error) {
        console.error("Error updating order metadata", error);
        return { success: false };
      }
    }
  );
};
