import express from "express";
import { chatWithAI } from "../controllers/chat.controller.js";
import { chatRateLimit } from "../middlewares/chatRateLimit.middleware.js";

const router = express.Router();

router.post("/", chatRateLimit, chatWithAI);

export default router;