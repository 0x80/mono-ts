import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { onUpdateEvent } from "./onUpdate";
import type { Event } from "@repo/types";
import { EventStatus } from "@repo/types";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  status: EventStatus;
  eventId: string;
};

export const setEventStatus = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { status, eventId } = data;
      const oldEventSnapshot = await db.collection("events").doc(eventId).get();
      const oldEventData = oldEventSnapshot.data() as Event;

      const newStatus =
        status == EventStatus.Active
          ? oldEventData.info.isExternal
            ? EventStatus.External
            : EventStatus.Active
          : status;

      if (oldEventData) {
        await db
          .collection("events")
          .doc(eventId)
          .update({
            info: {
              ...oldEventData.info,
              status: newStatus,
            },
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        await onUpdateEvent(
          db,
          { ...oldEventData, id: oldEventSnapshot.id },
          {
            ...oldEventData,
            id: oldEventSnapshot.id,
            info: {
              ...oldEventData.info,
              status: newStatus,
            },
          }
        );
      } else {
        functions.logger.error(`Event with ID ${eventId} not found`);
        throw new functions.https.HttpsError("not-found", "Event not found");
      }
    }
  );
};
