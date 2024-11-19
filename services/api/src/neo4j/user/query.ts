import type { Driver } from "neo4j-driver";
import * as functions from "firebase-functions";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  query: string;
};

export const queryNeoUsers = (driver: Driver) => () => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { query } = data;
      const session = driver.session();
      try {
        const firebaseId = request.auth?.uid;
        const result = await session.run(
          `
            CALL db.index.fulltext.queryNodes('user_display_name_index', $query) YIELD node
            WHERE node.firebaseId <> $firebaseId
            MATCH (user:User {firebaseId: $firebaseId})
            OPTIONAL MATCH (user)-[follows:FOLLOWS]->(node)
            RETURN node.displayName AS displayName,
            node.photoUrl AS photoUrl,
            node.isPublic AS isPublic,
            node.firebaseId AS firebaseId,
            CASE WHEN follows IS NOT NULL THEN true ELSE false END AS userFollowsNode,
            CASE WHEN follows IS NOT NULL THEN follows.accepted ELSE false END AS accepted
            ORDER BY toLower(node.displayName);
          `,
          { query, firebaseId }
        );

        await session.close();

        // Map the result to return only 'displayName' and 'photoUrl'
        const userDetails = result.records.map((record) => ({
          displayName: record.get("displayName"),
          photoUrl: record.get("photoUrl"),
          firebaseId: record.get("firebaseId"),
          following: record.get("userFollowsNode"),
          accepted: record.get("accepted"),
          isPublic: record.get("isPublic"),
        }));
        return userDetails;
      } catch (error) {
        await session.close();
        console.log("error");
        console.log(error);

        return [];
      }
    }
  );
};
