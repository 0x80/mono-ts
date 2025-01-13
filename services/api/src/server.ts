import { getRequestListener } from "@hono/node-server";
import { onRequest } from "firebase-functions/https";
import { defineSecret } from "firebase-functions/params";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { region } from "~/config";
import v1 from "./v1";

const demoApiKey = defineSecret("DEMO_API_KEY");

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", compress());

// Routes
app.get("/", (c) =>
  c.text(`API is up and running. DEMO_ENV_VAR: ${process.env.DEMO_ENV_VAR}.`)
);

// Mount v1 routes
app.route("/v1", v1);

/** Exports the function as "api". This will result in a url prefix /api, */
export const api = onRequest(
  {
    region,
    secrets: [demoApiKey],
  },
  getRequestListener(app.fetch)
);
