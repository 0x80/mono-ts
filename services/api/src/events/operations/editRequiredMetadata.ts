import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { Event, RequiredMetadata } from "@repo/types";
import type { CallableRequest } from "firebase-functions/https";

type Action = "edit" | "delete" | "add";

type Data = {
  requiredMetadata: RequiredMetadata;
  action: Action;
  eventId: string;
};

const updateRequiredMetadata = (
  eventData: Event,
  requiredMetadata: RequiredMetadata,
  action: Action
): RequiredMetadata[] => {
  switch (action) {
    case "edit":
      return eventData.operations.requiredMetadata.map((metadata) =>
        metadata.name === requiredMetadata.name
          ? { ...metadata, ...requiredMetadata }
          : metadata
      );
    case "delete":
      return eventData.operations.requiredMetadata.filter(
        (metadata) => metadata.name !== requiredMetadata.name
      );
    case "add":
      return [
        ...eventData.operations.requiredMetadata,
        {
          ...requiredMetadata,
          name: requiredMetadata.label.toLowerCase().replace(/\s+/g, ""),
        },
      ];
    default:
      return eventData.operations.requiredMetadata;
  }
};

export const editRequiredMetadata = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { eventId, action, requiredMetadata } = data;
      const eventRef = db.collection("events").doc(eventId);

      try {
        await db.runTransaction(async (transaction) => {
          const eventDoc = await transaction.get(eventRef);
          const eventData = eventDoc.data() as Event;

          const newRequiredMetadata = updateRequiredMetadata(
            eventData,
            requiredMetadata,
            action
          );

          await transaction.update(eventRef, {
            operations: {
              ...eventData.operations,
              requiredMetadata: newRequiredMetadata,
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
