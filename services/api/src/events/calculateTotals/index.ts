import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { Event, Schedule, Stats } from "@repo/types";
import { calculateServiceFee } from "../utils";
import { createOrder } from "../../orders/create";
import { getCurrentEnv } from "../../utils/getCurrentEnv";
import type { UserRecord } from "firebase-admin/auth";
import { calculateResellingCount } from "./checkResellable";
import { checkIfHasPrivateDomain } from "./checkPrivate";
import type { CallableRequest } from "firebase-functions/https";
import { runTransactionWithRetries } from "../../utils/transactions";

export type TicketCount = {
  name: string;
  count: number;
};

export type TicketSchedule = {
  name: string;
  price: number;
  count: number;
  total: number;
  serviceFee: number;
  totalWithServiceFee: number;
  normalCount: number;
  resellingCount: number;
  type: string;
  description: string;
};

export type TotalPrices = {
  total: number;
  serviceFee: number;
  totalWithServiceFee: number;
  schedules: TicketSchedule[];
  lessAvailableTickets: boolean;
  serviceFeeHidden: boolean;
};

type Data = {
  ticketCount: TicketCount[];
  eventId: string;
  concurrentDate: number;
  date: string;
  hour: number;
  expirationDate: string;
  deviceType: string;
  isEventActivated?: boolean;
  isPresencial?: boolean;
  metadata?: { [key: string]: { [key: string]: string } };
};

const calculateStats = (newSchedules: Schedule[], eventData: Event): Stats => ({
  ...eventData.stats,
  ticketCount: newSchedules.reduce(
    (acc, schedule) => acc + schedule.ticketCount,
    0
  ),
  resellingTickets: newSchedules.reduce(
    (acc, schedule) => acc + schedule.resellingTickets,
    0
  ),
  ticketResellCount: newSchedules.reduce(
    (acc, schedule) => acc + schedule.ticketReselledCount,
    0
  ),
});

const calculateNewSchedule = (
  schedule: Schedule,
  normalCount: number,
  resellingCount: number
): Schedule => ({
  ...schedule,
  resellingTickets: schedule.resellingTickets - resellingCount,
  ticketCount:
    schedule.ticketCount + normalCount * (schedule.type == "double" ? 2 : 1),
  ticketResellCount: schedule.ticketResellCount + resellingCount,
});

const processTicket = (
  ticket: TicketCount,
  event: Event,
  totalPrices: TotalPrices,
  userEmail: string,
  deviceType: string
): {
  newSchedule: Schedule;
  ticketSchedule: TicketSchedule | null;
  lessAvailableTickets: boolean;
} => {
  const schedule = event.schedule.find((s) => s.name === ticket.name);
  if (!schedule) {
    throw new Error(`Schedule not found for ticket ${ticket.name}`);
  }

  let count = ticket.count;

  if (!(schedule.visible ?? true) && deviceType != "presencial" && count > 0) {
    throw new Error(
      "Ups! El ticket " +
        schedule.name +
        " no está disponible, refrezca la página e inténtalo de nuevo"
    );
  }

  if (
    schedule.ticketTotal == 0 ||
    count + schedule.ticketCount >
      schedule.ticketTotal + schedule.resellingTickets ||
    count + schedule.ticketSelledCount >
      schedule.ticketTotal + schedule.resellingTickets
  ) {
    count =
      schedule.ticketTotal + schedule.resellingTickets - schedule.ticketCount;
    totalPrices.lessAvailableTickets = true;
    throw new Error(
      "Ups! No quedan tickets " +
        schedule.name +
        ", refrezca y inténtalo de nuevo"
    );
  }

  if (
    schedule.maxTicketPerBuy > 0 &&
    count > schedule.maxTicketPerBuy &&
    (schedule.ticketTotal !== 0 || event.info.isConcurrent)
  ) {
    count = schedule.maxTicketPerBuy;
    totalPrices.lessAvailableTickets = true;
    throw new Error(
      "Ups! No puedes seleccionar más del permitido del ticket " + schedule.name
    );
  }

  const { normalCount, resellingCount } = calculateResellingCount(
    count,
    schedule,
    event.resell.resellQueueNumber,
    event.resell.hasResell
  );

  const total = schedule.price * count;
  const serviceFee = calculateServiceFee({
    total,
    count,
    serviceFee: event.finance.serviceFee,
    serviceFeeType: event.finance.serviceFeeType,
  });

  totalPrices.total += total;
  totalPrices.totalWithServiceFee += total + serviceFee;
  totalPrices.serviceFee += serviceFee;

  if (count > 0) {
    if (["unique", "private"].includes(schedule.type)) {
      if (
        schedule.type === "unique" &&
        checkIfHasPrivateDomain(event.producer.domains ?? null, userEmail)
      ) {
        throw new Error(
          "Ups! No tienes permiso para comprar el ticket " +
            schedule.name +
            ", revisa la descripción del ticket!"
        );
      }
      if (count > 1)
        throw new Error(
          "Ups! Solo puedes comprar una entrada única para este evento"
        );
    }

    const ticketSchedule: TicketSchedule = {
      name: schedule.name,
      price: schedule.price,
      count,
      total,
      serviceFee,
      totalWithServiceFee: total + serviceFee,
      normalCount,
      resellingCount,
      type: schedule.type ?? "normal",
      description: schedule.description ?? "",
    };

    const newSchedule = calculateNewSchedule(
      schedule,
      normalCount,
      resellingCount
    );

    return {
      newSchedule,
      ticketSchedule,
      lessAvailableTickets: totalPrices.lessAvailableTickets,
    };
  }

  return {
    newSchedule: schedule,
    ticketSchedule: null,
    lessAvailableTickets: totalPrices.lessAvailableTickets,
  };
};

export const calculateTotalHandler = async (
  event: Event,
  ticketCount: TicketCount[],
  userEmail: string,
  deviceType: string
): Promise<{ totalPrices: TotalPrices; newSchedules: Schedule[] }> => {
  if (ticketCount.length === 0) {
    throw new Error("Ups! Debes seleccionar tickets para continuar");
  }

  if (
    !["Active", "Private"].includes(event.info.status) &&
    deviceType != "presencial"
  ) {
    throw new Error(
      "Ups! El evento no está disponible, refrezca y inténtalo de nuevo"
    );
  }

  const totalPrices: TotalPrices = {
    total: 0,
    serviceFee: 0,
    totalWithServiceFee: 0,
    schedules: [],
    lessAvailableTickets: false,
    serviceFeeHidden: event.finance.serviceFeeHidden,
  };

  const processedTickets = ticketCount.map((ticket) =>
    processTicket(ticket, event, totalPrices, userEmail, deviceType)
  );
  const newSchedules = processedTickets.map(({ newSchedule }) => newSchedule);
  totalPrices.schedules = processedTickets
    .map(({ ticketSchedule }) => ticketSchedule)
    .filter((schedule): schedule is TicketSchedule => schedule !== null);
  totalPrices.lessAvailableTickets = processedTickets.some(
    ({ lessAvailableTickets }) => lessAvailableTickets
  );

  // Fill in schedules from event that are not in ticketCount
  event.schedule.forEach((schedule) => {
    if (
      !newSchedules.some((newSchedule) => newSchedule.name === schedule.name)
    ) {
      newSchedules.push(schedule);
    }
  });

  if (totalPrices.schedules.length === 0) {
    throw new Error(
      "Ups! No quedan la entradas que cotizaste, refrezca y inténtalo de nuevo"
    );
  }

  return { totalPrices, newSchedules };
};

export const calculateTotalFunction = async (
  db: admin.firestore.Firestore,
  data: Data,
  user: UserRecord
) => {
  const {
    ticketCount,
    eventId,
    concurrentDate,
    date,
    expirationDate,
    hour,
    isEventActivated,
    metadata,
    deviceType,
  } = data;
  const eventRef = db.collection("events").doc(eventId);

  try {
    const { totalPrices, eventData } = await runTransactionWithRetries(
      db,
      async (transaction) => {
        const eventDoc = await transaction.get(eventRef);

        const eventData = eventDoc.data() as Event;

        if (!eventData) throw new Error("Event not found");

        const { totalPrices, newSchedules } = await calculateTotalHandler(
          eventData,
          ticketCount,
          user.email ?? "",
          deviceType
        );

        await transaction.update(eventRef, {
          schedule: newSchedules,
          stats: calculateStats(newSchedules, eventData),
          //updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { totalPrices, eventData };
      }
    );

    const order = await createOrder(
      db,
      eventData,
      eventId,
      user,
      concurrentDate,
      totalPrices,
      date,
      hour,
      deviceType,
      expirationDate,
      isEventActivated,
      metadata
    );

    return {
      totalPrices,
      orderId: order.orderId,
      floidPaymentUrl: order.floidPaymentUrl,
      error: { message: "", success: true },
    };
  } catch (error) {
    functions.logger.error("Error in calculateTotalFunction:", error);
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        success: false,
      },
    };
  }
};

export const calculateTotal = (
  db: admin.firestore.Firestore,
  auth: admin.auth.Auth
) => {
  const { isDev } = getCurrentEnv();

  return functions.https.onCall(
    {
      region: "southamerica-east1",
      timeoutSeconds: 540,
      minInstances: isDev ? 0 : 1,
      maxInstances: 100,
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      if (!request.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "You must be authenticated"
        );
      }

      const email = request.auth.token.email;
      if (!email) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "User must have an email address"
        );
      }

      try {
        const userRecord = await auth.getUserByEmail(email);
        return calculateTotalFunction(db, data, userRecord);
      } catch (error) {
        console.error("Error fetching user:", error);
        throw new functions.https.HttpsError(
          "internal",
          "3. Ups! No quedan la entradas que cotizaste, refrezca y inténtalo de nuevo."
        );
      }
    }
  );
};
