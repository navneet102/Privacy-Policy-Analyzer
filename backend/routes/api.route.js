import express from "express";

const router = express.Router();

import {extract_policy, analyze, chatWithPolicy} from "../controllers/api.controller.js";

router.post("/extract-policy", extract_policy);
router.post("/analyze", analyze);
router.post("/chat-policy", chatWithPolicy);

export default router;