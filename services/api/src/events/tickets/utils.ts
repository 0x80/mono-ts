import * as functions from "firebase-functions";
import type admin from "firebase-admin";

import { sendNotification } from "../../notifications/send";

export const sendNotificationToUsers = async (
  db: admin.firestore.Firestore,
  userId: string,
  title: string,
  body: string,
  route: string,
  parameterData: { [key: string]: string }
) => {
  const fcmTokens = await db
    .collection("users")
    .doc(userId)
    .collection("fcm_tokens")
    .get();
  const tokens: string[] = [];
  fcmTokens.forEach((token) => {
    tokens.push(token.data().fcm_token);
  });

  try {
    await sendNotification(tokens, title, body, route, parameterData, db);
  } catch (error) {
    functions.logger.error("Error sending message:", error);
  }
};
