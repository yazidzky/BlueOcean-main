import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  updateUserStatus,
  searchUsers,
  getUserPublicProfile,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/status", protect, updateUserStatus);
router.get("/search", protect, searchUsers);
router.get("/:id", protect, getUserPublicProfile);

export default router;
