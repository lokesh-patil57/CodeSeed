import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createChat,
  getUserChats,
  getChat,
  sendMessage,
  updateChat,
  deleteChat,
  generateCode,
} from "../controllers/chatController.js";

const router = express.Router();

// All routes require authentication
router.use(userAuth);

// Create a new chat
router.post("/", createChat);

// Get all chats for the authenticated user
router.get("/", getUserChats);

// Generate code from description
router.post("/generate-code", generateCode);

// Get a specific chat
router.get("/:chatId", getChat);

// Send a message in a chat
router.post("/:chatId/message", sendMessage);

// Update a chat (title, language, etc.)
router.patch("/:chatId", updateChat);

// Delete a chat
router.delete("/:chatId", deleteChat);

export default router;

