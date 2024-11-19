import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../../utils";
import * as functions from "firebase-functions";
import type admin from "firebase-admin";

export const getNeoFollowers =
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
            OPTIONAL MATCH (friend:User)-[friendFollow:FOLLOWS]->(user)
            WHERE friendFollow.accepted = true
            OPTIONAL MATCH (user)-[follows:FOLLOWS]->(friend)
            WITH friend, friendFollow, follows
            WHERE friend IS NOT NULL
            RETURN friend.photoUrl AS photoUrl,
                friend.firebaseId AS firebaseId,
                friend.displayName AS displayName,
                CASE WHEN follows IS NOT NULL THEN true ELSE false END AS userFollowsFriend,
                friend.isPublic AS isPublic,
                CASE WHEN follows IS NOT NULL THEN follows.accepted ELSE false END AS accepted
                ORDER BY toLower(friend.displayName);`,
            { firebaseId }
          );

          const userDetails = result.records.map((record) => ({
            displayName: record.get("displayName"),
            photoUrl: record.get("photoUrl"),
            firebaseId: record.get("firebaseId"),
            following: record.get("userFollowsFriend"),
            accepted: record.get("accepted"),
            isPublic: record.get("isPublic"),
          }));
          await db.collection("users").doc(firebaseId).update({
            followersCount: userDetails.length,
          });
          return userDetails;
        });
      }
    );
  };
