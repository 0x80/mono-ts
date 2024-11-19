import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { Ticket } from "./interfaces";
import { TicketStatus } from "./interfaces";

import type { Order } from "../../orders/interfaces";

type TotalPrices = {
  total: number;
  serviceFee: number;
  totalWithServiceFee: number;
  schedules: {
    count: number;
    name: string;
    price: number;
    total: number;
    maxTicketPerBuy: number;
  }[];
};

export type ApiResult = {
  success: boolean;
  message: string;
  totalPrices?: TotalPrices;
};

const calculateTicketPrice = (ticketPrice: number, type: string): number => {
  return type === "double" ? Math.round(ticketPrice / 2) : ticketPrice;
};

const determineTicketStatus = (orderData: Order): TicketStatus => {
  return !orderData.isEventActivated && orderData.hasActivationDate
    ? TicketStatus.Pending
    : TicketStatus.Active;
};

export const createTicket = (
  orderData: Order,
  ticketPrice: number,
  ticketName: string,
  date: string,
  hour: number,
  type: string,
  ticketDescription: string,
  channel: string,
  metadata: { [key: string]: string }
): Ticket => {
  return {
    eventId: orderData.eventId,
    eventName: orderData.eventName,
    locationName: orderData.eventLocationName,
    address: orderData.eventLocationAddress,
    eventActivationDate: orderData.eventActivationDate,
    userId: orderData.userId,
    status: determineTicketStatus(orderData),
    eventStart: orderData.eventStartDate,
    eventEnd: orderData.eventEndDate,
    eventImageUrl: orderData.eventImageUrl,
    userMail: orderData.userMail,
    userName: orderData.userName,
    userDni: orderData.userDni,
    name: ticketName,
    price: calculateTicketPrice(ticketPrice, type),
    date: date,
    hour: hour,
    isConcurrent: orderData.isConcurrent ?? false,
    orderId: orderData.orderId,
    producerId: orderData.producerId,
    type: type,
    description: ticketDescription,
    metadata: metadata,
    channel: channel,
    resellable: orderData.resellable ?? true,
  };
};

export const generateTickets = (
  orderData: Order,
  channel: string,
  metadata: { [key: string]: { [key: string]: string } }
): Ticket[] => {
  const tickets: Ticket[] = [];

  orderData.items.forEach((schedule) => {
    const isDouble = schedule.type === "double";
    let i = 0;

    for (let k = 0; k < schedule.quantity; k++) {
      const ticketNameRef = `${schedule.name}-${i}`;
      tickets.push(
        createTicket(
          orderData,
          schedule.price,
          schedule.name,
          orderData.date,
          orderData.hour,
          schedule.type,
          schedule.description,
          channel,
          metadata[ticketNameRef] ?? {}
        )
      );
      i++;

      if (isDouble) {
        const doubleTicketNameRef = `${schedule.name}-${i}`;
        tickets.push(
          createTicket(
            orderData,
            schedule.price,
            schedule.name,
            orderData.date,
            orderData.hour,
            schedule.type,
            schedule.description,
            channel,
            metadata[doubleTicketNameRef] ?? {}
          )
        );
        i++;
      }
    }
  });

  return tickets;
};

export const createTicketsHandler = async (
  db: admin.firestore.Firestore,
  orderData: Order,
  channel: string,
  metadata?: { [key: string]: { [key: string]: string } }
): Promise<{ id: string; ticket: Ticket }[]> => {
  const tickets = generateTickets(
    orderData,
    channel,
    metadata ?? orderData.metadata ?? {}
  );
  const batch = db.batch();
  const newTicketsRef: { id: string; ticket: Ticket }[] = [];

  tickets.forEach((ticket) => {
    const ticketRef = db
      .collection("events")
      .doc(orderData.eventId)
      .collection("tickets")
      .doc();
    newTicketsRef.push({ id: ticketRef.id, ticket: ticket });
    batch.set(ticketRef, {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...ticket,
    });
  });

  await batch.commit();
  functions.logger.info("Tickets Created Successfully");
  return newTicketsRef;
};
