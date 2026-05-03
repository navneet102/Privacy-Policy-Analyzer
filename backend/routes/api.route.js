import express from "express";

const router = express.Router();

import {extract_policy, analyze} from "../controllers/api.controller.js";

router.post("/extract-policy", extract_policy);
router.post("/analyze", analyze);

export default router;