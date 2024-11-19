import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";

type Data = {
  eventId: string;
};

type DuplicateEventFunction = HttpsCallable<Data, void>;

export const duplicateEventFunction: DuplicateEventFunction = httpsCallable(
  functions,
  "duplicateEvent"
);
