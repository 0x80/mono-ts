import express, { Router } from "express";
import { verifyApiKey } from "~/utils/verify-api-key.js";
import { addPost } from "./controllers/index.js";

const router: Router = express.Router();

router.all("*", verifyApiKey);

router.post("/add", addPost);
// router.post("/multiply", releaseAuditToClientPost);
// router.post("/init", releaseAuditToClientPost);

export default router;
