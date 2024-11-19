import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";

type Data = {
  eventId: string;
};

type GetEventsTicketsFromBigQueryFunction = HttpsCallable<
  Data,
  {
    document_id: string;
    userName: string;
    userMail: string;
    name: string;
    metadata: string;
    channel: string;
    userDni: string;
    status: string;
    orderId: string;
  }[]
>;

export const getEventsTicketsFromBigQueryFunction: GetEventsTicketsFromBigQueryFunction =
  httpsCallable(functions, "getEventsTicketsFromBigQuery");
