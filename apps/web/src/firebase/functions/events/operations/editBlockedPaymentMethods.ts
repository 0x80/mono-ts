import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "../..";

type EditBlockedPaymentMethods = HttpsCallable<
  {
    options: string[];
    eventId: string;
  },
  void
>;

export const editBlockedPaymentMethodsFunction: EditBlockedPaymentMethods =
  httpsCallable(functions, "editBlockedPaymentMethods");
