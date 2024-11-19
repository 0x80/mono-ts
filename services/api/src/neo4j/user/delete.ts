import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../utils";

export const deleteNeoUser = (driver: Driver) => async (firebaseId: string) => {
  return runNeoTransaction(driver, async (transaction: Transaction) => {
    return transaction.run(
      `MATCH (u:User {firebaseId: $firebaseId})
         DETACH DELETE u`,
      { firebaseId }
    );
  });
};
