import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";

type Data = {
  eventImageUrl: string;
  eventId: string;
  subject: string;
  message: string;
};

type SendEventMessage = HttpsCallable<Data, void>;

export const sendEventMessage: SendEventMessage = httpsCallable(
  functions,
  "sendEventMessage"
);
