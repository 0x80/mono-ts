import * as functions from "firebase-functions";
import * as https from "https";
import cors from "cors";

const corsMiddleware = cors({ origin: true });
const corsProxyRuntimeOptions = {
  minInstances: 1,
  timeoutSeconds: 15,
  region: "southamerica-east1",
};

export const corsProxy = functions.https.onRequest(
  corsProxyRuntimeOptions,
  (req, res) => handleRequest(req, res)
);

async function handleRequest(req: functions.https.Request, res: any) {
  corsMiddleware(req, res, () => {
    console.log("Body:", req.body);
    const url = req.query.url || req.body.url;
    if (!url) {
      res.status(403).send("URL is empty.");
      return;
    }
    https
      .get(url as string, (resp) => {
        res.setHeader(
          "content-type",
          resp.headers["content-type"] || "text/plain"
        );
        resp.pipe(res);
      })
      .on("error", (_) => {
        res.status(500).send("Error fetching the URL.");
      });
  });
}
