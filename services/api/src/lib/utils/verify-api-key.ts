import { defineSecret } from "firebase-functions/params";
import type { MiddlewareHandler } from "hono";

/** See https://firebase.google.com/docs/functions/config-env?gen=2nd */
const demoApiKey = defineSecret("DEMO_API_KEY");

const API_KEY_HEADER_NAME = "X-Demo-API-Key";

export const verifyApiKey: MiddlewareHandler = async (c, next) => {
  const apiKey = c.req.header(API_KEY_HEADER_NAME);

  if (!apiKey) {
    return new Response(
      `An API key is required in header ${API_KEY_HEADER_NAME}`,
      {
        status: 403,
      }
    );
  }

  if (apiKey !== demoApiKey.value()) {
    console.error(new Error(`Demo API called with invalid key: ${apiKey}`));
    return new Response("Unauthorized", { status: 403 });
  }

  await next();
};
