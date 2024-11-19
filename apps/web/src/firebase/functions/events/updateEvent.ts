import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";
import type { EventForm } from "@/firebase/interfaces/events";

type Data = {
  eventData: EventForm;
  eventId: string;
};

type UpdateEventFunction = HttpsCallable<Data, void>;

export const updateEventFunction: UpdateEventFunction = httpsCallable(
  functions,
  "updateEvent"
);
