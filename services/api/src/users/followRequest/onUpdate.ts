import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const onUpdateFollowRequest = (db: admin.firestore.Firestore) => {
  return functions.firestore.onDocumentUpdated(
    "users/{userId}/followRequests/{followRequestsId}",
    async (event) => {
      functions.logger.info("Checking resell status");
      const snapshot = event.data;
      if (!snapshot) {
        functions.logger.error("Document does not exist");
        return;
      }
      const { userId } = event.params; // Extract userId from the path parameters

      if (
        snapshot.after.data().status === "Accepted" &&
        snapshot.before.data().status == "Pending"
      ) {
        const followedUserId = snapshot.after.data().userId; // Assuming userId from the snapshot is the ID of the user being followed

        // Increment the following count for the user who accepted the request
        await db
          .collection("users")
          .doc(userId)
          .update({
            followersCount: admin.firestore.FieldValue.increment(1),
          });

        // Increment the followers count for the user who was followed
        await db
          .collection("users")
          .doc(followedUserId)
          .update({
            followingCount: admin.firestore.FieldValue.increment(1),
          });
      }
    }
  );
};
