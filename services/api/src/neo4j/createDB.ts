import type { Driver, Transaction } from "neo4j-driver";
import type admin from "firebase-admin";
import * as functions from "firebase-functions";
import type { UserWithId } from "../users/interfaces";
import { createNeoUserFunction } from "./user/create";
import { createNeoEventFunction } from "./event/create";
import type { EventWithId } from "@repo/types";

export const createNeoDB =
  (driver: Driver) => (db: admin.firestore.Firestore) => {
    return functions.https.onCall(
      { region: "southamerica-east1" },
      async () => {
        try {
          // Ensure schemas are created before processing users

          await createConstrait(driver);
          await createFulltext(driver);

          // Now handle users
          const session = driver.session();
          const neoTransaction = session.beginTransaction(); // Start a transaction for Neo4j writes
          try {
            // Get all users from Firestore
            await createUsers(neoTransaction, db);
            await createEvents(neoTransaction, db);

            // Commit the user transaction
            await neoTransaction.commit();
          } catch (error) {
            await neoTransaction.rollback(); // Rollback the transaction on error
            console.error(
              "Error creating Neo4j users and updating Firestore:",
              error
            );
          } finally {
            await session.close(); // Ensure session is closed after operations
          }
        } catch (error) {
          console.error("Error creating schemas:", error);
        }
      }
    );
  };

const createUsers = async (
  neoTransaction: Transaction,
  db: admin.firestore.Firestore
) => {
  const usersSnapshot = await db.collection("users").get();
  const users = usersSnapshot.docs.map(
    (doc) =>
      ({
        ...doc.data(),
        id: doc.id, // Include docId for updating Firestore later
      }) as UserWithId
  );

  // Create or merge each user in Neo4j and update Firestore with the Neo4j ID
  const userPromises = users.map(async (user) => {
    const { display_name, photo_url, id, email } = user;

    // Create or merge user in Neo4j and get the Neo4j ID
    const neoId = await createNeoUserFunction(
      neoTransaction,
      display_name,
      id,
      photo_url ?? "",
      email
    );

    // Ensure neoId is valid before proceeding
    if (!neoId) {
      return;
    }

    // Update the Firestore document with the Neo4j ID
    await db.collection("users").doc(id).update({ neoId });
  });

  // Execute all user creation operations in parallel
  await Promise.all(userPromises);
};

const createEvents = async (
  neoTransaction: Transaction,
  db: admin.firestore.Firestore
) => {
  const eventsSnapshot = await db.collection("events").get();
  const events = eventsSnapshot.docs.map(
    (doc) =>
      ({
        ...doc.data(),
        id: doc.id, // Include docId for updating Firestore later
      }) as EventWithId
  );

  // Create or merge each event in Neo4j and update Firestore with the Neo4j ID
  const eventPromises = events.map(async (event) => {
    // Create or merge event in Neo4j and get the Neo4j ID
    const neoId = await createNeoEventFunction(
      neoTransaction,
      event.id,
      event.info.name,
      event.info.tags,
      event.location.name,
      event.info.status
    );

    // Ensure neoId is valid before proceeding
    if (!neoId) {
      return;
    }

    // Update the Firestore document with the Neo4j ID
    await db.collection("events").doc(event.id).update({ neoId });
  });

  // Execute all event creation operations in parallel
  await Promise.all(eventPromises);
};

export const createConstrait = async (driver: Driver) => {
  const session = driver.session();
  try {
    // Start a transaction for schema creation
    const schemaTx = session.beginTransaction();
    // Create the unique constraint on email if it doesn't already exist
    await schemaTx.run(
      `CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.firebaseId IS UNIQUE`
    );
    // Create the full-text search index if it doesn't already exist

    // Commit the schema transaction
    await schemaTx.commit();
    console.log("Schema created successfully.");
  } catch (error) {
    console.error("Error creating constrait:", error);
  } finally {
    await session.close();
  }
};

export const createEventConstrait = async (driver: Driver) => {
  const session = driver.session();
  try {
    // Start a transaction for schema creation
    const schemaTx = session.beginTransaction();
    // Create the unique constraint on email if it doesn't already exist
    await schemaTx.run(
      `CREATE CONSTRAINT IF NOT EXISTS FOR (e:Event) REQUIRE e.firebaseId IS UNIQUE`
    );
    // Create the full-text search index if it doesn't already exist

    // Commit the schema transaction
    await schemaTx.commit();
    console.log("Schema created successfully.");
  } catch (error) {
    console.error("Error creating constrait:", error);
  } finally {
    await session.close();
  }
};

export const createFulltext = async (driver: Driver) => {
  const session = driver.session();
  try {
    // Start a transaction for schema creation
    const schemaTx = session.beginTransaction();
    // Create the unique constraint on email if it doesn't already exist

    // Create the full-text search index if it doesn't already exist
    await schemaTx.run(
      `CREATE FULLTEXT INDEX user_display_name_index FOR (n:User) ON EACH [n.displayName]`
    );
    // Commit the schema transaction
    await schemaTx.commit();
    console.log("Schema created successfully.");
  } catch (error) {
    console.error("Error creating full text:", error);
  } finally {
    await session.close();
  }
};
