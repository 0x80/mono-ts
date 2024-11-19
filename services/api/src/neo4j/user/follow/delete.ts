import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../../utils";
import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";
type Data = { userId: string };
export const deleteNeoFollowRelation =
  (driver: Driver) => (db: admin.firestore.Firestore) => {
    return functions.https.onCall(
      {
        region: "southamerica-east1",
      },
      async (request: CallableRequest<Data>) => {
        const { data } = request;
        const firebaseId1 = request.auth?.uid;
        const firebaseId2 = data.userId;
        return runNeoTransaction(driver, async (transaction: Transaction) => {
          await transaction.run(
            `MATCH (user1:User {firebaseId: $firebaseId1})-[r:FOLLOWS]->(user2:User {firebaseId: $firebaseId2})
                DELETE r
                RETURN user1, user2;`,
            { firebaseId1, firebaseId2 }
          );
          const deleteDocs = await db
            .collection("users")
            .doc(firebaseId2)
            .collection("followRequests")
            .where("userId", "==", firebaseId1)
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
