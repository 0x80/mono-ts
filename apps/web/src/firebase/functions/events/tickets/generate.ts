import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "../..";

export type GenerateTicketFunctionInput = {
  eventId: string;
  userMail: string;
  metadata: { [key: string]: string };
};

type GenerateTicketFunction = HttpsCallable<
  GenerateTicketFunctionInput,
  string
>;

export const generateTicketFunction: GenerateTicketFunction = httpsCallable(
  functions,
  "generateTicketFunction"
);
