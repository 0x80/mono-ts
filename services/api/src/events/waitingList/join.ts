import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { WaitingList } from "./interfaces";
import type { CallableRequest } from "firebase-functions/https";

export type Data = {
  userId: string;
  userMail: string;
  userName: string;
  eventId: string;
  eventName: string;
  eventStart: string;
};

export const joinEventWaitingList = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const waitingList: WaitingList = {
        userId: data.userId,
        userMail: data.userMail,
        userName: data.userName,
        eventId: data.eventId,
        eventName: data.eventName,
        eventStart: data.eventStart,
      };

      const event = await db.collection("events").doc(data.eventId).get();

      await db
        .collection("events")
        .doc(data.eventId)
        .collection("waitingList")
        .add({
          ...waitingList,
          eventStart: event.data()?.info.start,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
  );
};
