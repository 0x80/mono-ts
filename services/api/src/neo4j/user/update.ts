import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../utils";

export const updateNeoUser =
  (driver: Driver) =>
  async (
    firebaseId: string,
    displayName?: string,
    photoUrl?: string,
    email?: string,
    isPublic?: boolean
  ) => {
    return runNeoTransaction(driver, async (transaction: Transaction) => {
      return transaction.run(
        `MERGE (u:User {firebaseId: $firebaseId}) SET u.displayName = $displayName, u.photoUrl = $photoUrl, u.email = $email, u.isPublic = $isPublic`, // Use id(u) instead of elementId(u)
        { firebaseId, displayName, photoUrl, email, isPublic }
      );
    });
  };
