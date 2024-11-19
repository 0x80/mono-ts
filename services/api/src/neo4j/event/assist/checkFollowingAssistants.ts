import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../../utils";
import * as functions from "firebase-functions";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  eventId: string;
};

export const checkNeoFollowingAssistants = (driver: Driver) => () => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const userId = request.auth?.uid ?? "";
      const { eventId } = data;
      return runNeoTransaction(driver, async (transaction: Transaction) => {
        const results = await transaction.run(
          `MATCH (me:User {firebaseId: $userId})-[:FOLLOWS {accepted: true}]->(friend:User)-[:ASSISTS]->(e:Event {firebaseId: $eventId})
                RETURN friend.photoUrl AS photoUrl,
                friend.firebaseId AS firebaseId,
                friend.displayName AS displayName`,
          { userId, eventId }
        );
        const userDetails = results.records.map((record) => ({
          displayName: record.get("displayName"),
          photoUrl: record.get("photoUrl"),
          firebaseId: record.get("firebaseId"),
          following: true,
          accepted: true,
          isPublic: true,
        }));
        return userDetails;
      });
    }
  );
};
