import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { uploadImageToStorageResize } from "../storage/uploadImage";
import type { Event, EventForm, Info, Resell } from "@repo/types";
import type { CallableRequest } from "firebase-functions/https";
// import { createNeoEvent } from "..";

const getEventSchedule = (schedule: EventForm["schedule"]) =>
  schedule
    .map((item) => ({
      ...item,
      price: Number(item.price),
      ticketTotal: Number(item.ticketTotal),
      maxTicketPerBuy: Number(item.maxTicketPerBuy),
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
    }))
    .sort((a, b) => a.price - b.price);

const getEventStats = (schedule: EventForm["schedule"]) => ({
  serviceFeeSelled: 0,
  ticketValidated: 0,
  totalSelled: 0,
  totalWithServiceFeeSelled: 0,
  ticketCount: 0,
  ticketTotal: schedule
    ? schedule.reduce((acc, item) => acc + Number(item.ticketTotal), 0)
    : 0,
  resellingTickets: 0,
  ticketResellCount: 0,
  totalReselled: 0,
  totalReselledFee: 0,
  ticketReselledCount: 0,
  ticketSelledCount: 0,
  resellDeltaEarnings: 0,
});

export const getEventData = (data: EventForm, imageUrl: string): Event => {
  const {
    info,
    finance,
    location,
    producer,
    schedule,
    weekSchedule,
    resell,
    operations,
  } = data;

  const eventInfo = {
    description: info.description,
    end: admin.firestore.Timestamp.fromDate(new Date(info.end)),
    image: imageUrl,
    name: info.name,
    start: admin.firestore.Timestamp.fromDate(new Date(info.start)),
    status: "Draft",
    type: "eventWithEnd",
    tags: info.tags,
    activationDate: Number(info.activationDate),
    isConcurrent: info.isConcurrent,
    isExternal: info.isExternal,
    externalUrl: info.externalUrl,
    activityType: info.activityType,
    spotifyUrl: info.spotifyUrl ?? "",
  } as Info;

  const eventBase = {
    info: eventInfo,
    finance: {
      serviceFee: Number(finance.serviceFee),
      serviceFeeType: finance.serviceFeeType,
      serviceFeeHidden: finance.serviceFeeHidden,
    },
    location: {
      address: location.address,
      name: location.name,
      lat: Number(location.lat),
      lng: Number(location.lng),
    },
    producer,
    stats: getEventStats(schedule),
    operations: {
      validators: [],
      validatorsData: [],
      ...operations,
    },
    schedule: getEventSchedule(schedule),
    resell: {
      resellFee: Number(resell.resellFee),
      hasResell: resell.hasResell,
      resellHighestPrice: resell.resellHighestPrice,
      resellQueueNumber: Number(resell.resellQueueNumber),
    } as Resell,
  };

  return info.isConcurrent && weekSchedule
    ? { ...eventBase, weekSchedule }
    : eventBase;
};

export const createEvent = (
  db: admin.firestore.Firestore,
  storage: admin.storage.Storage
) => {
  return functions.https.onCall(
    { region: "southamerica-east1" },
    async (request: CallableRequest<EventForm>) => {
      const { data } = request;
      functions.logger.info("Creating an event", data.info);

      try {
        functions.logger.info("Uploading image");
        const newRef = db.collection("events").doc();
        const imageUrl = await uploadImageToStorageResize({
          storage,
          fileName: `events/${newRef.id}/${data.info.name}.jpg`,
          fileData: data.info.image,
        });
        functions.logger.info("Image uploaded");

        const newData = getEventData(data, imageUrl);

        const neoId = "";
        // try {
        //   neoId = await createNeoEvent(
        //     newRef.id,
        //     newData.info.name,
        //     newData.info.tags,
        //     newData.location.name,
        //     newData.info.status
        //   );
        // } catch (error) {
        //   functions.logger.warn(error);
        // }
        await db
          .collection("events")
          .doc(newRef.id)
          .set({
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            neoId,
            ...newData,
          });

        return { success: true, message: "Event created successfully" };
      } catch (error) {
        functions.logger.warn(error);
        return { success: false, message: error };
      }
    }
  );
};
