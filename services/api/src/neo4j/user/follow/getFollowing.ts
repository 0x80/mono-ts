import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../../utils";
import * as functions from "firebase-functions";
import type admin from "firebase-admin";

export const getNeoFollowing =
  (driver: Driver) => (db: admin.firestore.Firestore) => {
    return functions.https.onCall(
      {
        region: "southamerica-east1",
      },
      async (request) => {
        if (!request.auth) {
          throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be authenticated to get recommendations"
          );
        }
        const firebaseId = request.auth.uid;
        return runNeoTransaction(driver, async (transaction: Transaction) => {
          const result = await transaction.run(
            `MATCH (user:User {firebaseId: $firebaseId})
MATCH (user)-[follows:FOLLOWS]->(friend:User)
WITH friend, follows
            WHERE friend IS NOT NULL AND follows.accepted = true
RETURN friend.photoUrl AS photoUrl, 
       friend.firebaseId AS firebaseId, 
       friend.displayName AS displayName,
       friend.isPublic AS isPublic
       ORDER BY toLower(friend.displayName);
`,
            { firebaseId }
          );

          const userDetails = result.records.map((record) => ({
            displayName: record.get("displayName"),
            photoUrl: record.get("photoUrl"),
            firebaseId: record.get("firebaseId"),
            following: true,
            accepted: true,
            isPublic: record.get("isPublic"),
          }));

          await db.collection("users").doc(firebaseId).update({
            followingCount: userDetails.length,
          });
          return userDetails;
        });
      }
    );
  };
