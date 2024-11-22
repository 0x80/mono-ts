import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "../..";

export type ValidateTicketFunctionInput = {
  qrHash: string;
  eventRefId: string;
  validatedAt: string;
};

type ValidateTicketFunction = HttpsCallable<
  ValidateTicketFunctionInput,
  {
    success: boolean;
    message: string;
  }
>;

export const validateTicketFunction: ValidateTicketFunction = httpsCallable(
  functions,
  "validateTicket"
);
