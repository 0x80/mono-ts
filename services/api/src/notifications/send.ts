import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { cleanupTokens } from "./cleanUp";
import type { CallableRequest } from "firebase-functions/https";

export const sendNotification = async (
  tokens: string[],
  title: string,
  body: string,
  route: string,
  parameterData: { [key: string]: string },
  db: admin.firestore.Firestore
) => {
  // Get the list of device tokens.

  if (tokens.length > 0) {
    // Function to split array into chunks of given size
    const chunkArray = (array: string[], chunkSize: number) => {
      const chunks = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    };

    // Split tokens into batches of 500
    const tokenBatches = chunkArray(tokens, 500);

    for (const batch of tokenBatches) {
      const message = {
        tokens: batch,
        notification: {
          title: title,
          body: body,
        },
        data: {
          initialPageName: route,
          parameterData: JSON.stringify(parameterData),
        },
      };

      try {
        functions.logger.info("Sending message:");
        functions.logger.info(message);
        const response = await admin.messaging().sendEachForMulticast(message);
        await cleanupTokens(response, batch, db);
        functions.logger.info(response);
      } catch (error) {
        functions.logger.error("Error sending message:", error);
      }
    }
  }
};

type Data = {
  title: string;
  body: string;
  route: string;
  parameterData: { [key: string]: string };
};

export const sendNotificationFunction = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      timeoutSeconds: 540, // Set the maximum timeout
      memory: "512MiB", // Set the maximum memory
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { title, body, route, parameterData } = data;

      try {
        const allTokens = await db.collectionGroup("fcm_tokens").get();
        const tokens: string[] = [];
        allTokens.forEach((tokenDoc) => {
          tokens.push(tokenDoc.data().fcm_token);
        });
        await sendNotification(tokens, title, body, route, parameterData, db);
        return {
          success: true,
          message: "Notification send successfully",
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
