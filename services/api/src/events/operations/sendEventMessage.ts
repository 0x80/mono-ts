import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { Ticket } from "../tickets/interfaces";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  eventId: string;
  message: string;
  subject: string;
  eventImageUrl: string;
};

export const sendEventMessage = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      try {
        const { message, eventId, subject, eventImageUrl } = data;
        const emails = new Set<string>();
        await db
          .collection("events")
          .doc(eventId)
          .collection("tickets")
          .get()
          .then((snapshot) => {
            snapshot.forEach((doc) => {
              const ticket = doc.data() as Ticket;
              emails.add(ticket.userMail);
            });
          });

        const emailPromises = Array.from(emails).map((email) =>
          db.collection("mails").add({
            to: email,
            template: {
              name: "event_message",
              data: {
                message,
                subject,
                eventImageUrl,
              },
            },
          })
        );
        await Promise.all(emailPromises);
        return;
      } catch (error) {
        console.error(error);
        return;
      }
    }
  );
};
