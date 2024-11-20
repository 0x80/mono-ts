import * as functions from "firebase-functions";
import admin from "firebase-admin";

import type { EventProducer } from "@repo/types";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  producer: EventProducer;
  isSubscribing: boolean;
  subscriptions: EventProducer[];
};

export const subscribeToProducerFunction = async (
  db: admin.firestore.Firestore,
  isSubscribing: boolean,
  producer: { id: string; name: string },
  subscriptions: { id: string; name: string }[],
  uid: string
) => {
  // Validate UID
  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  // Get user document reference
  const userRef = db.collection("users").doc(uid);

  // Check if document exists
  const userDoc = await userRef.get().catch((e) => functions.logger.info(e));

  if (!userDoc) {
    throw new functions.https.HttpsError(
      "not-found",
      "User document not found"
    );
  }

  let newSubscriptions = subscriptions ?? [];
  if (isSubscribing) {
    // Check for duplicate subscription
    if (!newSubscriptions.some((sub) => sub.id === producer.id)) {
      newSubscriptions.push({
        id: producer.id,
        name: producer.name,
      });
    }
  } else {
    newSubscriptions = newSubscriptions.filter((sub) => sub.id !== producer.id);
  }

  try {
    await userRef.update({
      subscriptions: newSubscriptions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: "Subscription updated successfully",
    };
  } catch (error) {
    functions.logger.error("Error updating subscription:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to update subscription"
    );
  }
};

export const subscribeToProducer = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      console.log("auth");
      console.log(request.auth?.uid);

      try {
        return await subscribeToProducerFunction(
          db,
          data.isSubscribing,
          data.producer,
          data.subscriptions,
          request.auth?.uid ?? ""
        );
      } catch (error) {
        if (error instanceof Error) {
          // Standard JavaScript error handling
          functions.logger.error(error);
          return { success: false, message: error.message };
        } else {
          // If the error doesn't match the Error type, handle it generically
          functions.logger.error("An unknown error occurred", error);
          return { success: false, message: "An unknown error occurred." };
        }
      }
    }
  );
};
