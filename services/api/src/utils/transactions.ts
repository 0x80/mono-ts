const MAX_RETRIES = 10;
import type admin from "firebase-admin";
import * as functions from "firebase-functions";

export const runTransactionWithRetries = async <T = void>(
  db: admin.firestore.Firestore,
  transactionFunction: (
    transaction: FirebaseFirestore.Transaction
  ) => Promise<T>
) => {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      functions.logger.info(`Starting transaction attempt ${attempt + 1}`);
      const result = await db.runTransaction(transactionFunction);
      functions.logger.info("Transaction succeeded");
      return result;
    } catch (error) {
      functions.logger.error(
        `Transaction attempt ${attempt + 1} failed:`,
        error
      );
      if (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).code === 10 /* ABORTED */ &&
        attempt < MAX_RETRIES - 1
      ) {
        const waitTime =
          Math.pow(2, attempt) * 100 + Math.floor(Math.random() * 100);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        attempt++;
      } else {
        throw new Error(`Transaction failed: ${error}`);
      }
    }
  }

  throw new Error("Transaction failed after maximum retries");
};
