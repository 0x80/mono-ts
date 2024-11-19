import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../utils";

export const updateNeoEvent =
  (driver: Driver) =>
  async (
    firebaseId: string,
    name: string,
    tags: string[],
    location: string,
    status: string
  ) => {
    return runNeoTransaction(driver, async (transaction: Transaction) => {
      return transaction.run(
        `MERGE (e:Event {firebaseId: $firebaseId}) SET e.name = $name, e.tags = $tags, e.location = $location, e.status = $status`,
        { firebaseId, name, tags, location, status }
      );
    });
  };
