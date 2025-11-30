import express from "express";
import {
  getChats,
  getOrCreateChat,
  getMessages,
  sendMessage,
  markAsRead,
} from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getChats);
router.post("/", protect, getOrCreateChat);
router.get("/:chatId/messages", protect, getMessages);
router.post("/:chatId/messages", protect, sendMessage);
router.put("/:chatId/read", protect, markAsRead);

export default router;
