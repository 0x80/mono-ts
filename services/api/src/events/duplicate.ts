import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { User } from "../users/interfaces";
import type { Event, EventForm } from "@repo/types";
import { getEventData } from "./create";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  eventId: string;
};

export const duplicateEvent = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const userAuth = await admin.auth().getUser(request.auth?.uid ?? "");
      const userData = await getUserData(db, userAuth.uid);
      const eventData = await getEventDataById(db, data.eventId);

      if (!hasPermission(userAuth, userData, eventData)) {
        return {
          success: false,
          message: "No tienes permisos para realizar esta acción",
        };
      }

      const eventForm = createEventForm(eventData);
      const newEvent = getEventData(eventForm, eventData.info.image);

      await db.collection("events").add({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ...newEvent,
        neoId: "",
      });
      return;
    }
  );
};

const getUserData = async (
  db: admin.firestore.Firestore,
  uid: string
): Promise<User> => {
  const userDoc = await db.collection("users").doc(uid).get();
  return userDoc.data() as User;
};

const getEventDataById = async (
  db: admin.firestore.Firestore,
  eventId: string
): Promise<Event> => {
  const eventDoc = await db.collection("events").doc(eventId).get();
  return eventDoc.data() as Event;
};

const hasPermission = (
  userAuth: admin.auth.UserRecord,
  userData: User,
  eventData: Event
): boolean => {
  const isProducer = userData.producers?.some(
    (producer) => producer.id === eventData.producer.id
  );
  return userAuth.customClaims?.role == "admin" || isProducer;
};

const createEventForm = (eventData: Event): EventForm => {
  return {
    info: {
      description: eventData.info.description,
      end: eventData.info.end ? eventData.info.end.toDate() : new Date(),
      image: eventData.info.image,
      name: eventData.info.name + " (Copia)",
      start: eventData.info.start ? eventData.info.start.toDate() : new Date(),
      activationDate: eventData.info.activationDate,
      tags: eventData.info.tags,
      isConcurrent: eventData.info.isConcurrent,
      isExternal: eventData.info.isExternal,
      externalUrl: eventData.info.externalUrl,
      activityType: eventData.info.activityType,
      spotifyUrl: eventData.info.spotifyUrl,
    },
    finance: {
      serviceFee: eventData.finance.serviceFee,
      serviceFeeType: eventData.finance.serviceFeeType,
      serviceFeeHidden: eventData.finance.serviceFeeHidden ?? false,
    },
    location: {
      address: eventData.location.address,
      name: eventData.location.name,
      lat: eventData.location.lat,
      lng: eventData.location.lng,
    },
    producer: {
      image: eventData.producer.image,
      name: eventData.producer.name,
      id: eventData.producer.id,
      domains: eventData.producer.domains,
    },
    resell: {
      hasResell: eventData.resell.hasResell,
      resellQueueNumber: eventData.resell.resellQueueNumber,
      resellHighestPrice: eventData.resell.resellHighestPrice,
      resellFee: eventData.resell.resellFee,
    },
    schedule: eventData.schedule.map((schedule) => ({
      name: schedule.name,
      price: schedule.price,
      ticketTotal: schedule.ticketTotal,
      maxTicketPerBuy: schedule.maxTicketPerBuy,
      id: schedule.id ?? "",
      type: schedule.type,
      description: schedule.description,
    })),
    operations: {
      requiredMetadata: eventData.operations.requiredMetadata,
      hasNonUserSell: eventData.operations.hasNonUserSell ?? false,
    },
  };
};
