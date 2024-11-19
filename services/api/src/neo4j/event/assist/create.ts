import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../../utils";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  eventId: string;
  buyed: boolean;
};

export const createNeoAssistRelation =
  (driver: Driver) => (db: admin.firestore.Firestore) => {
    return functions.https.onCall(
      {
        region: "southamerica-east1",
      },
      async (request: CallableRequest<Data>) => {
        const { data } = request;
        const userId = request.auth?.uid ?? "";
        const { eventId, buyed } = data;
        return runNeoTransaction(driver, async (transaction: Transaction) => {
          await transaction.run(
            `MATCH (u:User {firebaseId: $userId}), (e:Event {firebaseId: $eventId})
             CREATE (u)-[assists:ASSISTS { buyed: $buyed }]->(e)
             RETURN assists`,
            { userId, eventId, buyed }
          );
          await db
            .collection("users")
            .doc(userId)
            .collection("eventsAttending")
            .add({
              eventId: eventId,
              createdAt: admin.firestore.Timestamp.now(),
              userName: request.auth?.token.name,
              buyed: buyed,
            });
        });
      }
    );
  };
