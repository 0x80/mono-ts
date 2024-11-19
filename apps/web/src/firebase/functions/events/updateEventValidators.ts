import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";
import type { Operations } from "@/firebase/interfaces/events";

type Data = {
  operations: Operations;
  eventId: string;
  isAdd?: boolean;
  newEmail?: string;
};

type updateEventValidatorsFunction = HttpsCallable<Data, void>;

export const updateEventValidatorsFunction: updateEventValidatorsFunction =
  httpsCallable(functions, "updateEventValidators");
