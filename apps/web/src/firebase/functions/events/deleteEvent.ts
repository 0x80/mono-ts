import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";

type Data = {
  eventId: string;
};

type DeleteEventFunction = HttpsCallable<Data, void>;

export const deleteEventFunction: DeleteEventFunction = httpsCallable(
  functions,
  "deleteEvent"
);
