import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getStats } from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/", protect, getStats);

export default router;
