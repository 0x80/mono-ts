import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";
import type { EventForm } from "@/firebase/interfaces/events";

type CreateEventFunction = HttpsCallable<EventForm, void>;

export const createEventFunction: CreateEventFunction = httpsCallable(
  functions,
  "createEvent"
);
