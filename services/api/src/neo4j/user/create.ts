import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../utils";

export const createNeoUserFunction = async (
  neoTransaction: Transaction,
  displayName: string,
  firebaseId: string,
  photoUrl: string,
  email: string
) => {
  try {
    const result = await neoTransaction.run(
      `MERGE (u:User {firebaseId: $firebaseId})
       ON CREATE SET u.displayName = $displayName, u.photoUrl = $photoUrl, u.email = $email, u.isPublic = true
       RETURN id(u) AS userId`, // Use id(u) instead of elementId(u)
      { displayName, firebaseId, photoUrl, email }
    );
    return result.records[0]?.get("userId").toString(); // Ensure it returns the userId or null
  } catch (error) {
    console.error("Error creating or merging user:", firebaseId);
    console.error(error);
    return null; // Return null on error
  }
};

export const createNeoUser =
  (driver: Driver) =>
  async (
    displayName: string,
    firebaseId: string,
    photoUrl: string,
    email: string
  ) => {
    return runNeoTransaction(driver, async (transaction: Transaction) => {
      return createNeoUserFunction(
        transaction,
        displayName,
        firebaseId,
        photoUrl,
        email
      );
    });
  };
