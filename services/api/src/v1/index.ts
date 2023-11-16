import express, { Router } from "express";
import { verifyApiKey } from "~/utils/verify-api-key.js";
import { add, multiply, reset } from "./controllers.js";

const router: Router = express.Router();

router.all("*", verifyApiKey);

router.post("/add", add);
router.post("/multiply", multiply);
router.get("/reset", reset);

export default router;
