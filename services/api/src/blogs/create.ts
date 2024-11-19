import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { Blog } from "./interfaces";
import type { CallableRequest } from "firebase-functions/https";

export const createBlog = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Blog>) => {
      const { data } = request;
      try {
        await db.collection("blogs").add({
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          ...data,
        });

        return {
          success: true,
          message: "Blog created successfully",
        };
      } catch (error) {
        functions.logger.warn(error);
        return { success: false, message: error };
      }
    }
  );
};
