import type { Router } from "express";
import express from "express";
import { verifyApiKey } from "~/lib/utils";
import { add, multiply, reset } from "./handlers";

const router: Router = express.Router();

router.use(verifyApiKey);

router.post("/add", add);
router.post("/multiply", multiply);
router.get("/reset", reset);

export default router;
