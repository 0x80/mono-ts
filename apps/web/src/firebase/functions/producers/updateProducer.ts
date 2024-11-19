import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";
import type { Producer } from "@/firebase/interfaces/producers";

type Data = {
  producer: Producer;
  producerId: string;
};

type UpdateProducerFunction = HttpsCallable<Data, void>;

export const updateProducerFunction: UpdateProducerFunction = httpsCallable(
  functions,
  "updateProducer"
);
