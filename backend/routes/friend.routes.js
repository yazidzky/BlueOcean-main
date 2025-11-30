import express from "express";
import {
  getFriends,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "../controllers/friend.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getFriends);
router.post("/request", protect, sendFriendRequest);
router.get("/requests", protect, getFriendRequests);
router.put("/accept/:requestId", protect, acceptFriendRequest);
router.put("/reject/:requestId", protect, rejectFriendRequest);
router.delete("/:friendId", protect, removeFriend);

export default router;
