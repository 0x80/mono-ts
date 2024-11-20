import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { Event } from "@repo/types";

export const resetEvents = (db: admin.firestore.Firestore) => {
  return functions.https.onCall({ region: "southamerica-east1" }, async () => {
    const eventRef = await db.collection("events").get();
    const updates = [];
    for (const doc of eventRef.docs) {
      const event = doc.data() as Event;
      const newSchedules = event.schedule.map((item) => {
        return {
          ...item,
          serviceFeeSelled: 0,
          totalSelled: 0,
          totalWithServiceFeeSelled: 0,
          ticketCount: 0,
          resellingTickets: 0,
          totalReselled: 0,
          totalReselledFee: 0,
          ticketReselledCount: 0,
          ticketSelledCount: 0,
          ticketResellCount: 0,
        };
      });
      updates.push(
        db
          .collection("events")
          .doc(doc.id)
          .update({
            resell: {
              hasResell: true,
              resellHighestPrice: false,
              resellFee: 0.5,
              resellQueueNumber: 0,
            },
            schedule: newSchedules,
            stats: {
              serviceFeeSelled: 0,
              ticketValidated: 0,
              totalSelled: 0,
              totalWithServiceFeeSelled: 0,
              ticketCount: 0,
              ticketTotal: event.schedule.reduce(
                (acc, item) => acc + Number(item.ticketTotal),
                0
              ),
              resellingTickets: 0,
              totalReselled: 0,
              totalReselledFee: 0,
              ticketReselledCount: 0,
              ticketSelledCount: 0,
              ticketResellCount: 0,
            },
          })
      );
      const tickets = await db
        .collection("events")
        .doc(doc.id)
        .collection("tickets")
        .get();
      for (const ticket of tickets.docs) {
        await db
          .collection("events")
          .doc(doc.id)
          .collection("tickets")
          .doc(ticket.id)
          .delete();
      }
    }
    await Promise.all(updates);
  });
};
