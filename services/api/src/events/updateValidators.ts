import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { Operations } from "@repo/types";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  operations: Operations;
  eventId: string;
  isAdd?: boolean;
  newEmail?: string;
};

export const updateEventValidators = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { operations, eventId, isAdd = false, newEmail = "" } = data;
      const newOperations = { ...operations };

      if (isAdd) {
        const doc = await db
          .collection("users")
          .where("email", "==", newEmail)
          .get();
        if (doc.empty) {
          return {
            success: false,
            message: "User not found",
          };
        }
        if (newOperations.validators && doc.docs[0]) {
          newOperations.validators.push(doc.docs[0].id);
          if (newOperations.validatorsData === undefined) {
            newOperations.validatorsData = [];
          }
          newOperations.validatorsData.push({
            email: newEmail,
            uid: doc.docs[0].id,
          });
        } else {
          return {
            success: false,
            message: "Validators or user document is undefined",
          };
        }
      }

      try {
        await db
          .collection("events")
          .doc(eventId)
          .update({
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            operations: {
              ...newOperations,
              validators: operations.validators.sort(),
              validatorsData: operations.validatorsData.sort((a, b) => {
                if (a.email < b.email) return -1;
                if (a.email > b.email) return 1;
                return 0;
              }),
            },
          });

        return {
          success: true,
          message: "Event updated successfully",
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
