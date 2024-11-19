import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import { OrderStatus, type Order } from "./interfaces";
import { createTicketsHandler } from "../events/tickets/create";
import { approveOrder } from "./approve";
import { deleteTask } from "../utils/createTask";
import { expireOrderHandler } from "./expireOrder";
import { runTransactionWithRetries } from "../utils/transactions";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  orderId: string;
};

export const rejectOrder = async (
  db: admin.firestore.Firestore,
  transaction: FirebaseFirestore.Transaction,
  orderRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  orderData: Order,
  channel: string
) => {
  await deleteTask(orderData.taskId ?? "");
  await expireOrderHandler(
    db,
    transaction,
    orderRef,
    orderData,
    OrderStatus.Rejected,
    channel
  );
  return;
};

export const approveFreeOrderFunction = (
  db: admin.firestore.Firestore,
  orderId: string,
  channel: string
) => {
  try {
    const orderRef = db.collection("orders").doc(orderId);

    return runTransactionWithRetries(db, async (transaction) => {
      const orderData = (await transaction.get(orderRef)).data() as Order;
      if (orderData.status != "Pending") {
        return "Order is not pending";
      }
      if (orderData.totalWithServiceFeeSelled !== 0 && channel === "free") {
        return "Order is not free";
      } else {
        try {
          const tickets = await createTicketsHandler(
            db,
            orderData,
            channel,
            orderData.metadata
          );
          await approveOrder(
            transaction,
            orderRef,
            channel,
            "-",
            tickets,
            orderData
          );
          return "Ticket creado con exito";
        } catch {
          await rejectOrder(db, transaction, orderRef, orderData, "free");
          return "Hubo un error con la compra";
        }
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      // Standard JavaScript error handling
      functions.logger.warn(error);
      return error.message;
    } else {
      // If the error doesn't match the Error type, handle it generically
      return "An unknown error occurred.";
    }
  }
};

export const approveFreeOrder = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      await approveFreeOrderFunction(db, data.orderId, "free");
    }
  );
};
