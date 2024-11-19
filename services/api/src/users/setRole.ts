import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

export type Data = {
  uid: string;
  role: string;
};

export const changeUserRole = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { uid, role } = data;
      functions.logger.info("Changing roler", uid, role);
      try {
        const userAuth = await admin.auth().getUser(uid ?? "");
        await admin
          .auth()
          .setCustomUserClaims(uid, {
            ...userAuth.customClaims,
            role: role,
          })
          .then(async () => {
            await db.collection("users").doc(uid).update({
              role: role,
            });
          });

        return {
          success: true,
          message: "User role updated successfully",
        };
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
