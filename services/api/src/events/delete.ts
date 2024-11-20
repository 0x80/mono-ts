import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { User } from "../users/interfaces";
import type { Event } from "@repo/types";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  eventId: string;
};

export const deleteEvent = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const userAuth = await admin.auth().getUser(request.auth?.uid ?? "");

      const userData = (
        await db.collection("users").doc(userAuth.uid).get()
      ).data() as User;

      const eventData = (
        await db.collection("events").doc(data.eventId).get()
      ).data() as Event;

      const isProducer = userData.producers?.some(
        (producer) => producer.id === eventData.producer.id
      );

      if (userAuth.customClaims?.role != "admin" && !isProducer) {
        return {
          success: false,
          message: "No tienes permisos para realizar esta acción",
        };
      }

      await db.collection("events").doc(data.eventId).delete();
      return;
    }
  );
};
