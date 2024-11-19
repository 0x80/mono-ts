import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../../utils";
import * as functions from "firebase-functions";

export const getNeoFollowRecommendations = (driver: Driver) => () => {
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
        const result1 = await transaction.run(
          `MATCH (user:User {firebaseId: $firebaseId})
            MATCH (user)-[:FOLLOWS]->(friend)-[:FOLLOWS]->(recommendedUser:User)
            WHERE NOT (user)-[:FOLLOWS]->(recommendedUser) AND recommendedUser <> user
            WITH recommendedUser, count(*) AS frequency
            RETURN recommendedUser.photoUrl AS photoUrl, 
                  recommendedUser.firebaseId AS firebaseId, 
                  recommendedUser.displayName AS displayName,
                  recommendedUser.isPublic AS isPublic
            ORDER BY frequency DESC
            LIMIT 20`,
          { firebaseId }
        );

        const excludedUserIds = result1.records.map((record) =>
          record.get("firebaseId")
        );

        const userDetails = result1.records.map((record) => ({
          displayName: record.get("displayName"),
          photoUrl: record.get("photoUrl"),
          firebaseId: record.get("firebaseId"),
          following: false,
          accepted: false,
          isPublic: record.get("isPublic"),
        }));

        // Segunda consulta para obtener usuarios que no están en la lista de recomendaciones
        if (userDetails.length < 20) {
          const neededCount = Math.floor(20 - userDetails.length);

          const result2 = await transaction.run(
            `MATCH (user:User {firebaseId: $firebaseId})
              MATCH (potentialUser:User)
              WHERE NOT (user)-[:FOLLOWS]->(potentialUser)
                AND potentialUser <> user
                AND NOT potentialUser.firebaseId IN $excludedUserIds
              OPTIONAL MATCH (potentialUser)<-[:FOLLOWS]-(:User)
              WITH potentialUser, count(*) AS followerCount
              WHERE potentialUser IS NOT NULL
              RETURN potentialUser.photoUrl AS photoUrl, 
                    potentialUser.firebaseId AS firebaseId, 
                    potentialUser.displayName AS displayName,
                    potentialUser.isPublic AS isPublic,
                    followerCount
              ORDER BY followerCount DESC
              LIMIT ${neededCount}`,
            { firebaseId, excludedUserIds }
          );

          const newUsers = result2.records.map((record) => ({
            displayName: record.get("displayName"),
            photoUrl: record.get("photoUrl"),
            firebaseId: record.get("firebaseId"),
            following: false,
            accepted: false,
            isPublic: record.get("isPublic"),
          }));

          userDetails.push(...newUsers);
        }

        return userDetails;
      });
    }
  );
};
