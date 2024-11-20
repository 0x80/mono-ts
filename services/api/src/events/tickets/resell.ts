import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { TicketStatus, type Ticket } from "./interfaces";
import type { Event, Schedule } from "@repo/types";
import { cancelResellOrder, createResellOrder } from "../resellOrders/create";
import { runTransactionWithRetries } from "../../utils/transactions";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  userId: string;
  eventId: string;
  ticketId: string;
  userName: string;
  userEmail: string;
  eventImageUrl: string;
  bankName: string;
  bankAccountType: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankAccountDni: string;
  bankAccountEmail: string;
  activated: boolean;
};

export const resellSameCategory = (
  ticket: Ticket,
  ticketName: string,
  schedule: Schedule[],
  cancel?: boolean
): {
  newSchedule: Schedule[];
  newTicketRef: { name: string; price: number };
} => {
  const newSchedule = schedule.map((item) => {
    if (item.name === ticketName) {
      return {
        ...item,
        resellingTickets: cancel
          ? item.resellingTickets - 1
          : item.resellingTickets + 1,
      };
    }
    return item;
  });

  return {
    newSchedule,
    newTicketRef: {
      name: ticketName,
      price: ticket.price,
    },
  };
};

export const resellHighestPrice = (
  ticketData: Ticket,
  schedule: Schedule[],
  cancel?: boolean
): {
  newSchedule: Schedule[];
  newTicketRef: { name: string; price: number };
} => {
  if (cancel) {
    return resellSameCategory(
      ticketData,
      ticketData.resellRef ?? "",
      schedule,
      cancel
    );
  }
  // find the highest price ticket with available tickets after the matched ticket
  let foundTicket = false;
  let highestPriceTicket: Schedule | null = null;

  for (const item of schedule) {
    if (item.type === "double") {
      continue;
    }
    if (foundTicket && item.ticketCount < item.ticketTotal) {
      highestPriceTicket = item;
    }
    if (item.name === ticketData.name) {
      foundTicket = true;
      if (item.ticketCount < item.ticketTotal) {
        highestPriceTicket = item;
        // break;
      }
    }
  }

  // if no ticket is found, use the last ticket
  if (highestPriceTicket == null && schedule.length > 0) {
    // get last ticket that is not double
    for (let i = schedule.length - 1; i >= 0; i--) {
      const currentTicket = schedule[i];
      if (currentTicket && currentTicket.type !== "double") {
        highestPriceTicket = currentTicket;
        break;
      }
    }
  }
  if (highestPriceTicket == null) {
    return {
      newSchedule: schedule,
      newTicketRef: {
        name: ticketData.name,
        price: ticketData.price,
      },
    };
  }

  // return updated schedule
  const newSchedule = schedule.map((item) => {
    if (item.name === highestPriceTicket?.name) {
      return {
        ...item,
        resellingTickets: cancel
          ? item.resellingTickets - 1
          : item.resellingTickets + 1,
      };
    }
    return item;
  });

  return {
    newSchedule,
    newTicketRef: {
      name: highestPriceTicket.name,
      price: highestPriceTicket.price,
    },
  };
};

const handleResellTransaction = async (
  db: admin.firestore.Firestore,
  data: Data,
  cancel: boolean,
  userId: string
) => {
  const { eventId, ticketId } = data;
  const eventRef = db.collection("events").doc(eventId);
  const ticketRef = eventRef.collection("tickets").doc(ticketId);

  try {
    await runTransactionWithRetries(db, async (transaction) => {
      const eventDoc = await transaction.get(eventRef);
      const ticketDoc = await transaction.get(ticketRef);

      if (!eventDoc.exists || !ticketDoc.exists) {
        throw new Error("Document does not exist");
      }

      const eventData = eventDoc.data() as Event;
      const ticketData = ticketDoc.data() as Ticket;

      if (
        (cancel && ticketData.status === "Reselling") ||
        (ticketData.status === "Pending" && eventData.resell.hasResell)
      ) {
        const { newSchedule, newTicketRef } = eventData.resell
          .resellHighestPrice
          ? resellHighestPrice(ticketData, eventData.schedule, cancel)
          : resellSameCategory(
              ticketData,
              ticketData.name,
              eventData.schedule,
              cancel
            );

        const newTicketStatus = cancel
          ? data.activated
            ? TicketStatus.Active
            : TicketStatus.Pending
          : TicketStatus.Reselling;
        const resellingTicketsChange = cancel ? -1 : 1;
        if (newTicketStatus === TicketStatus.Reselling) {
          await createResellOrder(
            db,
            data,
            ticketData.price,
            ticketData.name,
            newTicketRef,
            ticketData.eventName,
            eventData.resell,
            userId,
            ticketData.orderId
          );
        } else if (
          [TicketStatus.Pending, TicketStatus.Active].includes(newTicketStatus)
        ) {
          await cancelResellOrder(db, data.eventId, data.ticketId);
        }

        await transaction.update(ticketRef, {
          status: newTicketStatus,
          resellRef: newTicketRef.name,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await transaction.update(eventRef, {
          schedule: newSchedule,
          stats: {
            ...eventData.stats,
            resellingTickets:
              eventData.stats.resellingTickets + resellingTicketsChange,
          },
        });
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      // Standard JavaScript error handling
      functions.logger.warn(error);
      throw new functions.https.HttpsError("unknown", error.message);
    } else {
      // If the error doesn't match the Error type, handle it generically
      functions.logger.warn("An unknown error occurred", error);
      throw new functions.https.HttpsError(
        "unknown",
        "An unknown error occurred"
      );
    }
  }
};

export const resellTicket = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;

      await handleResellTransaction(db, data, false, request.auth?.uid ?? "");
    }
  );
};

export const cancelResellTicket = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;

      await handleResellTransaction(db, data, true, request.auth?.uid ?? "");
    }
  );
};
