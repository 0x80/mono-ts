import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { Event, Schedule } from "@repo/types";
import type { CallableRequest } from "firebase-functions/https";

type EditScheduleData = {
  name: string;
  description: string;
  type: string;
  ticketTotal: number;
  visible: boolean;
  eventId: string;
  action: "edit" | "deplete";
};

const updateSchedule = (schedule: Schedule, data: EditScheduleData) => {
  if (schedule.name !== data.name) return schedule;

  if (data.action === "edit") {
    return {
      ...schedule,
      description: data.description,
      type: data.type,
      ticketTotal: Math.max(data.ticketTotal, schedule.ticketCount),
      visible: data.visible,
    };
  } else if (data.action === "deplete") {
    return {
      ...schedule,
      ticketTotal: Math.max(schedule.ticketSelledCount, schedule.ticketCount),
    };
  }

  return schedule;
};

const updateEventStats = (newSchedule: Schedule[]) => {
  return newSchedule.reduce((acc, schedule) => acc + schedule.ticketTotal, 0);
};

export const editScheduleFunction = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<EditScheduleData>) => {
      const { data } = request;
      const { eventId } = data;
      const eventRef = db.collection("events").doc(eventId);

      try {
        await db.runTransaction(async (transaction) => {
          const eventDoc = await transaction.get(eventRef);
          const eventData = eventDoc.data() as Event;

          const newSchedule = eventData.schedule.map((schedule) =>
            updateSchedule(schedule, data)
          );

          await transaction.update(eventRef, {
            schedule: newSchedule,
            stats: {
              ...eventData.stats,
              ticketTotal: updateEventStats(newSchedule),
            },
          });
        });

        return {
          success: true,
          message: "Schedule updated successfully",
        };
      } catch (error) {
        if (error instanceof Error) {
          // Standard JavaScript error handling
          functions.logger.warn(error);
          return { success: false, message: error.message };
        } else {
          // If the error doesn't match the Error type, handle it generically
          functions.logger.warn("An unknown error occurred", error);
          return { success: false, message: "An unknown error occurred." };
        }
      }
    }
  );
};
