import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { TicketStatus, type Ticket } from "./interfaces";
import type { Event } from "@repo/types";
import { formatDate } from "../../utils/formatDate";
import { parsePriceToCLP } from "../../utils/parsePrice";
import { saveQrImage } from "../../orders/onUpdate";
import { sendTicketMail } from "../../mails/create";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  eventId: string;
  userMail: string;
  metadata: { [key: string]: string };
};

const getEventData = async (
  db: admin.firestore.Firestore,
  eventId: string
): Promise<Event> => {
  const eventDoc = await db.collection("events").doc(eventId).get();
  return eventDoc.data() as Event;
};

const getUserAuth = async (
  userMail: string
): Promise<admin.auth.UserRecord> => {
  return admin.auth().getUserByEmail(userMail);
};

const createTicket = (
  eventId: string,
  eventData: Event,
  userAuth: admin.auth.UserRecord,
  metadata: { [key: string]: string }
): Ticket => {
  return {
    eventId: eventId,
    eventName: eventData.info.name,
    locationName: eventData.location.name,
    address: eventData.location.address,
    userId: userAuth.uid ?? "",
    eventStart: eventData.info.start,
    eventEnd: eventData.info.end,
    eventImageUrl: eventData.info.image,
    userMail: userAuth.email ?? "",
    userName: userAuth.displayName ?? "",
    userDni: userAuth.customClaims?.dni ?? "",
    channel: "generated",
    resellable: eventData.resell.hasResell,
    metadata: metadata,
    name: "Ticket de Cortesía",
    price: 0,
    date: "",
    hour: 0,
    isConcurrent: false,
    orderId: "",
    producerId: eventData.producer.id,
    type: "normal",
    description: "",
    status: TicketStatus.Active,
    eventActivationDate: admin.firestore.Timestamp.now(),
  };
};

const createMailParams = (
  eventData: Event,
  userAuth: admin.auth.UserRecord
) => {
  return {
    eventName: eventData.info.name,
    userName: userAuth.displayName ?? "",
    userDni: userAuth.customClaims?.dni ?? "",
    eventImageUrl: eventData.info.image,
    eventStartDate: formatDate(eventData.info.start?.toDate() || new Date()),
    eventLocationName: eventData.location.name,
    eventLocationAddress: eventData.location.address,
    totalSelled: parsePriceToCLP(0),
    totalWithServiceFeeSelled: parsePriceToCLP(0),
    serviceFeeSelled: parsePriceToCLP(0),
    eventProducer: eventData.producer.name,
    orderId: "",
    activationDate: formatDate(admin.firestore.Timestamp.now().toDate()),
  };
};

const processTicketGeneration = async (
  db: admin.firestore.Firestore,
  eventId: string,
  userMail: string,
  metadata: { [key: string]: string }
) => {
  const eventData = await getEventData(db, eventId);
  const userAuth = await getUserAuth(userMail);

  const ticket = createTicket(eventId, eventData, userAuth, metadata);

  const ticketRef = db.collection("tickets").doc();
  await db
    .collection("events")
    .doc(eventId)
    .collection("tickets")
    .doc(ticketRef.id)
    .set({ ...ticket, createdAt: admin.firestore.Timestamp.now() });

  const ticketResume = [
    {
      name: "Ticket de Cortesía",
      price: parsePriceToCLP(0),
      quantity: 1,
    },
  ];
  const mailParams = createMailParams(eventData, userAuth);

  const qrInfoUrl = await saveQrImage(
    eventId,
    ticketRef.id,
    userAuth.uid ?? ""
  );

  await sendTicketMail(db, {
    to: userAuth.email ?? "",
    templateName: "buy_ticket_confirmation",
    ticketResume,
    qrCodes: [
      {
        url: qrInfoUrl,
        ticketId: ticketRef.id,
        name: "Ticket de Cortesía",
      },
    ],
    params: mailParams,
  });
};

export const generateTicketFunction = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { eventId, metadata, userMail } = data;

      try {
        await processTicketGeneration(db, eventId, userMail, metadata);

        return "Ticket creado con exito";
      } catch (error) {
        console.error("Error updating tickets: ", error);
        throw new functions.https.HttpsError(
          "internal",
          "Failed to update tickets"
        );
      }
    }
  );
};

export const generateTicketsFromCSV = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (
      request: CallableRequest<{
        eventId: string;
        userMails: string[];
        metadata: { [key: string]: string };
      }>
    ) => {
      const { data } = request;
      const { eventId, metadata, userMails } = data;

      try {
        const results = await Promise.allSettled(
          userMails.map((userMail) =>
            processTicketGeneration(db, eventId, userMail, metadata)
          )
        );

        const successCount = results.filter(
          (result) => result.status === "fulfilled"
        ).length;

        return `Tickets creados con exito: ${successCount}/${userMails.length}`;
      } catch (error) {
        console.error("Error updating tickets: ", error);
        throw new functions.https.HttpsError(
          "internal",
          "Failed to update tickets"
        );
      }
    }
  );
};
