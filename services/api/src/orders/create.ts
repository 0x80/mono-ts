import * as admin from "firebase-admin";
import { OrderStatus, type Order, type OrderItem } from "./interfaces";
import type { Event } from "@repo/types";
import type { TotalPrices } from "../events/calculateTotals";
import { createTask } from "../utils/createTask";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { getCurrentEnv } from "../utils/getCurrentEnv";

const getTicketGrouped = (
  totalPrices: TotalPrices
): { ticketsGrouped: OrderItem[]; count: number } => {
  const ticketsGrouped = [];
  let count = 0;
  for (const ticket of totalPrices.schedules) {
    if (ticket.count > 0) {
      const ticketData: OrderItem = {
        name: ticket.name,
        price: Math.round(ticket.price),
        type: ticket.type,
        quantity: ticket.count,
        normalCount: ticket.normalCount,
        resellingCount: ticket.resellingCount,
        description: ticket.description,
        ids: [],
        serviceFee: ticket.serviceFee,
      };
      ticketsGrouped.push(ticketData);
      count += ticket.count;
    }
  }

  return { ticketsGrouped, count };
};

const getConcurrentDate = (
  date: Timestamp,
  isConcurrent: boolean,
  concurrentDate: number
): Timestamp => {
  return isConcurrent
    ? Timestamp.fromDate(concurrentDate ? new Date(concurrentDate) : new Date())
    : date;
};

export const createOrder = async (
  db: admin.firestore.Firestore,
  eventData: Event,
  eventId: string,
  user: admin.auth.UserRecord,
  concurrentDate: number,
  totalPrices: TotalPrices,
  date: string,
  hour: number,
  deviceType: string,
  expirationDate: string,
  isEventActivated?: boolean,

  metadata?: { [key: string]: { [key: string]: string } }
): Promise<{
  success: boolean;
  message: string;
  orderId?: string;
  floidPaymentUrl?: string;
}> => {
  const orderReference = db.collection("orders").doc();
  const eventActivationDate = eventData.info.start?.toDate() ?? new Date();
  eventActivationDate.setMinutes(
    eventActivationDate.getMinutes() - (eventData.info.activationDate ?? 0) * 60
  );
  let dni = user.customClaims?.dni;
  if ((user.customClaims?.dni ?? "") === "") {
    const userData = await db.collection("users").doc(user.uid).get();
    await admin.auth().setCustomUserClaims(user.uid, {
      ...user.customClaims,
      dni: userData.data()?.dni,
    });
    dni = userData.data()?.dni;
  }

  const { ticketsGrouped, count } = getTicketGrouped(totalPrices);

  const order: Order = {
    producerId: eventData.producer.id,
    userId: user.uid,
    eventName: eventData.info.name,
    status: OrderStatus.Pending,
    eventId: eventId,
    userName: user.displayName ?? "",
    eventEndDate: getConcurrentDate(
      eventData.info.end ?? Timestamp.now(),
      eventData.info.isConcurrent,
      concurrentDate
    ),
    hasActivationDate: eventData.info.activationDate != 0 ? true : false,
    eventImageUrl: eventData.info.image,
    userMail: user.email ?? "",
    userDni: dni,
    eventStartDate: getConcurrentDate(
      eventData.info.start ?? Timestamp.now(),
      eventData.info.isConcurrent,
      concurrentDate
    ),
    eventActivationDate: getConcurrentDate(
      Timestamp.fromDate(eventActivationDate),
      eventData.info.isConcurrent,
      concurrentDate
    ),
    eventLocationName: eventData.location.name,
    eventLocationAddress: eventData.location.address,
    eventProducer: eventData.producer.name,
    eventProducerId: eventData.producer.id,
    totalSelled: Math.round(totalPrices.total),
    totalWithServiceFeeSelled: Math.round(totalPrices.totalWithServiceFee),
    serviceFeeSelled: Math.round(totalPrices.serviceFee),
    items: ticketsGrouped,
    itemCount: count,
    isConcurrent: eventData.info.isConcurrent ?? false,
    orderId: orderReference.id,
    channel: "",
    date: date,
    hour: hour,
    isEventActivated: isEventActivated ?? false,
    metadata: metadata ?? {},
    deviceType: deviceType ?? "",
    expirationDate: expirationDate,
    resellable: eventData.resell.hasResell,
    serviceFeeHidden: eventData.finance.serviceFeeHidden,
  };

  return orderReference
    .set({
      ...order,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    .then(async () => {
      const { projectId } = getCurrentEnv();
      const taskId = await createTask(
        `https://southamerica-east1-${projectId}.cloudfunctions.net/expireOrder`,
        {
          orderId: orderReference.id,
        },
        Math.floor(Date.now() / 1000) +
          12 * 60 +
          Math.floor(Math.random() * 100),

        "ordersExpireQueue"
      );
      await orderReference.update({
        taskId: taskId,
      });
      return {
        success: true,
        message: "Order created successfully",
        orderId: orderReference.id,
      };
    })
    .catch((error) => {
      return {
        success: false,
        message: error.message,
      };
    });
};
