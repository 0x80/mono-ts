import { Hono } from "hono";
import { verifyApiKey } from "~/lib/utils";
import { add, multiply, reset } from "./handlers";

const router = new Hono();

router
  .use("*", verifyApiKey)
  .post("/add", add)
  .post("/multiply", multiply)
  .get("/reset", reset);

export default router;
