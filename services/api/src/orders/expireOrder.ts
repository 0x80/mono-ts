import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { OrderStatus, type Order } from "./interfaces";
import type { Event } from "@repo/types";
import { calculateStats } from "./approve";
import { runTransactionWithRetries } from "../utils/transactions";
import { getCurrentEnv } from "../utils/getCurrentEnv";

const MAX_RETRIES = 10;

export const getNewScheduleAndStatsExpired = async (
  eventData: Event,
  order: Order
) => {
  const eventSchedule = eventData.schedule;
  const newSchedules = eventSchedule.map((schedule) => {
    const item = order.items.find((item) => item.name === schedule.name);

    if (item) {
      const newCount =
        schedule.ticketCount -
        item.normalCount * (schedule.type == "double" ? 2 : 1);

      const newResellCount = schedule.ticketResellCount - item.resellingCount;
      return {
        ...schedule,
        resellingTickets: schedule.resellingTickets + item.resellingCount,
        ticketCount:
          newCount > schedule.ticketSelledCount
            ? newCount
            : schedule.ticketSelledCount,
        ticketResellCount:
          newResellCount > schedule.ticketReselledCount
            ? schedule.ticketResellCount - item.resellingCount
            : schedule.ticketReselledCount,
      };
    }
    return schedule;
  });
  const stats = calculateStats(newSchedules, eventData);
  return { newSchedules, stats };
};

export const expireOrderHandler = async (
  db: admin.firestore.Firestore,
  transaction: FirebaseFirestore.Transaction,
  orderRef: FirebaseFirestore.DocumentReference,
  order: Order,
  status: "Expired" | "Rejected",
  channel?: string
) => {
  const eventRef = db.collection("events").doc(order.eventId);
  const eventDoc = await transaction.get(eventRef);
  if (!eventDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Event not found");
  }
  const eventData = eventDoc.data() as Event;
  const { newSchedules, stats } = await getNewScheduleAndStatsExpired(
    eventData,
    order
  );

  await transaction.update(orderRef, {
    status: status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    channel: channel ?? "",
  });
  await transaction.update(eventRef, {
    schedule: newSchedules,
    stats: stats,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};

export const expireOrder = (db: admin.firestore.Firestore) => {
  const { isDev } = getCurrentEnv();

  return functions.https.onRequest(
    {
      minInstances: isDev ? 0 : 1,
      maxInstances: 100,
      region: "southamerica-east1",
    },
    async (req, res) => {
      const orderId = req.body.orderId;
      const orderRef = db.collection("orders").doc(orderId);

      let error: functions.https.HttpsError | null = null;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          await runTransactionWithRetries(db, async (transaction) => {
            const orderDoc = await transaction.get(orderRef);

            if (!orderDoc.exists) {
              functions.logger.error("Order not found");
              return;
            }
            const order = orderDoc.data() as Order;

            if (order.status !== "Pending") {
              functions.logger.error("Order not pending");
              return;
            }

            await expireOrderHandler(
              db,
              transaction,
              orderRef,
              order,
              OrderStatus.Expired
            );
          });

          break;
        } catch (err) {
          error = err as functions.https.HttpsError;

          if (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).code === 10 /* ABORTED */ &&
            attempt < MAX_RETRIES - 1
          ) {
            const waitTime =
              Math.pow(2, attempt) * 100 + Math.floor(Math.random() * 100);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          } else {
            functions.logger.error(error);
            break;
          }
        }
      }

      res.status(200).send("Order expired successfully");
    }
  );
};
