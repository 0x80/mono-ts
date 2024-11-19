import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "../..";
import type { RequiredMetadata } from "@/firebase/interfaces/events";

type Action = "edit" | "delete" | "add";

type EditRequiredMetadata = HttpsCallable<
  {
    requiredMetadata: RequiredMetadata;
    action: Action;
    eventId: string;
  },
  void
>;

export const editRequiredMetadataFunction: EditRequiredMetadata = httpsCallable(
  functions,
  "editRequiredMetadata"
);
