import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";

type Data = {
  status: string;
  eventId: string;
};

type SetEventStatusFunction = HttpsCallable<Data, void>;

export const setEventStatusFunction: SetEventStatusFunction = httpsCallable(
  functions,
  "setEventStatus"
);
