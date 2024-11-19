import * as functions from "firebase-functions";
import type admin from "firebase-admin";

export const onUpdateProducer = (db: admin.firestore.Firestore) => {
  return functions.firestore.onDocumentUpdated(
    "producers/{producerId}",
    async (event) => {
      functions.logger.info("Checking resell status");
      const snapshot = event.data;
      if (!snapshot) {
        return;
      }
      const producerId = snapshot.after.id;
      const eventsRef = db
        .collection("events")
        .where("producer.id", "==", producerId);
      const eventsSnapshot = await eventsRef.get();
      const batch = db.batch();
      eventsSnapshot.forEach((event) => {
        batch.update(event.ref, {
          producer: {
            name: snapshot.after.data().name,
            image: snapshot.after.data().image,
            id: producerId,
            domains: snapshot.after.data().domains,
            ratings: snapshot.after.data().ratings,
          },
        });
      });
      await batch.commit();
    }
  );
};
