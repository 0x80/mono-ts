import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";

type Data = {
  eventId: string;
};

type GetEventsOrdersFromBigQueryFunction = HttpsCallable<
  Data,
  {
    document_id: string;
    userName: string;
    userMail: string;
    userDni: string;
    totalSelled: number;
    channel: string;
    createdAt: {
      value: string;
    };
    metadata: string;
  }[]
>;

export const getEventsOrdersFromBigQueryFunction: GetEventsOrdersFromBigQueryFunction =
  httpsCallable(functions, "getEventsOrdersFromBigQuery");
