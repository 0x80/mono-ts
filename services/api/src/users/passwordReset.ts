import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

export type Data = {
  email: string;
};

export const sendPasswordResetEmail = () => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { email } = data;

      if (!email) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "The email field is required."
        );
      }

      try {
        // Send password reset email using Firebase Authentication
        await admin.auth().generatePasswordResetLink(email);

        return {
          success: true,
          message: `Password reset email sent to ${email}`,
        };
      } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new functions.https.HttpsError(
          "internal",
          "Unable to send password reset email."
        );
      }
    }
  );
};
