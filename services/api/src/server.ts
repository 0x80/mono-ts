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
  res.send(`API is up and running. DEMO_ENV_VAR: ${process.env.DEMO_ENV_VAR}.`)
);

app.use("/v1", v1);

/**
 * Exposed endpoints
 *
 * Emulator: http://localhost:5002/your-project-name/europe-west3/api/v1
 * Live: https://europe-west3-your-project-name.cloudfunctions.net/api/v1
 */

/**
 * Exports the function as "api". This will result in a url prefix /api,
 */
export const api = onRequest(
  {
    region,
    secrets: [demoApiKey],
  },
  app
);
