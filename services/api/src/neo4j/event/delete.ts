import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../utils";

export const deleteNeoEvent =
  (driver: Driver) => async (firebaseId: string) => {
    return runNeoTransaction(driver, async (transaction: Transaction) => {
      return transaction.run(
        `MATCH (e:Event {firebaseId: $firebaseId})
         DETACH DELETE e`,
        { firebaseId }
      );
    });
  };
