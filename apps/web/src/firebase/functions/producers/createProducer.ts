import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";
import type { Producer } from "@/firebase/interfaces/producers";

type CreateProducerFunction = HttpsCallable<Producer, void>;

export const createProducerFunction: CreateProducerFunction = httpsCallable(
  functions,
  "createProducer"
);
