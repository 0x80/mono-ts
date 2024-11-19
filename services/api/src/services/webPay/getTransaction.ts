import * as functions from "firebase-functions";
import { getGoogleSecret } from "../../utils/getSecret";
import { getCurrentEnv } from "../../utils/getCurrentEnv";

export const getWebPayTransaction = () => {
  const { isDev } = getCurrentEnv();
  return functions.https.onCall(
    {
      region: "southamerica-east1",
      minInstances: isDev ? 0 : 1,
      maxInstances: 100,
    },
    async (request) => {
      const { projectId, isDev } = getCurrentEnv();

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
        webPayUrl + "/rswebpaytransaction/api/oneclick/v1.2/inscriptions",
        {
          method: "POST",
          headers: config,
          body: JSON.stringify({
            username: request.auth?.token.email,
            email: request.auth?.token.email,
            response_url:
              "https://southamerica-east1-" +
              projectId +
              ".cloudfunctions.net/confirmWebPayNewCard?id=" +
              request.auth?.uid,
          }),
        }
      );
      const responseData = (await response.json()) as {
        token: string;
        url_webpay: string;
      };
      functions.logger.info(
        responseData.url_webpay + "?TBK_TOKEN=" + responseData.token
      );
      return responseData.url_webpay + "?TBK_TOKEN=" + responseData.token;
    }
  );
};
