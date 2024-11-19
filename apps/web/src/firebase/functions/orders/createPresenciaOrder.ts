import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";

export type TicketCount = {
  name: string;
  count: number;
};

type Data = {
  ticketCount: TicketCount[];
  eventId: string;
  concurrentDate: number;
  date: string;
  hour: number;
  expirationDate: string;
  isWeb?: boolean;
  isEventActivated?: boolean;
  metadata: {
    [key: string]: {
      [key: string]: string;
    };
  };
};

export type CreatePresencialOrderFunctionInput = {
  calculateTotal: Data;
  email: string;
  hasUser: boolean;
  dni: string;
  displayName: string;
  getUserByDni?: boolean;
};

type CreatePresencialOrderFunction = HttpsCallable<
  CreatePresencialOrderFunctionInput,
  string
>;

export const createPresencialOrderFunction: CreatePresencialOrderFunction =
  httpsCallable(functions, "createPresencialOrder");
