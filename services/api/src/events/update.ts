import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { uploadImageToStorageResize } from "../storage/uploadImage";
import type { EventForm, Event } from "@repo/types";
import { uuid } from "uuidv4";
import type { CallableRequest } from "firebase-functions/https";
type Data = {
  eventData: EventForm;
  eventId: string;
};
export const updateEvent = (
  db: admin.firestore.Firestore,
  storage: admin.storage.Storage
) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { eventData, eventId } = data;
      const { info } = eventData;

      try {
        functions.logger.info("Uploading image");
        const imageUrl = await uploadImageToStorageResize({
          storage: storage,
          fileName: `events/${eventId}/${info.name}-${uuid()}.jpg`,
          fileData: info.image,
          oldImageUrl: info.image,
        });

        const oldEvent = (
          await db.collection("events").doc(eventId).get()
        ).data() as Event;
        await db
          .collection("events")
          .doc(data.eventId)
          .update({
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            info: {
              ...oldEvent.info,
              description: info.description,
              end: admin.firestore.Timestamp.fromDate(new Date(info.end)),
              image: imageUrl,
              name: info.name,
              start: admin.firestore.Timestamp.fromDate(new Date(info.start)),
              tags: info.tags,
              activationDate: Number(info.activationDate),
              isConcurrent: info.isConcurrent,
              isExternal: info.isExternal,
              externalUrl: info.externalUrl,
              activityType: info.activityType,
              spotifyUrl: info.spotifyUrl ?? "",
            },
            finance: {
              serviceFee: Number(eventData.finance.serviceFee),
              serviceFeeType: eventData.finance.serviceFeeType,
              serviceFeeHidden: eventData.finance.serviceFeeHidden,
            },
            resell: {
              resellFee: Number(eventData.resell.resellFee),
              hasResell: eventData.resell.hasResell,
              resellHighestPrice: eventData.resell.resellHighestPrice,
              resellQueueNumber: Number(eventData.resell.resellQueueNumber),
            },
            location: {
              address: eventData.location.address,
              name: eventData.location.name,
              lat: Number(eventData.location.lat),
              lng: Number(eventData.location.lng),
            },
            producer: eventData.producer,
            schedule: eventData.schedule.map((item, index) => {
              const oldItem = oldEvent.schedule[index] ?? {
                ticketCount: 0,
                ticketResellCount: 0,
                name: "",
                price: 0,
                serviceFeeSelled: 0,
                totalSelled: 0,
                totalWithServiceFeeSelled: 0,
                ticketTotal: 0,
                maxTicketPerBuy: 0,
                resellingTickets: 0,
                totalReselled: 0,
                totalReselledFee: 0,
                ticketReselledCount: 0,
                ticketSelledCount: 0,
                type: "normal",
                description: "",
              };
              return {
                ...oldItem,
                name: item.name,
                price: Number(item.price),
                ticketTotal: Number(item.ticketTotal),
                maxTicketPerBuy: Number(item.maxTicketPerBuy),
                type: item.type,
                description: item.description,
              };
            }),
            stats: {
              ...oldEvent.stats,
              ticketTotal: eventData.schedule
                ? eventData.schedule.reduce(
                    (acc, item) => acc + Number(item.ticketTotal),
                    0
                  )
                : 0,
            },
            weekSchedule: eventData.weekSchedule,
            operations: {
              ...oldEvent.operations,
              requiredMetadata: eventData.operations.requiredMetadata,
              hasNonUserSell: eventData.operations.hasNonUserSell,
            },
          });

        return {
          success: true,
          message: "Event updated successfully",
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
