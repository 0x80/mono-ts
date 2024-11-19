import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import { getCurrentEnv } from "../../utils/getCurrentEnv";
import { getGoogleSecret } from "../../utils/getSecret";

export const confirmWebPayNewCard = (db: admin.firestore.Firestore) => {
  const { isDev } = getCurrentEnv();
  return functions.https.onRequest(
    {
      region: "southamerica-east1",
      minInstances: isDev ? 0 : 1,
      maxInstances: 100,
    },
    async (req, res) => {
      const { TBK_TOKEN, id } = req.query;
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

      const response = await fetch(
        `${webPayUrl}/rswebpaytransaction/api/oneclick/v1.2/inscriptions/${TBK_TOKEN}`,
        {
          method: "PUT",
          headers: config,
        }
      );
      const responseData = (await response.json()) as {
        response_code: number;
        tbk_user?: string;
        card_number?: string;
        card_type?: string;
      };
      functions.logger.info(responseData);

      if (responseData.response_code !== 0) {
        const errorImage = isDev
          ? "https://firebasestorage.googleapis.com/v0/b/early-dev-73f4d.appspot.com/o/Error.jpg?alt=media&token=898b35f1-98c0-47f1-8bc2-c9d858574f6a"
          : "https://firebasestorage.googleapis.com/v0/b/early-prod-dddac.appspot.com/o/Error.jpg?alt=media&token=19b9cd61-8cb5-4e2d-9a37-24bcbaa627c2";
        res.status(400).send(`<!DOCTYPE html>
          <html>
          <head>
          <title>Early Experiences</title>
          </head>
          <body style="display:flex;align-items:centes;justify-content:center">
          
          <img src="${errorImage}" style="max-width: 600px; width:100%;height: auto;"/>
          
          
          </body>
          </html>`);
        return;
      }
      const { tbk_user, card_number, card_type } = responseData;
      const parsedId = id as string;
      await db
        .collection("users")
        .doc(parsedId)
        .update({
          transbank: {
            tbkUser: tbk_user as string,
            cardNumber: (card_number as string).slice(-4),
            cardType: card_type as string,
          },
        });

      const successImage = isDev
        ? "https://firebasestorage.googleapis.com/v0/b/early-dev-73f4d.appspot.com/o/Untitled%20Project%20(2).jpg?alt=media&token=98678c9f-0cf1-44c3-b4c4-3451831ba662"
        : "https://firebasestorage.googleapis.com/v0/b/early-prod-dddac.appspot.com/o/Untitled%20Project%20(2).jpg?alt=media&token=521390c2-4bba-46de-b7c9-dde156326bbd";

      res.status(200).send(`<!DOCTYPE html>
<html>
<head>
<title>Early Experiences</title>
</head>
<body style="display:flex;align-items:centes;justify-content:center">

<img src="${successImage}" style="max-width: 600px; width:100%;height: auto;"/>


</body>
</html>`);
      return;
    }
  );
};
