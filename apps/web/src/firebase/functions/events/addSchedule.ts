import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";
import type { ScheduleForm } from "@/firebase/interfaces/events";

type AddScheduleFunction = HttpsCallable<
  { eventId: string; scheduleForm: ScheduleForm },
  void
>;

export const addScheduleFunction: AddScheduleFunction = httpsCallable(
  functions,
  "addSchedule"
);
