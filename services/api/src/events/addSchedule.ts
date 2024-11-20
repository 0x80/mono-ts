import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { Schedule, ScheduleForm, Event } from "@repo/types";
import type { CallableRequest } from "firebase-functions/https";

export const addSchedule = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (
      request: CallableRequest<{ eventId: string; scheduleForm: ScheduleForm }>
    ) => {
      const { data } = request;
      const { eventId, scheduleForm } = data;
      const eventRef = db.collection("events").doc(eventId);
      await db.runTransaction(async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        const eventData = eventDoc.data() as Event;
        const newSchedule = {
          ...data.scheduleForm,
          price: Number(scheduleForm.price),
          ticketTotal: Number(scheduleForm.ticketTotal),
          maxTicketPerBuy: Number(scheduleForm.maxTicketPerBuy),
          serviceFeeSelled: 0,
          totalSelled: 0,
          ticketCount: 0,
          totalWithServiceFeeSelled: 0,
          resellingTickets: 0,
          totalReselled: 0,
          totalReselledFee: 0,
          ticketReselledCount: 0,
          ticketResellCount: 0,
          ticketSelledCount: 0,
          visible: false,
        } as Schedule;

        const newSchedules = [...(eventData.schedule ?? []), newSchedule].sort(
          (a, b) => a.price - b.price
        );
        await transaction.update(eventRef, {
          schedule: newSchedules,
          stats: {
            ...eventData.stats,
            ticketTotal: newSchedules.reduce(
              (acc, item) => acc + Number(item.ticketTotal),
              0
            ),
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
    }
  );
};
