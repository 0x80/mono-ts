import type admin from "firebase-admin";
import * as functions from "firebase-functions";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  to: string;
  templateName: string;
  params: { [key: string]: string };
  qrCodes?: {
    ticketId: string;
    name: string;
    url?: string;
  }[];
  ticketResume?: { name: string; price: string; quantity: number }[];
};

export const sendTicketMail = async (
  db: admin.firestore.Firestore,
  data: Data
) => {
  const { to, templateName, params, ticketResume } = data;
  const newRef = db.collection("mails").doc();
  await db
    .collection("mails")
    .doc(newRef.id)
    .set({
      to: to,
      template: {
        name: templateName,
        data: {
          ...params,
          qrCodes: data.qrCodes ?? [],
          ticketResume: ticketResume ?? [],
        },
      },
    });
  return newRef.id;
};

type ContactData = {
  message: string;
  userName: string;
};

export const sendContactMail = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<ContactData>) => {
      const { data } = request;
      const { message, userName } = data;
      const mail = request.auth?.token.email ?? "anonimo";

      return db.collection("mails").add({
        to: "leon@byearly.com",
        template: {
          name: "user_comment",
          data: {
            message: "Mensaje de " + mail + ": " + message,
            userName: userName,
          },
        },
      });
    }
  );
};
