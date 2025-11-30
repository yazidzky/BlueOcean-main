import Task from "../models/Task.model.js";
import User from "../models/User.model.js";

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { filter } = req.query;
    let query = { user: req.user._id };

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

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Make sure user owns task
    if (task.user.toString() !== req.user._id.toString()) {
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
      title,
      description,
      priority,
      dueDate,
    });

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
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Make sure user owns task
    if (task.user.toString() !== req.user._id.toString()) {
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

    res.json(updatedTask);
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

    // Make sure user owns task
    if (task.user.toString() !== req.user._id.toString()) {
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
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Make sure user owns task
    if (task.user.toString() !== req.user._id.toString()) {
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

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
