import type { Driver, Transaction } from "neo4j-driver";
import { runNeoTransaction } from "../utils";

export const createNeoEventFunction = async (
  neoTransaction: Transaction,
  firebaseId: string,
  name: string,
  tags: string[],
  location: string,
  status: string
): Promise<string> => {
  try {
    const result = await neoTransaction.run(
      `MERGE (e:Event {firebaseId: $firebaseId})
       ON CREATE SET e.name = $name, e.tags = $tags, e.location = $location, e.status = $status
       RETURN id(e) AS eventId`, // Use id(u) instead of elementId(u)
      { name, firebaseId, tags: tags ?? [], location, status }
    );
    return result.records[0]?.get("eventId").toString(); // Ensure it returns the userId or null
  } catch (error) {
    console.error("Error creating or merging user:", firebaseId);
    console.error(error);
    return ""; // Return null on error
  }
};

export const createNeoEvent =
  (driver: Driver) =>
  async (
    firebaseId: string,
    name: string,
    tags: string[],
    location: string,
    status: string
  ) => {
    return runNeoTransaction(driver, async (transaction: Transaction) => {
      return createNeoEventFunction(
        transaction,
        firebaseId,
        name,
        tags,
        location,
        status
      );
    });
  };
