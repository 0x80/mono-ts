import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "../..";

export type GenerateTicketsFromCSVFunctionInput = {
  eventId: string;
  userMails: string[];
  metadata: { [key: string]: string };
};

type GenerateTicketsFromCSVFunction = HttpsCallable<
  GenerateTicketsFromCSVFunctionInput,
  string
>;

export const generateTicketsFromCSVFunction: GenerateTicketsFromCSVFunction =
  httpsCallable(functions, "generateTicketsFromCSV");
