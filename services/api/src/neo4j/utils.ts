import type { Transaction } from "neo4j-driver";
import type { Driver } from "neo4j-driver-core";

export const runNeoTransaction = async <T = void>(
  driver: Driver,
  transactionFunction: (transaction: Transaction) => Promise<T>
) => {
  const session = driver.session();
  let transaction = null;

  try {
    transaction = session.beginTransaction();
    const result = await transactionFunction(transaction);
    await transaction.commit();
    await session.close();
    return result;
  } catch (error) {
    await session.close();
    throw error;
  }
};
