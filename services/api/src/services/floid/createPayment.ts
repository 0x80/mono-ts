import { getCurrentEnv } from "../../utils/getCurrentEnv";
import { getGoogleSecret } from "../../utils/getSecret";
import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { Order } from "../../orders/interfaces";
import type { CallableRequest } from "firebase-functions/https";

export type FloidPaymentResponse = {
  code: number;
  payment_token: string;
  payment_url: string;
};

const createFloidPaymentData = (
  totalAmount: number,
  expirationDate: string,
  projectId: string,
  isDev: boolean,
  isWeb: boolean,
  orderId: string
) => {
  const returnUrl = isDev
    ? "https://early-qucgjs.flutterflow.app"
    : "https://app.byearly.com";

  return {
    amount: totalAmount,
    webhook_url: `https://southamerica-east1-${projectId}.cloudfunctions.net/floidPaymentsWebhook`,
    expiration_date: expirationDate.replace("T", " ").slice(0, 19),
    sandbox: isDev,
    redirect_url: isWeb
      ? `${returnUrl}/buyResult/${orderId}`
      : "https://pro.byearly.com/end",
  };
};

const handleFloidPaymentError = (error: unknown): FloidPaymentResponse => {
  console.error("Error creating floid payment:", error);
  return {
    code: 400,
    payment_token: "",
    payment_url: "",
  };
};

export const createFloidPaymentFunction = async (
  totalAmount: number,
  expirationDate: string,
  isWeb: boolean,
  orderId: string
): Promise<FloidPaymentResponse> => {
  try {
    const secret = await getGoogleSecret("/secrets/floid-api/versions/latest");
    const { projectId, isDev } = getCurrentEnv();

    const config = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    };

    const data = createFloidPaymentData(
      totalAmount,
      expirationDate,
      projectId,
      isDev,
      isWeb,
      orderId
    );

    const response = await fetch("https://api.floid.app/cl/payments/create", {
      method: "POST",
      headers: config,
      body: JSON.stringify(data),
    });

    const responseJson = (await response.json()) as FloidPaymentResponse;
    if (responseJson.code !== 200) {
      console.error("Error creating floid payment:", responseJson);
      return handleFloidPaymentError(responseJson);
    }

    return responseJson;
  } catch (error) {
    return handleFloidPaymentError(error);
  }
};

type Data = {
  orderId: string;
  metadata: { [key: string]: string };
  isWeb: boolean;
};

export const createFloidPayment = (db: admin.firestore.Firestore) => {
  const { isDev } = getCurrentEnv();
  return functions.https.onCall(
    {
      region: "southamerica-east1",
      minInstances: isDev ? 0 : 1,
      maxInstances: 100,
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { orderId, metadata } = data;
      const orderRef = db.collection("orders").doc(orderId);

      return db.runTransaction(async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        const orderData = orderDoc.data() as Order;
        if (orderData.status !== "Pending") {
          return "";
        }

        //IF ORDER HAS ALREADY FLOID, RETURN IT
        if (
          orderData.floid &&
          orderData.floid?.payment_url != "" &&
          orderData.floid?.payment_token != ""
        ) {
          return orderData.floid?.payment_url ?? "";
        }
        const floidPayment = await createFloidPaymentFunction(
          orderData.totalWithServiceFeeSelled,
          orderData.expirationDate,
          orderData.deviceType === "web",
          orderId
        );

        try {
          await transaction.update(orderRef, {
            floid: {
              payment_url: floidPayment.payment_url,
              payment_token: floidPayment.payment_token ?? "",
            },
            metadata: metadata ?? {},
          });
        } catch (updateError) {
          console.error(
            "Error updating order with Khipu payment:",
            updateError
          );
          throw new Error("Failed to update order with Khipu payment.");
        }

        return floidPayment.payment_url ?? "";
      });
    }
  );
};
