import * as functions from "firebase-functions";
import { getGoogleSecret } from "../../utils/getSecret";
import { getCurrentEnv } from "../../utils/getCurrentEnv";
import type admin from "firebase-admin";
import type { User } from "../../users/interfaces";

export const deleteWebPayTransaction = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    { region: "southamerica-east1" },
    async (request) => {
      const { isDev } = getCurrentEnv();

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

      const user = await db
        .collection("users")
        .doc(request.auth?.uid ?? "")
        .get();
      const userData = user.data() as User;

      await fetch(
        webPayUrl + "/rswebpaytransaction/api/oneclick/v1.2/inscriptions",
        {
          method: "DELETE",
          headers: config,
          body: JSON.stringify({
            username: userData.email,
            tbk_user: userData.transbank?.tbkUser,
          }),
        }
      );

      return;
    }
  );
};
