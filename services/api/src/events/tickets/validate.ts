import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { formatDate } from "../../utils/formatDate";
import { runTransactionWithRetries } from "../../utils/transactions";
import { getCurrentEnv } from "../../utils/getCurrentEnv";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  qrHash: string;
  eventRefId: string;
  validatedAt: string;
};

const validateTicketData = async (
  transaction: admin.firestore.Transaction,
  eventRef: admin.firestore.DocumentReference,
  ticketRef: admin.firestore.DocumentReference,
  validatedAt: string,
  ctx: functions.https.CallableRequest<Data>,
  userId?: string
) => {
  const eventDoc = await transaction.get(eventRef);
  const eventData = eventDoc.data();
  if (!eventData) {
    return { success: false, message: "Ticket inválido" };
  }
  if (!eventData.operations.validators.includes(ctx.auth?.uid)) {
    return {
      success: false,
      message: "No estas autorizado a validar este ticket",
    };
  }
  const ticketDoc = await transaction.get(ticketRef);
  const ticketData = ticketDoc.data();
  if (!ticketData) {
    return { success: false, message: "Ticket inválido" };
  }

  if (userId && ticketData.userId !== userId) {
    return { success: false, message: "Ticket inválido" };
  }

  if (ticketData.status == "Validated") {
    return {
      success: false,
      message: `El ticket fue validado el ${formatDate(ticketData.validatedAt.toDate())}`,
    };
  }
  if (ticketData.status != "Active") {
    return { success: false, message: "Ticket inválido" };
  }

  await transaction.update(ticketRef, {
    status: "Validated",
    validatedAt: admin.firestore.Timestamp.fromDate(new Date(validatedAt)),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await transaction.update(eventRef, {
    stats: {
      ...eventData.stats,
      ticketValidated: (eventData.stats.ticketValidated ?? 0) + 1,
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: ticketData.name };
};

export const validateTicket = (db: admin.firestore.Firestore) => {
  const { isDev } = getCurrentEnv();
  return functions.https.onCall(
    { region: "southamerica-east1", minInstances: isDev ? 0 : 2 },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { qrHash, eventRefId, validatedAt } = data;

      try {
        const url = new URL(qrHash);
        const run = url.searchParams.get("RUN") ?? "";
        if (run == "") {
          throw new Error("No es RUN");
        }

        const eventRef = db.collection("events").doc(eventRefId);
        let tickets = await eventRef
          .collection("tickets")
          .where(
            "metadata.dni",
            "==",
            run.trim().replace(".", "").replace("-", "").toLowerCase()
          )
          .get();

        if (tickets.empty) {
          tickets = await eventRef
            .collection("tickets")
            .where(
              "userDni",
              "==",
              run.trim().replace(".", "").replace("-", "").toLowerCase()
            )
            .get();
          if (tickets.empty) {
            return {
              success: false,
              message: "No existe un ticket asociado a este rut",
            };
          }
        }
        const ticketsRef = tickets.docs.filter(
          (doc) => doc.data().status == "Active"
        );

        if (ticketsRef.length === 0) {
          return {
            success: false,
            message: "El ticket fue validado",
          };
        }

        const ticketRef = ticketsRef[0]?.ref;

        if (!ticketRef) {
          return {
            success: false,
            message: "No se pudo encontrar el ticket activo",
          };
        }

        return runTransactionWithRetries(db, (transaction) =>
          validateTicketData(
            transaction,
            eventRef,
            ticketRef,
            validatedAt,
            request
          )
        );
      } catch {
        const qrHashSplitted = qrHash.split(",");

        if (qrHashSplitted.length !== 3) {
          return { success: false, message: "Ticket inválido" };
        }

        const eventId = qrHashSplitted[0];
        const ticketId = qrHashSplitted[1];
        const userId = qrHashSplitted[2];

        if (eventId !== eventRefId) {
          return {
            success: false,
            message: "Ticket inválido para este evento",
          };
        }

        const eventRef = db.collection("events").doc(eventId);
        if (!ticketId) {
          return { success: false, message: "Ticket ID is undefined" };
        }
        const ticketRef = eventRef.collection("tickets").doc(ticketId);

        return runTransactionWithRetries(db, (transaction) =>
          validateTicketData(
            transaction,
            eventRef,
            ticketRef,
            validatedAt,
            request,
            userId
          )
        );
      }
    }
  );
};
