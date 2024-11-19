import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";

type AddProducerToUserFunction = HttpsCallable<
  {
    producerId: string;
    producerName: string;
    add: boolean;
    userRef: string;
  },
  void
>;

export const addProducerToUserFunction: AddProducerToUserFunction =
  httpsCallable(functions, "addProducerToUser");
