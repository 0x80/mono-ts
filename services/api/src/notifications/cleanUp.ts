import type admin from "firebase-admin";
import * as functions from "firebase-functions";

export const cleanupTokens = async (
  response: admin.messaging.BatchResponse,
  tokens: string[],
  db: admin.firestore.Firestore
) => {
  const batch = db.batch();
  response.responses.forEach((result, index) => {
    const error = result.error;
    if (error) {
      functions.logger.error(
        "Failure sending notification to",
        tokens[index],
        error
      );
      // Cleanup the tokens that are not registered anymore.
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        const token = tokens[index];
        if (token) {
          const deleteTask = db.collection("fcmTokens").doc(token);
          batch.delete(deleteTask);
        } else {
          functions.logger.error("Token does not exist in the database");
        }
      }
    }
  });
  return batch.commit();
};
