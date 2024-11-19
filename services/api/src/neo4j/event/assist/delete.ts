import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../../utils";
import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  eventId: string;
};

export const deleteNeoAssistRelation =
  (driver: Driver) => (db: admin.firestore.Firestore) => {
    return functions.https.onCall(
      {
        region: "southamerica-east1",
      },
      async (request: CallableRequest<Data>) => {
        const { data } = request;
        const userId = request.auth?.uid ?? "";
        const eventId = data.eventId;
        return runNeoTransaction(driver, async (transaction: Transaction) => {
          await transaction.run(
            `MATCH (u:User {firebaseId: $userId})-[r:ASSISTS]->(e:Event {firebaseId: $eventId})
                DELETE r
                RETURN user1, user2;`,
            { userId, eventId }
          );
          const deleteDocs = await db
            .collection("users")
            .doc(userId)
            .collection("followRequests")
            .where("eventId", "==", eventId)
            .get();
          await Promise.all(
            deleteDocs.docs.map((doc) => {
              return doc.ref.delete();
            })
          );
        });
      }
    );
  };
