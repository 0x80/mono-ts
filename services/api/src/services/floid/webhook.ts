import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import { getGoogleSecret } from "../../utils/getSecret";

import type { Order } from "../../orders/interfaces";
import { runTransactionWithRetries } from "../../utils/transactions";
import { getCurrentEnv } from "../../utils/getCurrentEnv";
import { orderApproveHandler } from "../../orders/utils";
import { rejectOrder } from "../../orders/freeOrder";

type JwtHeader = {
  alg: string;
  typ: string;
};

type JwtPayload = {
  code: number;
  message: string;
  transfer_data: {
    recipient_email: string;
    recipient_account: string;
    recipient_id: string;
    recipient_name: string;
    recipient_account_type: number;
    recipient_account_type_name: string;
    recipient_account_bank: number;
    recipient_account_bank_name: string;
    recipient_account_currency: string;
    origin_id: string;
    origin_account_bank: number;
    origin_account_bank_name: string;
    origin_account: number;
    origin_account_type: number;
    origin_account_type_name: string;
    method: string;
  };
  status: string;
  step: string;
  payment_id: string;
  payment_token: string;
  iat: number;
};

type DecodedJwt = {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
};

const base64UrlDecode = (base64Url: string): string => {
  // Convert from base64url to base64
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  // Decode base64 string
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return jsonPayload;
};

const decodeJWT = (token: string): DecodedJwt => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }
  const [header, payload, signature] = parts;
  const decodedHeader = JSON.parse(base64UrlDecode(header ?? "")) as JwtHeader;
  const decodedPayload = JSON.parse(
    base64UrlDecode(payload ?? "")
  ) as JwtPayload;

  return {
    header: decodedHeader,
    payload: decodedPayload,
    signature: signature ?? "", // Note: Signature is base64Url encoded and should not be decoded
  };
};

type PaymentCheckResponse = {
  code: number;
  payment_token: string;
  status: string;
  step: string;
  last_date: string;
  transfer_data: {
    recipient_email: string;
    recipient_account: string;
    recipient_id: string;
    recipient_name: string;
    recipient_account_type: number;
    recipient_account_type_name: string;
    recipient_account_bank: number;
    recipient_account_bank_name: string;
    recipient_account_currency: string;
    origin_id: string;
    origin_account_bank: number;
    origin_account_bank_name: string;
    origin_account: number;
    origin_account_type: number;
    origin_account_type_name: string;
    method: string;
  };
  expired: boolean;
};

export const floidPaymentsWebhook = (db: admin.firestore.Firestore) => {
  const { isDev } = getCurrentEnv();

  return functions.https.onRequest(
    {
      region: "southamerica-east1",
      minInstances: isDev ? 0 : 1,
      maxInstances: 100,
    },
    async (req, res) => {
      const paymentId = req.body.payment;

      const { payload } = decodeJWT(paymentId);

      const secret = await getGoogleSecret(
        "/secrets/floid-api/versions/latest"
      );

      const config = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      };

      const data = {
        payment_token: payload.payment_token,
      };

      const response = await fetch("https://api.floid.app/cl/payments/check", {
        method: "POST",
        headers: config,
        body: JSON.stringify(data),
      });

      const responseJson = (await response.json()) as PaymentCheckResponse;

      const paymentRef = await db
        .collection("orders")
        .where("floid.payment_token", "==", responseJson.payment_token)
        .get();
      const orderRef = paymentRef.docs[0]?.ref;

      if (!orderRef) {
        functions.logger.error("Order not found");
        res.status(404).send("Order not found");
        return;
      }

      return runTransactionWithRetries(db, async (transaction) => {
        const orderData = (await transaction.get(orderRef)).data() as Order;

        if (
          responseJson.status === "SUCCESS" &&
          responseJson.code == 200 &&
          responseJson.step === "FINISHED" &&
          ["Pending"].includes(orderData.status)
        ) {
          await orderApproveHandler(
            db,
            orderData,
            transaction,
            orderRef,
            "floid",
            responseJson.payment_token,
            orderData.metadata
          );
          res.status(200).send("Payment received");
          return;
        } else {
          functions.logger.error("Rejected by floid");

          await rejectOrder(db, transaction, orderRef, orderData, "floid");
          res.status(400).send("Rejected by floid");
          return;
        }
      });
    }
  );
};
