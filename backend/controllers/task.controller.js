import Task from "../models/Task.model.js";
import User from "../models/User.model.js";
import mongoose from "mongoose";

const toUserId = (val) => {
  if (!val) return "";
  if (typeof val === "object" && val._id) return val._id.toString();
  try {
    return val.toString();
  } catch {
    return "";
  }
};
const normalizeCollaborators = async (task) => {
  let changed = false;
  const list = task.collaborators || [];
  const normalized = list.map((c) => {
    if (c && typeof c === "object" && c.user) return c;
    const id = (typeof c === "string" || c instanceof mongoose.Types.ObjectId) ? c : undefined;
    if (!id) return c;
    changed = true;
    return { user: new mongoose.Types.ObjectId(id), status: "accepted", role: "editor" };
  });
  if (changed) {
    task.collaborators = normalized;
    await task.save();
  }
  return task;
};
// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { filter } = req.query;
    let base = {};
    if (filter === "shared") {
      base = { collaborators: { $elemMatch: { user: req.user._id } } };
    } else {
      base = {
        $or: [
          { owner: req.user._id },
          { user: req.user._id },
          { collaborators: { $elemMatch: { user: req.user._id, status: "accepted" } } },
        ],
      };
    }
    let query = { ...base };

    if (filter === "completed") {
      query.completed = true;
    } else if (filter === "today") {
      query.completed = false;
    } else if (filter === "overdue") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.completed = false;
      query.dueDate = { $lt: today };
    }

    const raw = await Task.find(query).sort({ createdAt: -1 });
    const out = [];
    for (const t of raw) {
      await normalizeCollaborators(t);
      const populated = await Task.findById(t._id)
        .populate("owner", "name email avatar")
        .populate("collaborators.user", "name email avatar");
      out.push(populated);
    }
    res.json(out);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await normalizeCollaborators(task);
    task = await Task.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("collaborators.user", "name email avatar");

    const isOwner = (task.owner || task.user).toString() === req.user._id.toString();
    const isCollaboratorAny = (task.collaborators || []).some(
      (c) => (c.user || c).toString() === req.user._id.toString()
    );
    if (!isOwner && !isCollaboratorAny) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    const task = await Task.create({
      user: req.user._id,
      owner: req.user._id,
      title,
      description,
      priority,
      dueDate,
    });

    try {
      const io = req.app.get("io");
      io.to(req.user._id.toString()).emit("task_created", { task });
    } catch {}

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await normalizeCollaborators(task);

    const isOwner = (task.owner || task.user).toString() === req.user._id.toString();
    const isCollaboratorEditor = (task.collaborators || []).some(
      (c) => (c.user || c).toString() === req.user._id.toString() && c.status === "accepted" && (c.role === "editor" || c.role === "owner")
    );
    if (!isOwner && !isCollaboratorEditor) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const prevPriority = task.priority;
    const wasCompleted = task.completed;

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (wasCompleted && req.body.priority && req.body.priority !== prevPriority) {
      const weights = { low: 10, medium: 20, high: 30 };
      const diff = (weights[req.body.priority] || 0) - (weights[prevPriority] || 0);
      if (diff !== 0) {
        const u = await User.findById(req.user._id).select("points");
        if (u) {
          u.points = Math.max(0, (u.points || 0) + diff);
          await u.save();
        }
      }
    }

    const populatedTask = await Task.findById(updatedTask._id)
      .populate("owner", "name email avatar")
      .populate("collaborators.user", "name email avatar");

    try {
      const io = req.app.get("io");
      const recipients = [
        toUserId(populatedTask.owner || populatedTask.user),
        ...((populatedTask.collaborators || []).map((c) => toUserId(c.user))),
      ];
      const uniqueRecipients = Array.from(new Set(recipients));
      uniqueRecipients.forEach((uid) => io.to(uid).emit("task_updated", { task: populatedTask }));
    } catch {}

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isOwner = (task.owner || task.user).toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const wasCompleted = task.completed;
    const priority = task.priority;
    await task.deleteOne();

    if (wasCompleted) {
      const weights = { low: 10, medium: 20, high: 30 };
      const delta = weights[priority] || 0;
      const u = await User.findById(req.user._id).select("points");
      if (u) {
        u.points = Math.max(0, (u.points || 0) - delta);
        await u.save();
      }
    }

    try {
      const io = req.app.get("io");
      const recipients = [
        toUserId(task.owner || task.user),
        ...((task.collaborators || []).map((c) => toUserId(c.user || c))),
      ];
      const uniqueRecipients = Array.from(new Set(recipients));
      uniqueRecipients.forEach((uid) => io.to(uid).emit("task_deleted", { taskId: task._id.toString() }));
    } catch {}

    res.json({ message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
export const toggleTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await normalizeCollaborators(task);

    const isOwner = (task.owner || task.user).toString() === req.user._id.toString();
    const isCollaboratorEditor = (task.collaborators || []).some(
      (c) => (c.user || c).toString() === req.user._id.toString() && c.status === "accepted" && (c.role === "editor" || c.role === "owner")
    );
    if (!isOwner && !isCollaboratorEditor) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const wasCompleted = task.completed;
    task.completed = !task.completed;
    await task.save();

    const weights = { low: 10, medium: 20, high: 30 };
    const delta = weights[task.priority] || 0;
    const u = await User.findById(req.user._id).select("points");
    if (u) {
      if (!wasCompleted && task.completed) {
        u.points = (u.points || 0) + delta;
      } else if (wasCompleted && !task.completed) {
        u.points = Math.max(0, (u.points || 0) - delta);
      }
      await u.save();
    }

    const populated = await Task.findById(task._id)
      .populate("owner", "name email avatar")
      .populate("collaborators.user", "name email avatar");

    try {
      const io = req.app.get("io");
      const recipients = [
        toUserId(populated.owner || populated.user),
        ...((populated.collaborators || []).map((c) => toUserId(c.user))),
      ];
      const uniqueRecipients = Array.from(new Set(recipients));
      uniqueRecipients.forEach((uid) => io.to(uid).emit("task_updated", { task: populated }));
    } catch {}

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add collaborator to task
// @route   POST /api/tasks/:id/collaborators
// @access  Private
export const addCollaborator = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await normalizeCollaborators(task);

    const isOwner = (task.owner || task.user).toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(401).json({ message: "Only owner can add collaborators" });
    }

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const target = await User.findById(userId).select("_id");
    if (!target) {
      return res.status(404).json({ message: "User to add not found" });
    }

    // Avoid duplicates & self-add
    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Owner is already a collaborator" });
    }

    const existing = (task.collaborators || []).find(
      (c) => c.user.toString() === userId.toString()
    );
    if (existing) {
      existing.status = "pending";
      existing.invitedAt = new Date();
      await task.save();
    } else {
      task.collaborators.push({ user: new mongoose.Types.ObjectId(userId), status: "pending", role: "viewer", invitedAt: new Date() });
      await task.save();
    }
    const updated = await Task.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("collaborators.user", "name email avatar");

    // Emit event to new collaborator and owner
    try {
      const io = req.app.get("io");
      const recipients = [
        toUserId(updated.owner || updated.user),
        ...((updated.collaborators || []).map((c) => toUserId(c.user))),
      ];
      const uniqueRecipients = Array.from(new Set(recipients));
      uniqueRecipients.forEach((uid) => io.to(uid).emit("task_shared", { task: updated }));
    } catch {}

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove collaborator from task
// @route   DELETE /api/tasks/:id/collaborators/:userId
// @access  Private
export const removeCollaborator = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await normalizeCollaborators(task);

    const isOwner = (task.owner || task.user).toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(401).json({ message: "Only owner can remove collaborators" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    task.collaborators = (task.collaborators || []).filter(
      (c) => c.user.toString() !== userId.toString()
    );
    await task.save();
    const updated = await Task.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("collaborators.user", "name email avatar");

    // Emit event to removed collaborator and owner
    try {
      const io = req.app.get("io");
      const recipients = [
        toUserId(updated.owner || updated.user),
        ...((updated.collaborators || []).map((c) => toUserId(c.user))),
      ];
      const uniqueRecipients = Array.from(new Set(recipients));
      uniqueRecipients.forEach((uid) => io.to(uid).emit("task_unshared", { taskId: updated._id.toString(), userId }));
    } catch {}

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept collaboration invite
// @route   PUT /api/tasks/:id/collaborators/:userId/accept
// @access  Private
export const acceptCollaborator = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (req.user._id.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    await normalizeCollaborators(task);
    const collab = (task.collaborators || []).find((c) => (c.user || c).toString() === userId.toString());
    if (!collab) {
      return res.status(404).json({ message: "Invite not found" });
    }
    collab.status = "accepted";
    collab.respondedAt = new Date();
    await task.save();
    const updated = await Task.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("collaborators.user", "name email avatar");
    try {
      const io = req.app.get("io");
      const recipients = [
        toUserId(updated.owner || updated.user),
        userId.toString(),
      ];
      const uniqueRecipients = Array.from(new Set(recipients));
      uniqueRecipients.forEach((uid) => io.to(uid).emit("task_shared_accepted", { task: updated, userId }));
    } catch {}
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject collaboration invite
// @route   PUT /api/tasks/:id/collaborators/:userId/reject
// @access  Private
export const rejectCollaborator = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (req.user._id.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    await normalizeCollaborators(task);
    const collab = (task.collaborators || []).find((c) => (c.user || c).toString() === userId.toString());
    if (!collab) {
      return res.status(404).json({ message: "Invite not found" });
    }
    collab.status = "rejected";
    collab.respondedAt = new Date();
    await task.save();
    const updated = await Task.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("collaborators.user", "name email avatar");
    try {
      const io = req.app.get("io");
      const recipients = [
        toUserId(updated.owner || updated.user),
        userId.toString(),
      ];
      const uniqueRecipients = Array.from(new Set(recipients));
      uniqueRecipients.forEach((uid) => io.to(uid).emit("task_shared_rejected", { task: updated, userId }));
    } catch {}
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update collaborator role
// @route   PUT /api/tasks/:id/collaborators/:userId/role
// @access  Private (owner)
export const updateCollaboratorRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }
    if (!['owner','editor','viewer'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    const isOwner = (task.owner || task.user).toString() === req.user._id.toString();
    if (!isOwner) return res.status(401).json({ message: "Only owner can update roles" });
    const collab = (task.collaborators || []).find((c) => c.user.toString() === userId.toString());
    if (!collab) return res.status(404).json({ message: "Collaborator not found" });
    if (role === 'owner') {
      const prevOwnerId = (task.owner || task.user).toString();
      task.owner = new mongoose.Types.ObjectId(userId);
      collab.role = 'owner';
      collab.status = 'accepted';
      // Ensure previous owner remains collaborator (accepted editor)
      const existingPrev = (task.collaborators || []).find((c) => c.user.toString() === prevOwnerId);
      if (existingPrev) {
        existingPrev.status = existingPrev.status || 'accepted';
        existingPrev.role = 'editor';
      } else {
        task.collaborators.push({ user: new mongoose.Types.ObjectId(prevOwnerId), status: 'accepted', role: 'editor' });
      }
    } else {
      collab.role = role;
    }
    await task.save();
    const updated = await Task.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("collaborators.user", "name email avatar");
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
