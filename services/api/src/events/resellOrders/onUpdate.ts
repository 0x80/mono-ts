import * as functions from "firebase-functions";
import type { ResellOrder } from "./interfaces";
import { sendTicketMail } from "../../mails/create";
import type admin from "firebase-admin";
import { parsePriceToCLP } from "../../utils/parsePrice";

export const onUpdateResellOrder = (db: admin.firestore.Firestore) => {
  return functions.firestore.onDocumentUpdated(
    "events/{eventId}/resellOrders/{resellOrderId}",

    async (event) => {
      functions.logger.info("Checking resell status");
      const snapshot = event.data;

      if (
        snapshot?.after.data().status == "Approved" &&
        snapshot.before.data().status == "Pending"
      ) {
        const resellData = snapshot.after.data() as ResellOrder;
        await sendTicketMail(db, {
          to: resellData.userEmail,
          templateName: "resell_ticket_confirmation",
          params: {
            eventName: resellData.eventName,
            ticketName: resellData.ticketName,
            eventImageUrl: resellData.eventImageUrl,
            userName: resellData.userName,
            totalSelled: parsePriceToCLP(resellData.total),
            orderId: snapshot.after.id,
          },
          qrCodes: [],
          ticketResume: [],
        });
      }
    }
  );
};
