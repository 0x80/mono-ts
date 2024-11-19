import type admin from "firebase-admin";
import type { Order, OrderItem } from "../../orders/interfaces";
import { sendNotificationToUsers } from "../tickets/utils";
import type { ResellOrderWithId } from "./interfaces";

export const deleteQrInfos = async (
  db: admin.firestore.Firestore,
  resellOrders: ResellOrderWithId[]
) => {
  const ordersTickets: { [key: string]: string[] } = {};

  // Populate ordersTickets map
  resellOrders.forEach((resellOrder) => {
    if (resellOrder.orderId) {
      if (!ordersTickets[resellOrder.orderId]) {
        ordersTickets[resellOrder.orderId] = [];
      }
      ordersTickets[resellOrder.orderId]?.push(resellOrder.ticketId);
    }
  });

  // Fetch order documents
  const docs = [];
  for (const orderId in ordersTickets) {
    const order = db.collection("orders").doc(orderId);
    docs.push(order.get());
  }

  // Resolve all promises to get order documents
  const orders = await Promise.all(docs);
  const batch = db.batch();

  const updatedOrders: {
    [key: string]: {
      ticketId: string;
      name: string;
      url: string;
    }[];
  } = {};

  // Process each order document
  orders.forEach((orderDoc) => {
    const order = orderDoc.data() as Order;
    const orderId = orderDoc.id;

    if (order.qrInfos) {
      const newQrInfos: {
        ticketId: string;
        name: string;
        url: string;
      }[] = [];

      order.qrInfos.forEach((qrInfo) => {
        if (!ordersTickets[orderId]?.includes(qrInfo.ticketId)) {
          newQrInfos.push(qrInfo);
        }
      });

      batch.update(orderDoc.ref, { qrInfos: newQrInfos });
      updatedOrders[orderId] = newQrInfos;
    }
  });

  // Commit batch updates
  await batch.commit();
  return updatedOrders;
};

export const getResellOrders = async (
  db: admin.firestore.Firestore,
  order: Order
) => {
  const docs = [];
  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i] as OrderItem;
    if (item.resellingCount > 0) {
      console.log(item.resellingCount);
      const resellOrders = db
        .collection("events")
        .doc(order.eventId)
        .collection("resellOrders")
        .where("status", "==", "Pending")
        .where("newTicketRef", "==", item.name)
        .orderBy("createdAt", "asc")
        .limit(item.resellingCount);

      docs.push(resellOrders.get());
    }
  }
  const resellOrders = await Promise.all(docs);
  const resellOrdersArray: ResellOrderWithId[] = [];
  resellOrders.forEach((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      resellOrdersArray.push({
        id: doc.id,
        ...doc.data(),
      } as ResellOrderWithId);
    });
  });
  return { resellOrdersArray, resellOrders };
};

export const approveResellOrders = async (
  db: admin.firestore.Firestore,
  order: Order
): Promise<{
  resellDeltaEarnings: number;
  resellEarnings: number;
}> => {
  const { resellOrdersArray, resellOrders } = await getResellOrders(db, order);
  const batch = db.batch();
  const sendNotificationsPromises: Promise<void>[] = [];
  // eliminar de qr infos
  await deleteQrInfos(db, resellOrdersArray);

  let resellDeltaEarnings = 0;
  let resellEarnings = 0;

  resellOrders.forEach((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { status: "Approved", orderPriority: 2 });
      const ticketRef = db
        .collection("events")
        .doc(order.eventId)
        .collection("tickets")
        .doc(doc.data().ticketId);
      sendNotificationsPromises.push(
        sendNotificationToUsers(
          db,
          doc.data()?.userId,
          doc.data()?.eventName,
          "Tu entrada ha sido revendida, recibirás el dinero dentro de 72 horas",
          "Tickets",
          {}
        )
      );
      resellDeltaEarnings += doc.data().deltaEarning;
      resellEarnings += doc.data().earning;
      batch.update(ticketRef, { status: "Reselled" });
    });
  });
  await Promise.all(sendNotificationsPromises);
  await batch.commit();
  return { resellDeltaEarnings, resellEarnings };
};
