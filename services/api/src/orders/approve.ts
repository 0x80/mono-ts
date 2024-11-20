import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import type { Ticket } from "../events/tickets/interfaces";
import type { Order, OrderItem } from "./interfaces";
import type { Event, Schedule, Stats } from "@repo/types";
import { deleteTask } from "../utils/createTask";

export const calculateStats = (
  newSchedules: Schedule[],
  eventData: Event,
  resellDeltaEarnings = 0
): Stats => {
  const totalSelled = newSchedules.reduce(
    (acc, schedule) => acc + schedule.totalSelled,
    0
  );
  const serviceFeeSelled = newSchedules.reduce(
    (acc, schedule) => acc + schedule.serviceFeeSelled,
    0
  );
  return {
    ...eventData.stats,
    serviceFeeSelled: serviceFeeSelled,
    totalSelled: totalSelled,
    totalWithServiceFeeSelled: totalSelled + serviceFeeSelled,
    ticketCount: newSchedules.reduce(
      (acc, schedule) => acc + schedule.ticketCount,
      0
    ),
    ticketResellCount: newSchedules.reduce(
      (acc, schedule) => acc + schedule.ticketResellCount,
      0
    ),
    ticketTotal: eventData.stats.ticketTotal,
    resellingTickets: newSchedules.reduce(
      (acc, schedule) => acc + schedule.resellingTickets,
      0
    ),
    totalReselled: newSchedules.reduce(
      (acc, schedule) => acc + schedule.totalReselled,
      0
    ),
    totalReselledFee: newSchedules.reduce(
      (acc, schedule) => acc + schedule.totalReselledFee,
      0
    ),
    ticketReselledCount: newSchedules.reduce(
      (acc, schedule) => acc + schedule.ticketReselledCount,
      0
    ),
    ticketSelledCount: newSchedules.reduce(
      (acc, schedule) => acc + schedule.ticketSelledCount,
      0
    ),
    resellDeltaEarnings:
      eventData.stats.resellDeltaEarnings + resellDeltaEarnings || 0,
  };
};

export const groupTickets = (
  ticketsGrouped: OrderItem[],
  tickets: {
    id: string;
    ticket: Ticket;
  }[]
) => {
  for (let i = 0; i < tickets.length; i++) {
    for (let j = 0; j < ticketsGrouped.length; j++) {
      const item = ticketsGrouped[j];
      const ticket = tickets[i];
      if (item && ticket && item.name === ticket.ticket.name) {
        item.ids.push(ticket.id);
      }
    }
  }

  return Object.values(ticketsGrouped);
};

export const approveOrder = async (
  transaction: FirebaseFirestore.Transaction,
  orderRef: admin.firestore.DocumentReference<
    admin.firestore.DocumentData,
    admin.firestore.DocumentData
  >,
  channel: string,
  channelId: string,
  tickets: {
    id: string;
    ticket: Ticket;
  }[],
  orderData: Order,
  metadata?: { [key: string]: { [key: string]: string } }
) => {
  functions.logger.info("Updating order");

  const ticketsGrouped = [...orderData.items];
  await deleteTask(orderData.taskId ?? "");
  // agregar ids de los tickets
  return transaction.update(orderRef, {
    channel: channel,
    channelId: channelId,
    status: "Approved",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    items: groupTickets(ticketsGrouped, tickets),
    metadata: metadata ?? orderData.metadata,
  });
};
