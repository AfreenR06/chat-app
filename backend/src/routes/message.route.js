import express from "express";
import {
  getConversationsForSidebar,
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public testing route
router.post(
  "/send/:id",
  protectRoute,
  upload.single("media"),
  sendMessage
);

// Protected routes
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/conversations", protectRoute, getConversationsForSidebar);
router.get("/:id", protectRoute, getMessages);

export default router;