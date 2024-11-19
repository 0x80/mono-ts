import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "../..";

type EditScheduleFunction = HttpsCallable<
  {
    name: string;
    description: string;
    type: string;
    ticketTotal: number;
    visible: boolean;
    eventId: string;
    action: "edit" | "deplete";
  },
  void
>;

export const editScheduleFunction: EditScheduleFunction = httpsCallable(
  functions,
  "editScheduleFunction"
);
