import type { NextFunction, Request, Response } from "express";
import { defineSecret } from "firebase-functions/params";

/** See https://firebase.google.com/docs/functions/config-env?gen=2nd */
const demoApiKey = defineSecret("DEMO_API_KEY");

const API_KEY_HEADER_NAME = "X-Demo-API-Key";

export function verifyApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.header(API_KEY_HEADER_NAME);

  if (!apiKey) {
    res
      .status(403)
      .send(`An API key is required in header ${API_KEY_HEADER_NAME}`);
  } else {
    if (apiKey !== demoApiKey.value()) {
      console.error(new Error(`Demo API called with invalid key: ${apiKey}`));

      res.status(403).send("Unauthorized");
    } else {
      next();
    }
  }
}
