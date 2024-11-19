import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { runTransactionWithRetries } from "../../utils/transactions";

export const onCreateProducerReview = (db: admin.firestore.Firestore) => {
  return functions.firestore.onDocumentCreated(
    "producers/{producerId}/reviews/{reviewId}",
    async (event) => {
      functions.logger.info("Checking resell status");
      const review = event.data;
      if (!review) {
        functions.logger.warn("No review data found");
        return {
          success: false,
          message: "No review data found",
        };
      }
      try {
        const producerRef = db
          .collection("producers")
          .doc(review.data().producerId);
        await runTransactionWithRetries(db, async (transaction) => {
          return transaction.get(producerRef).then(async (producer) => {
            const oldRatings = producer.data()?.ratings || {
              ratingPoint: 0,
              ratingTotal: 0,
              ratingNumber: 0,
            };
            await transaction.update(producerRef, {
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              ratings: {
                ratingNumber: (oldRatings.ratingNumber || 0) + 1,
                ratingTotal:
                  (oldRatings.ratingTotal || 0) + (review.data().rating || 0),
                ratingPoint:
                  ((oldRatings.ratingTotal || 0) +
                    (review.data().rating || 0)) /
                  ((oldRatings.ratingNumber || 0) + 1),
              },
            });
          });
        });
        await db
          .collection("users")
          .doc(review.data().userId)
          .update({
            pendingReviews: admin.firestore.FieldValue.arrayRemove({
              eventId: review.data().eventId,
              eventName: review.data().eventName,
              producerId: review.data().producerId,
              eventImage: review.data().eventImage,
            }),
          });
        return {
          success: true,
          message: "Producer review created successfully",
        };
      } catch (error) {
        if (error instanceof Error) {
          // Standard JavaScript error handling
          functions.logger.warn(error);
          throw new functions.https.HttpsError("internal", error.message);
        } else {
          // If the error doesn't match the Error type, handle it generically
          functions.logger.warn("An unknown error occurred", error);
          throw new functions.https.HttpsError(
            "internal",
            "An unknown error occurred"
          );
        }
      }
    }
  );
};
