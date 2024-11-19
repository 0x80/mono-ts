import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../../utils";
import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  userId: string;
};

export const acceptNeoFollowRequest =
  (driver: Driver) => (db: admin.firestore.Firestore) => {
    return functions.https.onCall(
      {
        region: "southamerica-east1",
      },
      async (request: CallableRequest<Data>) => {
        const { data } = request;
        const firebaseId1 = request.auth?.uid;
        const firebaseId2 = data.userId;
        console.log(firebaseId1, firebaseId2);
        try {
          if (!firebaseId1 || !firebaseId2) {
            throw new functions.https.HttpsError(
              "invalid-argument",
              "Missing required parameters."
            );
          }

          return runNeoTransaction(driver, async (transaction: Transaction) => {
            // Update the FOLLOWS relationship to mark it as accepted
            const result = await transaction.run(
              `MATCH (user1:User {firebaseId: $firebaseId2})-[follows:FOLLOWS]->(user2:User {firebaseId: $firebaseId1})
               SET follows.accepted = true
               RETURN follows;`,
              { firebaseId2, firebaseId1 }
            );

            if (result.records.length === 0) {
              throw new functions.https.HttpsError(
                "not-found",
                "Follow relationship not found."
              );
            }

            // Update Firestore to mark the follow request as accepted
            const followRequestRef = db
              .collection("users")
              .doc(firebaseId1)
              .collection("followRequests");

            const snapshot = await followRequestRef
              .where("userId", "==", firebaseId2)
              .get();

            if (snapshot.empty) {
              throw new functions.https.HttpsError(
                "not-found",
                "Follow request not found in Firestore."
              );
            }

            await Promise.all(
              snapshot.docs.map((doc) => {
                return doc.ref.update({ status: "Accepted" });
              })
            );

            return { success: true };
          });
        } catch (error) {
          console.error(error);
          console.log(firebaseId1, firebaseId2);
          return;
        }
      }
    );
  };
