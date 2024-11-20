import * as admin from "firebase-admin";
import type { Resell } from "@repo/types";
import type { ResellOrder } from "./interfaces";

type Data = {
  userId: string;
  eventId: string;
  ticketId: string;
  bankName: string;
  bankAccountType: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankAccountDni: string;
  bankAccountEmail: string;
  userName: string;
  userEmail: string;
  eventImageUrl: string;
};

export const calculateResellReturn = (
  eventResell: Resell,
  ticketPrice: number
): {
  earning: number;
  total: number;
} => {
  let price = ticketPrice * (eventResell.resellReturn ?? 0.8);
  if (eventResell.resellMax) {
    price = Math.min(price, eventResell.resellMax);
  }
  return {
    earning: ticketPrice - price,
    total: price,
  };
};

export const createResellOrderObject = (
  data: Data,
  ticketPrice: number,
  ticketName: string,
  newTicketRef: { name: string; price: number },
  eventName: string,
  orderId: string,
  eventResell: Resell
): ResellOrder => {
  const { earning, total } = calculateResellReturn(eventResell, ticketPrice);
  return {
    ticketName: ticketName,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    eventId: data.eventId,
    ticketId: data.ticketId,
    eventName: eventName,
    status: "Pending",
    newTicketRef: newTicketRef.name,
    earning: earning,
    deltaEarning: newTicketRef.price - ticketPrice,
    total: total,
    bankName: data.bankName,
    bankAccountType: data.bankAccountType,
    bankAccountNumber: data.bankAccountNumber,
    bankAccountName: data.bankAccountName,
    bankAccountDni: data.bankAccountDni,
    bankAccountEmail: data.bankAccountEmail,
    eventImageUrl: data.eventImageUrl,
    orderPriority: 0,
    orderId: orderId ?? "",
  };
};

export const createResellOrder = async (
  db: admin.firestore.Firestore,
  data: Data,
  ticketPrice: number,
  ticketName: string,
  newTicketRef: { name: string; price: number },
  eventName: string,
  eventResell: Resell,
  userId: string,
  orderId: string
) => {
  await db
    .collection("users")
    .doc(userId)
    .update({
      bank: {
        bankName: data.bankName,
        bankAccountType: data.bankAccountType,
        bankAccountNumber: data.bankAccountNumber,
        bankAccountName: data.bankAccountName,
        bankAccountDni: data.bankAccountDni,
        bankAccountEmail: data.bankAccountEmail,
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  const resellOrder = createResellOrderObject(
    data,
    ticketPrice,
    ticketName,
    newTicketRef,
    eventName,
    orderId,
    eventResell
  );
  return db
    .collection("events")
    .doc(data.eventId)
    .collection("resellOrders")
    .add({
      ...resellOrder,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
};

export const cancelResellOrder = async (
  db: admin.firestore.Firestore,
  eventId: string,
  ticketId: string
) => {
  const resellOrder = await db
    .collection("events")
    .doc(eventId)
    .collection("resellOrders")
    .where("ticketId", "==", ticketId)
    .get();

  if (!resellOrder.empty && resellOrder.docs.length > 0) {
    return db
      .collection("events")
      .doc(eventId)
      .collection("resellOrders")
      .doc(resellOrder.docs[0]?.id ?? "")
      .delete();
  } else {
    throw new Error("Resell order not found");
  }
};
