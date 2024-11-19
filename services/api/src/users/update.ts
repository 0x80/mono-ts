import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

export type Data = {
  firstName: string;
  lastName: string;
};

export const updateUser = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { firstName, lastName } = data;
      functions.logger.info("Updating a user", firstName, lastName);

      try {
        if (request.auth != null) {
          await db
            .collection("users")
            .doc(request.auth?.uid)
            .update({
              firstName,
              lastName,
              display_name: `${firstName} ${lastName}`,
            });

          // Update the user's authentication display name
          await admin.auth().updateUser(request.auth?.uid, {
            displayName: `${firstName} ${lastName}`,
          });

          return {
            success: true,
            message: "User updated successfully",
          };
        }
        return { success: false, message: "User must be authenticated" };
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, message: error.message };
        } else {
          return { success: false, message: "An error occurred" };
        }
      }
    }
  );
};
