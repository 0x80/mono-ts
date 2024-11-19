import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { calculateTotalFunction } from "../events/calculateTotals";
import type { TicketCount } from "../events/calculateTotals";
import { approveFreeOrderFunction } from "./freeOrder";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  ticketCount: TicketCount[];
  eventId: string;
  concurrentDate: number;
  date: string;
  hour: number;
  expirationDate: string;
  isWeb?: boolean;
  isEventActivated?: boolean;
  metadata?: {
    [key: string]: {
      [key: string]: string;
    };
  };
};

type Input = {
  calculateTotal: Data;
  email: string;
  hasUser: boolean;
  dni: string;
  displayName: string;
  getUserByDni?: boolean;
};

const createUserRecord = async (
  data: Input
): Promise<admin.auth.UserRecord> => {
  try {
    return await admin.auth().getUserByEmail(data.email);
  } catch {
    return {
      uid: "presencialUser",
      email: data.email,
      displayName: data.displayName,
      emailVerified: false,
      disabled: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
        toJSON: () => ({}),
      },
      providerData: [],
      customClaims: {
        dni: data.dni,
      },
      toJSON: () => ({}),
    } as admin.auth.UserRecord;
  }
};

const getUser = async (
  db: admin.firestore.Firestore,
  email: string,
  dni: string,
  getUserByDni: boolean
): Promise<admin.auth.UserRecord | string> => {
  try {
    if (getUserByDni) {
      const userDocs = await db
        .collection("users")
        .where("dni", "==", dni)
        .get();
      if (userDocs.empty) {
        return "Usuario no encontrado";
      }
      const userDoc = userDocs.docs[0];
      if (!userDoc) {
        return "Usuario no encontrado";
      }
      const user = userDoc.data();
      return await admin.auth().getUserByEmail(user.email);
    } else {
      return await admin.auth().getUserByEmail(email);
    }
  } catch (error) {
    return `Error fetching user: ${error}`;
  }
};

const validateTicketCount = (ticketCount: TicketCount[]): boolean => {
  return ticketCount.reduce((total, ticket) => total + ticket.count, 0) > 0;
};

const validateInput = (data: Input): string | null => {
  if (!data.hasUser) {
    if (!data.email) return "Falta el email";
    if (!data.displayName) return "Falta el nombre";
    if (!data.dni) return "dni";
  }
  return null;
};

export const createPresencialOrder = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Input>) => {
      const { data } = request;
      try {
        const validationError = validateInput(data);
        if (validationError) return validationError;

        const user = data.hasUser
          ? await getUser(db, data.email, data.dni, data.getUserByDni ?? false)
          : await createUserRecord(data);
        if (typeof user === "string") return user;

        if (!validateTicketCount(data.calculateTotal.ticketCount))
          return "Selecciona un ticket";

        const calculateTotalResult = await calculateTotalFunction(
          db,
          {
            ...data.calculateTotal,
            isPresencial: true,
            deviceType: "presencial",
          },
          user
        );

        if (!calculateTotalResult.error.success)
          return calculateTotalResult.error.message;

        return approveFreeOrderFunction(
          db,
          calculateTotalResult?.orderId ?? "",
          "presencial"
        );
      } catch (error) {
        if (error instanceof Error) {
          // Standard JavaScript error handling
          functions.logger.warn(error);
          return error.message;
        } else {
          // If the error doesn't match the Error type, handle it generically
          return "An unknown error occurred.";
        }
      }
    }
  );
};
