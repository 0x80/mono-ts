import { getCurrentEnv } from "../../utils/getCurrentEnv";
import { getGoogleSecret } from "../../utils/getSecret";
import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { Order } from "../../orders/interfaces";
import type { CallableRequest } from "firebase-functions/https";

type KhipuPaymentBody = {
  amount: number;
  currency: string;
  subject: string;
  transaction_id: string;
  picture_url: string;
  expires_date: string;
  payer_name: string;
  payer_email: string;
  notify_url: string;
  return_url: string;
  cancel_url: string;
  send_email: boolean;
};

type KhipuPaymentResponse = {
  payment_id: string;
  simplified_transfer_url: string;
  error_payment_post_payments?: {
    http_status_code: number;
  };
};

const createKhipuPaymentBody = (
  order: Order,
  expirationDate: string,
  orderId: string,
  projectId: string,
  returnUrl: string,
  isWeb: boolean
): KhipuPaymentBody => ({
  amount: order.totalWithServiceFeeSelled,
  currency: "CLP",
  subject: `Pago para ${order.eventName} de ${order.userMail}`,
  transaction_id: orderId,
  picture_url:
    "https://firebasestorage.googleapis.com/v0/b/early-dev-73f4d.appspot.com/o/assets%2Flogo-email.jpg?alt=media&token=f31ff6c7-52db-442e-84b5-5481d246c062",
  expires_date: expirationDate,
  payer_name: order.userName,
  payer_email: order.userMail,
  notify_url: `https://southamerica-east1-${projectId}.cloudfunctions.net/khipuPaymentsWebhook`,
  return_url: isWeb
    ? `${returnUrl}/buyResult/${orderId}`
    : "https://pro.byearly.com/end",
  cancel_url: isWeb
    ? `${returnUrl}/events/${order.eventId}`
    : "https://pro.byearly.com/cancel",
  send_email: true,
});

const createKhipuPaymentFunction = async (
  order: Order,
  expirationDate: string,
  orderId: string,
  isDev: boolean,
  projectId: string,
  isWeb: boolean
): Promise<KhipuPaymentResponse> => {
  const returnUrl = isDev
    ? "https://early-qucgjs.flutterflow.app"
    : "https://app.byearly.com";
  const secret = await getGoogleSecret("/secrets/khipu-api/versions/latest");
  if (!secret) {
    console.error("Failed to retrieve Khipu API secret");
    throw new Error("Khipu API secret not found");
  }

  const config = {
    "x-api-key": secret,
    "Content-Type": "application/json",
  };

  const khipuPayment = createKhipuPaymentBody(
    order,
    expirationDate,
    orderId,
    projectId,
    returnUrl,
    isWeb
  );

  try {
    const response = await fetch("https://payment-api.khipu.com/v3/payments", {
      method: "POST",
      headers: config,
      body: JSON.stringify(khipuPayment),
    });

    const responseText = await response.text();
    console.log(`Raw response from Khipu API: ${responseText}`);

    if (!response.ok) {
      console.error(
        `Error response from Khipu API: ${response.status} ${response.statusText}`
      );
      console.error(`Response body: ${responseText}`);
      throw new Error(
        `Khipu API error: ${response.status} ${response.statusText}`
      );
    }

    try {
      const responseData = JSON.parse(responseText) as KhipuPaymentResponse;
      if (responseData.error_payment_post_payments) {
        return {
          payment_id: "",
          simplified_transfer_url: "",
        };
      }
      return responseData;
    } catch (parseError) {
      console.error("Error parsing Khipu API response:", parseError);
      console.error("Raw response:", responseText);
      throw new Error("Invalid JSON response from Khipu API");
    }
  } catch (error) {
    console.error("Error creating Khipu payment:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

type Data = {
  orderId: string;
  metadata: Record<string, string>;
  isWeb: boolean;
};

export const createKhipuPayment = (db: admin.firestore.Firestore) => {
  const { isDev, projectId } = getCurrentEnv();
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

        if (
          orderData.khipu &&
          orderData.khipu?.payment_url != "" &&
          orderData.khipu?.payment_token != ""
        ) {
          return orderData.khipu?.payment_url ?? "";
        }

        const khipuPayment = await createKhipuPaymentFunction(
          orderData,
          orderData.expirationDate,
          orderId,
          isDev,
          projectId,
          orderData.deviceType === "web"
        );

        try {
          await transaction.update(orderRef, {
            khipu: {
              payment_url: khipuPayment.simplified_transfer_url ?? "",
              payment_token: khipuPayment.payment_id,
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

        return khipuPayment.simplified_transfer_url ?? "";
      });
    }
  );
};
