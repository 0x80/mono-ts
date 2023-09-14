/**
 * An API for external use.
 *
 * We use Express here to expose different API endpoints using a single cloud
 * function, which prevents us from having to create a new cloud function for
 * every endpoint and allows for easy re-use of middleware.
 *
 * 2nd gen functions are based on Cloud-Run and can handle up to 1000 requests each.
 */
import { getRequiredEnvValue } from "@mono/common";
import bodyParser from "body-parser";
import compression from "compression";
import Cors from "cors";
import express from "express";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";
import NoCache from "nocache";
import { region } from "~/config.js";
import v1 from "./v1/index.js";

const demoApiKey = defineSecret("DEMO_API_KEY");

export const cors = Cors();
export const noCache = NoCache();

const app = express();

// Allow cross-origin requests
app.use(cors);
app.use(noCache);
app.use(compression());
app.use(bodyParser.json());
app.get("/", (_, res) =>
  res.send(
    `API is up and running. DEMO_ENV_VAR: ${getRequiredEnvValue(
      "DEMO_ENV_VAR"
    )}`
  )
);

app.use("/v1", v1);

/**
 * Exposed endpoints
 *
 * Emulator: http://localhost:5001/your-project-name/europe-west3/api/v1
 * Live: https://europe-west3-your-project-name.cloudfunctions.net/api/v1
 */

/**
 * Exports the function as "api". This will result in a url prefix /api,
 */
export const api = onRequest(
  {
    region,
    memory: "4GiB",
    /**
     * Gen2 functions can handle 1000 requests each, so we only need 1 instance
     * probably.
     */
    minInstances: 0,
    secrets: [demoApiKey],
  },
  app
);
