import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import { getGoogleSecret } from "../../utils/getSecret";

import type { Order } from "../../orders/interfaces";
import { runTransactionWithRetries } from "../../utils/transactions";
import { getCurrentEnv } from "../../utils/getCurrentEnv";
import { orderApproveHandler } from "../../orders/utils";
import { rejectOrder } from "../../orders/freeOrder";

type RequestBody = {
  payment_id: string;
};

type PaymentDetailResponse = {
  payment_id: string;
  status: string;
  status_detail: string;
  amount: string;
  currency: string;
  receiver_id: number;
};

export const khipuPaymentsWebhook = (db: admin.firestore.Firestore) => {
  const { isDev } = getCurrentEnv();
  return functions.https.onRequest(
    {
      region: "southamerica-east1",
      minInstances: isDev ? 0 : 1,
      maxInstances: 100,
    },
    async (req, res) => {
      const { payment_id } = req.body as RequestBody;

      const secret = await getGoogleSecret(
        "/secrets/khipu-api/versions/latest"
      );
      if (!secret) {
        console.error("Failed to retrieve Khipu API secret");
        throw new Error("Khipu API secret not found");
      }

      const config = {
        "x-api-key": secret,
        "Content-Type": "application/json",
      };

      const response = await fetch(
        "https://payment-api.khipu.com/v3/payments/" + payment_id,
        {
          method: "GET",
          headers: config,
        }
      );

      const responseJson = (await response.json()) as PaymentDetailResponse;

      const paymentRef = await db
        .collection("orders")
        .where("khipu.payment_token", "==", payment_id)
        .get();
      const orderRef = paymentRef.docs[0]?.ref;

      if (!orderRef) {
        console.error("Order not found");
        res.status(400).send("Order not found");
        return;
      }

      return runTransactionWithRetries(db, async (transaction) => {
        const orderData = (await transaction.get(orderRef)).data() as Order;

        if (
          responseJson.status === "done" &&
          responseJson.status_detail === "normal" &&
          ["Pending"].includes(orderData.status)
        ) {
          await orderApproveHandler(
            db,
            orderData,
            transaction,
            orderRef,
            "khipu",
            payment_id,
            orderData.metadata
          );
          res.status(200).send("Payment received");
          return;
        } else {
          await rejectOrder(db, transaction, orderRef, orderData, "khipu");
          res.status(400).send("Rejected by khipu");
          return;
        }
      });
    }
  );
};
