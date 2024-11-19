import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import { sendTicketMail } from "../../mails/create";
import { parsePriceToCLP } from "../../utils/parsePrice";
import { formatDate } from "../../utils/formatDate";
import type { Order } from "../../orders/interfaces";
import { sendNotificationToUsers } from "./utils";

export const activateTickets = (db: admin.firestore.Firestore) => {
  return functions.https.onRequest(
    {
      timeoutSeconds: 540, // Set the maximum timeout
      memory: "512MiB", // Set the maximum memory
      region: "southamerica-east1",
    },
    async (req, res) => {
      const eventId = req.body.eventId;
      const tickets = await db
        .collection("events")
        .doc(eventId)
        .collection("tickets")
        .where("status", "in", ["Pending"])
        .get();
      let currentBatch = db.batch();
      let currentBatchSize = 0;
      const batches = [currentBatch];
      // Add each doc's deletion to the batch
      tickets.docs.forEach((doc) => {
        // When batch is too large, start a new one
        if (++currentBatchSize >= 500) {
          currentBatch = db.batch();
          batches.push(currentBatch);
          currentBatchSize = 1;
        }
        // Add operation to batch
        currentBatch.update(doc.ref, { status: "Active" });
      });

      // Commit the changes
      await Promise.all(batches.map((batch) => batch.commit()));
      functions.logger.info("Tickets activated successfully");

      const sendMailsPromises: Promise<string>[] = [];
      const sendNotificationsPromises: Promise<void>[] = [];
      const orders = await db
        .collection("orders")
        .where("eventId", "==", eventId)
        .where("status", "==", "Approved")
        .where("isEventActivated", "==", false)
        .get();

      orders.forEach((orderRef) => {
        const order = orderRef.data() as Order;
        if (order.qrInfos && order.qrInfos.length >= 0) {
          sendMailsPromises.push(
            sendTicketMail(db, {
              to: order.userMail,
              templateName: "tickets_activation",
              qrCodes: order.qrInfos,
              params: {
                eventName: order.eventName,
                userName: order.userName,
                userDni: order.userDni,
                eventImageUrl: order.eventImageUrl,
                eventStartDate: formatDate(order.eventStartDate.toDate()),
                eventLocationName: order.eventLocationName,
                eventLocationAddress: order.eventLocationAddress,
                totalSelled: parsePriceToCLP(order.totalSelled),
                totalWithServiceFeeSelled: parsePriceToCLP(
                  order.totalWithServiceFeeSelled
                ),
                serviceFeeSelled: parsePriceToCLP(order.serviceFeeSelled),
                eventProducer: order.eventProducer,
                orderId: orderRef.id,
              },
            })
          );
          sendNotificationsPromises.push(
            sendNotificationToUsers(
              db,
              order.userId,
              order.eventName,
              "¡Tus tickets han sido activados!",
              "EventTickets",
              {
                eventId: eventId,
              }
            )
          );
        }
      });
      await Promise.all(sendMailsPromises);
      functions.logger.info("Mails send successfully");
      await Promise.all(sendNotificationsPromises);

      functions.logger.info("Notifications send successfully");

      res.status(200).send("Tickets activated successfully");
      return;
    }
  );
};
