import type admin from "firebase-admin";
import type { Order } from "./interfaces";
import { createTicketsHandler } from "../events/tickets/create";
import { approveOrder } from "./approve";
import { deleteTask } from "../utils/createTask";
import * as functions from "firebase-functions";

export const orderApproveHandler = async (
  db: admin.firestore.Firestore,
  orderData: Order,
  transaction: admin.firestore.Transaction,
  orderRef: admin.firestore.DocumentReference<
    admin.firestore.DocumentData,
    admin.firestore.DocumentData
  >,
  channel: string,
  channelId: string,
  metadata: { [key: string]: { [key: string]: string } } | undefined
) => {
  try {
    const tickets = await createTicketsHandler(
      db,
      orderData,
      channel,
      metadata
    );
    try {
      await approveOrder(
        transaction,
        orderRef,
        channel,
        channelId,
        tickets,
        orderData,
        metadata
      );
    } catch (e) {
      await deleteTask(orderData.taskId ?? "");
      functions.logger.error("Error-Approve");
      functions.logger.error(e);
      await transaction.update(orderRef, {
        status: "Rejected",
        statusMessage: "Error-Approve",
        channel: channel,
        channelId: channelId,
      });
    }
  } catch (e) {
    await deleteTask(orderData.taskId ?? "");
    functions.logger.error("Error-Tickets");
    functions.logger.error(e);
    await transaction.update(orderRef, {
      status: "Rejected",
      statusMessage: "Error-Tickets",
      channel: channel,
      channelId: channelId,
    });
  }
};
