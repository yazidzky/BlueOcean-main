import express from "express";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  addCollaborator,
  removeCollaborator,
  acceptCollaborator,
  rejectCollaborator,
  updateCollaboratorRole,
} from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, getTasks).post(protect, createTask);

router
  .route("/:id")
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.patch("/:id/toggle", protect, toggleTask);
router.post("/:id/collaborators", protect, addCollaborator);
router.delete("/:id/collaborators/:userId", protect, removeCollaborator);
router.put("/:id/collaborators/:userId/accept", protect, acceptCollaborator);
router.put("/:id/collaborators/:userId/reject", protect, rejectCollaborator);
router.put("/:id/collaborators/:userId/role", protect, updateCollaboratorRole);

export default router;
