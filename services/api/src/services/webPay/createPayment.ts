import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { Order } from "../../orders/interfaces";

//import { getCurrentEnv } from "../../utils/getCurrentEnv";
import type { User } from "../../users/interfaces";
import { getGoogleSecret } from "../../utils/getSecret";
import { getCurrentEnv } from "../../utils/getCurrentEnv";
import { runTransactionWithRetries } from "../../utils/transactions";
import { orderApproveHandler } from "../../orders/utils";
import { rejectOrder } from "../../orders/freeOrder";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  orderId: string;
  userId: string;
  metadata?: { [key: string]: { [key: string]: string } };
};

type TransactionDetail = {
  amount: number;
  status: string;
  authorization_code: string;
  payment_type_code: string;
  response_code: number;
  installments_number: number;
  commerce_code: string;
  buy_order: string;
};

type TransactionPayment = {
  username: string;
  tbk_user: string;
  buy_order: string;
  details: {
    commerce_code: string;
    buy_order: string;
    amount: number;
  }[];
};

export const webPayCreatePayment = (db: admin.firestore.Firestore) => {
  const { isDev } = getCurrentEnv();
  return functions.https.onCall(
    {
      region: "southamerica-east1",
      minInstances: isDev ? 0 : 1,
      maxInstances: 100,
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      try {
        const { orderId, userId, metadata } = data;

        const userData = (
          await db.collection("users").doc(userId).get()
        ).data() as User;

        const apiKeys = (await getGoogleSecret(
          "/secrets/Tbk-Api-Keys/versions/latest"
        )) as string;
        const apiKeysObject = JSON.parse(apiKeys);

        const config = {
          "Content-Type": "application/json",
          "Tbk-Api-Key-Id": apiKeysObject["Tbk-Api-Key-Id"],
          "Tbk-Api-Key-Secret": apiKeysObject["Tbk-Api-Key-Secret"],
        };

        const webPayUrl = isDev
          ? "https://webpay3gint.transbank.cl"
          : "https://webpay3g.transbank.cl";

        const paymentRef = await db.collection("orders").doc(orderId).get();
        const orderRef = paymentRef.ref ?? "";

        return runTransactionWithRetries(db, async (transaction) => {
          const orderData = (await transaction.get(orderRef)).data() as Order;
          try {
            if (orderData.status !== "Pending") {
              return;
            }
            const paymentInfo: TransactionPayment = {
              username: userData.email,
              tbk_user: userData.transbank?.tbkUser ?? "",
              buy_order: orderId,
              details: [
                {
                  commerce_code: isDev ? "597055555542" : "597051977527",
                  buy_order: orderId + "-1",
                  amount: orderData.totalWithServiceFeeSelled,
                },
              ],
            };

            const response = await fetch(
              `${webPayUrl}/rswebpaytransaction/api/oneclick/v1.2/transactions`,
              {
                method: "POST",
                headers: config,
                body: JSON.stringify(paymentInfo),
              }
            );
            const responseData = (await response.json()) as {
              details: TransactionDetail[];
            };
            const transactionDetail = responseData
              .details[0] as TransactionDetail;

            if (
              transactionDetail.response_code == 0 &&
              transactionDetail.status == "AUTHORIZED"
            ) {
              await orderApproveHandler(
                db,
                orderData,
                transaction,
                orderRef,
                "webPay",
                transactionDetail.buy_order,
                metadata
              );
              return;
            } else {
              functions.logger.error("Rejected by WebPay");
              await rejectOrder(db, transaction, orderRef, orderData, "webPay");
              return;
            }
          } catch (error) {
            functions.logger.error("Error checking payment");
            functions.logger.error(error);
            await rejectOrder(db, transaction, orderRef, orderData, "webPay");
            return;
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          // Standard JavaScript error handling
          functions.logger.warn(error);
          return error.message;
        } else {
          // If the error doesn't match the Error type, handle it generically
          functions.logger.warn("An unknown error occurred");
          return "An unknown error occurred.";
        }
      }
    }
  );
};
