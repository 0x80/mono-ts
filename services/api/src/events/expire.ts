import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { onUpdateEvent } from "./onUpdate";
import { EventStatus, type Event } from "@repo/types";

export const expireEvent = (db: admin.firestore.Firestore) => {
  return functions.https.onRequest(
    {
      region: "southamerica-east1",
    },
    async (req, res) => {
      const eventId = req.body.eventId;
      const event = (
        await db.collection("events").doc(eventId).get()
      ).data() as Event;
      await db
        .collection("events")
        .doc(eventId)
        .update({
          info: {
            ...req.body.info,
            status: "Expired",
            start: admin.firestore.Timestamp.fromMillis(
              req.body.info.start * 1000
            ),
            end: admin.firestore.Timestamp.fromMillis(req.body.info.end * 1000),
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      await onUpdateEvent(
        db,
        { ...event, id: eventId },
        {
          ...event,
          id: eventId,
          info: {
            ...event.info,
            status: EventStatus.Expired,
          },
        }
      );
      res.status(200).send("Event expired successfully");
      return;
    }
  );
};
