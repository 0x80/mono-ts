import * as functions from "firebase-functions";
import { createTask, deleteTask } from "../utils/createTask";
import type { Event, Info, EventWithId } from "./interfaces";
import { getCurrentEnv } from "../utils/getCurrentEnv";
import * as admin from "firebase-admin";
// import { updateNeoEvent } from "..";

const addPendingReviews = async (
  db: admin.firestore.Firestore,
  eventId: string,
  eventData: Event
) => {
  const tickets = await db
    .collection("events")
    .doc(eventId)
    .collection("tickets")
    .where("status", "==", "Validated")
    .get();

  const users = new Set<string>();
  tickets.forEach((ticket) => {
    users.add(ticket.data().userId);
  });

  let currentBatch = db.batch();
  let currentBatchSize = 0;
  const batches = [currentBatch];

  // Add each doc's deletion to the batch
  users.forEach((user) => {
    // When batch is too large, start a new one
    if (++currentBatchSize >= 500) {
      currentBatch = db.batch();
      batches.push(currentBatch);
      currentBatchSize = 1;
    }
    // Add operation to batch
    currentBatch.update(db.collection("users").doc(user), {
      pendingReviews: admin.firestore.FieldValue.arrayUnion({
        eventId: eventId,
        eventName: eventData.info.name,
        producerId: eventData.producer.id,
        eventImage: eventData.info.image,
      }),
    });
  });

  // Commit the changes
  await Promise.all(batches.map((batch) => batch.commit()));
};

const updateEventReview = async (
  db: admin.firestore.Firestore,
  eventData: Event,
  eventId: string
) => {
  const producer = await db
    .collection("users")
    .doc(eventData.producer.id)
    .get();
  await db
    .collection("events")
    .doc(eventId)
    .update({
      producer: {
        ...eventData.producer,
        ratings: producer.data()?.ratings,
      },
    });
};

const deleteEventTasks = async (event: EventWithId) => {
  if (event.tasks?.activateTicketsId) {
    await deleteTask(event.tasks.activateTicketsId);
  }
  if (event.tasks?.expireTaskId) {
    await deleteTask(event.tasks.expireTaskId);
  }
};

export const onUpdateEvent = async (
  db: admin.firestore.Firestore,
  oldEventData: EventWithId,
  newEventData: EventWithId
) => {
  try {
    if (
      ["Active", "External", "Visible"].includes(newEventData.info.status) &&
      ["Draft", "InReview", "Visible"].includes(oldEventData.info.status) &&
      newEventData.info.status != oldEventData.info.status
    ) {
      try {
        await deleteEventTasks(newEventData);
        const { projectId } = getCurrentEnv();
        const info = newEventData.info as Info;
        let activateTaskId = "";
        const expireTaskId = await createTask(
          `https://southamerica-east1-${projectId}.cloudfunctions.net/expireEvent`,
          {
            eventId: newEventData.id,
            info: {
              ...info,
              start: newEventData.info.start
                ? newEventData.info.start.toDate().getTime() / 1000
                : 0,
              end: newEventData.info.end
                ? newEventData.info.end.toDate().getTime() / 1000
                : 0,
            },
          },
          newEventData.info.end
            ? newEventData.info.end.toDate().getTime() / 1000
            : 0,
          "eventsExpireQueue"
        );
        if (info.activationDate != 0) {
          const eventActivationDate = info.start?.toDate() ?? new Date();
          eventActivationDate.setMinutes(
            eventActivationDate.getMinutes() - (info.activationDate ?? 0) * 60
          );
          activateTaskId =
            (await createTask(
              `https://southamerica-east1-${projectId}.cloudfunctions.net/activateTickets`,
              {
                eventId: newEventData.id,
              },
              eventActivationDate.getTime() / 1000,
              "ticketsActivate"
            )) ?? "";
        }
        await db
          .collection("events")
          .doc(newEventData.id)
          .update({
            tasks: {
              expireTaskId: expireTaskId,
              activateTaskId: activateTaskId,
            },
          });
        // meter task de actilet tickets, si es concurrente verlo despues pero seria una sub collection donde cada id sea date_hora, y ahi meter los tickets
      } catch (error) {
        if (error instanceof Error) {
          throw new functions.https.HttpsError("internal", error.message);
        } else {
          throw new functions.https.HttpsError(
            "internal",
            "An unknown error occurred"
          );
        }
      }
    } else if (
      newEventData.info.status == "Expired" &&
      oldEventData.info.status == "Active"
    ) {
      await addPendingReviews(db, newEventData.id, newEventData as Event);
    }
    if (newEventData.info.status != oldEventData.info.status) {
      if (["Expired", "Active", "Visible"].includes(newEventData.info.status)) {
        await updateEventReview(db, newEventData as Event, newEventData.id);
      }
    }

    if (
      newEventData.info.status != oldEventData.info.status ||
      newEventData.info.tags != oldEventData.info.tags ||
      newEventData.info.name != oldEventData.info.name ||
      newEventData.location.name != newEventData.location.name
    ) {
      // await updateNeoEvent(
      //   newEventData.id,
      //   newEventData.info.name,
      //   newEventData.info.tags,
      //   newEventData.location.name,
      //   newEventData.info.status
      // );
    }
  } catch (error) {
    console.error(error);
  }
};
