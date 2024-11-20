import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as qrcode from "qrcode";
import { sendTicketMail } from "../mails/create";
import { parsePriceToCLP } from "../utils/parsePrice";
import { formatDate } from "../utils/formatDate";
import { deleteTask } from "../utils/createTask";
import type { Order } from "./interfaces";
import { calculateServiceFee } from "../events/utils";
import type { Event, Schedule } from "@repo/types";
import { calculateStats } from "./approve";
import { approveResellOrders } from "../events/resellOrders/approve";
import { runTransactionWithRetries } from "../utils/transactions";

// Utility function for exponential backoff with retries
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const saveQrImage = async (
  eventId: string,
  ticketId: string,
  userId: string,
  retries = 5
): Promise<string> => {
  const qrCodeBuffer = await qrcode.toBuffer(
    `${eventId},${ticketId},${userId}`,
    { width: 180 }
  );
  const filePath = `events/${eventId}/tickets/${ticketId}.jpg`;
  const file = admin.storage().bucket().file(filePath);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await file.save(qrCodeBuffer, {
        metadata: { contentType: "image/jpeg" },
      });
      await file.makePublic();
      await file.setMetadata({ cacheControl: "public, max-age=31536000" });
      return file.publicUrl(); // Return the public URL once successful
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === 429 && attempt < retries - 1) {
        // Rate limit error
        const backoffTime = Math.pow(2, attempt) * 100; // Exponential backoff
        await delay(backoffTime);
      } else {
        throw error; // Rethrow if it's a different error or last attempt
      }
    }
  }
  throw new Error("Failed to save QR image after multiple attempts.");
};

export const saveQrCode = async (order: Order) => {
  const qrInfos = order.items.flatMap((item) =>
    item.ids.map((ticketId) => ({ ticketId, name: item.name, url: "" }))
  );

  // Adding a small delay between each call to reduce concurrent requests
  const saveQrPromises = qrInfos.map((info, index) =>
    delay(index * 100).then(() =>
      saveQrImage(order.eventId, info.ticketId, order.userId)
    )
  );

  const urls = await Promise.all(saveQrPromises);

  urls.forEach((url, i) => {
    if (qrInfos[i]) {
      qrInfos[i].url = url;
    }
  });

  return qrInfos;
};

const sendConfirmationMail = async (
  db: admin.firestore.Firestore,
  order: Order,
  qrInfos: {
    ticketId: string;
    name: string;
    url: string;
  }[],
  snapshot: functions.Change<functions.firestore.QueryDocumentSnapshot>
) => {
  const templateName = order.hasActivationDate
    ? order.isEventActivated
      ? "buy_ticket_confirmation"
      : "buy_confirmation"
    : "buy_ticket_confirmation";

  const ticketResume = order.items.map((item) => ({
    name: item.name,
    price: parsePriceToCLP(item.price),
    quantity: item.quantity,
  }));

  const mailParams = {
    eventName: order.eventName,
    userName: order.userName,
    userDni: order.userDni,
    eventImageUrl: order.eventImageUrl,
    eventStartDate: formatDate(order.eventStartDate.toDate()),
    eventLocationName: order.eventLocationName,
    eventLocationAddress: order.eventLocationAddress,
    totalSelled: parsePriceToCLP(order.totalSelled),
    totalWithServiceFeeSelled: parsePriceToCLP(order.totalWithServiceFeeSelled),
    serviceFeeSelled: parsePriceToCLP(order.serviceFeeSelled),
    eventProducer: order.eventProducer,
    orderId: snapshot.after.id,
    activationDate: formatDate(order.eventActivationDate.toDate()),
  };

  const ticketMailId = await sendTicketMail(db, {
    to: order.userMail,
    templateName,
    ticketResume,
    qrCodes: qrInfos,
    params: mailParams,
  });
  return ticketMailId;
};

const approveOrderCallback = async (
  db: admin.firestore.Firestore,
  snapshot: functions.Change<functions.firestore.QueryDocumentSnapshot>
) => {
  const order = snapshot.after.data() as Order;
  const qrInfos = await saveQrCode(order);
  const ticketMailId = await sendConfirmationMail(db, order, qrInfos, snapshot);
  return { qrInfos, ticketMailId };
};

const calculateNewSchedule = (
  schedule: Schedule,
  count: number,
  price: number,
  serviceFee: number,
  serviceFeeType: string,
  resellingFee: number,
  normalCount: number,
  resellingCount: number,
  resellEarnings: number
): Schedule => {
  const totalSelled = schedule.totalSelled + normalCount * price;
  const serviceFeeSelled =
    calculateServiceFee({
      total: count * price,
      count: count,
      serviceFee: serviceFee,
      serviceFeeType: serviceFeeType,
    }) + schedule.serviceFeeSelled;
  const totalReselled = schedule.totalReselled + resellEarnings;

  return {
    ...schedule,
    totalReselled,
    totalReselledFee: totalReselled * resellingFee,
    ticketReselledCount: schedule.ticketReselledCount + resellingCount,

    ticketSelledCount:
      schedule.ticketSelledCount +
      normalCount * (schedule.type == "double" ? 2 : 1),
    totalSelled,
    serviceFeeSelled,
    totalWithServiceFeeSelled: totalSelled + serviceFeeSelled,
  };
};

export const calculateNewSchedulesAndStats = (
  eventData: Event,
  orderData: Order,
  resellDeltaEarnings: number,
  resellEarnings: number
) => {
  const newSchedules = eventData.schedule.map((schedule) => {
    const newSchedule = orderData.items.find(
      (item) => schedule.name === item.name
    );
    if (newSchedule) {
      return calculateNewSchedule(
        schedule,
        newSchedule.quantity,
        newSchedule.price,
        eventData.finance.serviceFee,
        eventData.finance.serviceFeeType,
        eventData.resell.resellFee,
        newSchedule.normalCount,
        newSchedule.resellingCount,
        resellEarnings
      );
    }
    return schedule;
  });
  const stats = calculateStats(newSchedules, eventData, resellDeltaEarnings);
  return { newSchedules, stats };
};

const calculateNewSchedules = async (
  db: admin.firestore.Firestore,
  snap: functions.firestore.QueryDocumentSnapshot,
  resellDeltaEarnings: number,
  resellEarnings: number
) => {
  const orderData = snap.data() as Order;
  const eventRef = db.collection("events").doc(orderData.eventId);

  await runTransactionWithRetries(db, async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (!eventDoc.exists) {
      throw new Error("Event not found");
    }

    const eventData = eventDoc.data() as Event;
    const { newSchedules, stats } = calculateNewSchedulesAndStats(
      eventData,
      orderData,
      resellDeltaEarnings,
      resellEarnings
    );

    await transaction.update(eventRef, {
      schedule: newSchedules,
      stats: stats,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
};

export const onUpdateOrder = (db: admin.firestore.Firestore) => {
  return functions.firestore.onDocumentUpdated(
    "orders/{orderId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        console.error("No snapshot found");
        return;
      }
      const newStatus = snapshot.after.data().status;
      const oldStatus = snapshot.before.data().status;
      const isProcessed = snapshot.after.data().processed ?? false;

      try {
        if (isProcessed) {
          console.log("Order already processed, skipping.");
          return;
        }
        if (
          ["Approved", "Rejected"].includes(newStatus) &&
          oldStatus === "Pending"
        ) {
          await deleteTask(snapshot.after.data().taskId);
          if (newStatus === "Approved") {
            const { qrInfos, ticketMailId } = await approveOrderCallback(
              db,
              snapshot
            );
            const { resellDeltaEarnings, resellEarnings } =
              await approveResellOrders(db, snapshot.after.data() as Order);
            await calculateNewSchedules(
              db,
              snapshot.after,
              resellDeltaEarnings,
              resellEarnings
            );
            await snapshot.after.ref.update({
              qrInfos,
              resellDeltaEarnings,
              ticketMailId,
              processed: true, // Set flag to avoid retriggering
            });
          }
          return;
        }
      } catch (error) {
        console.error(error);
        return;
      }
    }
  );
};
