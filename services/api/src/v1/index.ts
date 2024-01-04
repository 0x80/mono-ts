import type { Router } from "express";
import express from "express";
import { verifyApiKey } from "~/lib/utils/index.js";
import { add, multiply, reset } from "./handlers.js";

const router: Router = express.Router();

router.all("*", verifyApiKey);

/* eslint @typescript-eslint/no-misused-promises: 0 */
router.post("/add", add);
router.post("/multiply", multiply);
router.get("/reset", reset);

export default router;
