import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

export const blogClickedFunction = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<{ blogId: string }>) => {
      const data = request.data;
      const { blogId } = data;

      const blogRef = db.collection("blogs").doc(blogId);

      // check if doc exists

      try {
        await db.runTransaction(async (transaction) => {
          const blogDoc = await transaction.get(blogRef);
          const blogData = blogDoc.data();
          if (!blogData?.clicked) {
            await transaction.update(blogRef, {
              clicked: 1,
            });
          } else {
            await transaction.update(blogRef, {
              clicked: blogData.clicked + 1,
            });
          }
        });

        return {
          success: true,
          message: "Blog updated successfully",
        };
      } catch (error) {
        functions.logger.warn(error);
        return { success: false, message: error };
      }
    }
  );
};
