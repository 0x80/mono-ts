import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../../utils";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  userId: string;
  isPublic: boolean;
};

export const createNeoFollowRelation =
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
          const result = await transaction.run(
            `MATCH (user1:User {firebaseId: $firebaseId1}), (user2:User {firebaseId: $firebaseId2})
             CREATE (user1)-[follows:FOLLOWS { accepted: user2.isPublic, createdAt: $createdAt }]->(user2)
             RETURN follows.accepted AS accepted;`,
            { firebaseId1, firebaseId2, createdAt: new Date().getTime() }
          );
          const record = result.records[0];
          if (!record) {
            throw new functions.https.HttpsError(
              "not-found",
              "Follow relation not created."
            );
          }
          const accepted = record.get("accepted");
          await db
            .collection("users")
            .doc(firebaseId2)
            .collection("followRequests")
            .add({
              userId: firebaseId1,
              createdAt: admin.firestore.Timestamp.now(),
              userName: request.auth?.token.name,
              status: accepted ? "Accepted" : "Pending",
            });
        });
      }
    );
  };
