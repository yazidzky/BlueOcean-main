import Task from "../models/Task.model.js";
import User from "../models/User.model.js";

export const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);
    const weekStart = new Date();
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    const baseOr = [
      { owner: userId },
      { user: userId },
      { collaborators: { $elemMatch: { user: userId, status: "accepted" } } },
    ];

    const [tasksDueToday, tasksDoneToday, tasksPending, friendsCount, chatsCount, me] = await Promise.all([
      Task.countDocuments({ $or: baseOr, dueDate: { $gte: todayStart, $lt: tomorrowStart } }),
      Task.countDocuments({ $or: baseOr, dueDate: { $gte: todayStart, $lt: tomorrowStart }, completed: true }),
      Task.countDocuments({ $or: baseOr, completed: false }),
      User.countDocuments({ _id: userId, friends: { $exists: true, $type: "array" } }).then(async () => {
        const me = await User.findById(userId).select("friends");
        return me?.friends?.length || 0;
      }),
      import("../models/Chat.model.js").then(async (m) => {
        const Chat = m.default;
        return Chat.countDocuments({ participants: userId });
      }),
      User.findById(userId).select("streakDays points"),
    ]);

    const tasksThisWeek = await Task.countDocuments({ $or: baseOr, createdAt: { $gte: weekStart } });

    const completedPriorities = await Task.find({ $or: baseOr, completed: true }).select("priority").lean();
    const weights = { low: 10, medium: 20, high: 30 };
    const pointsComputed = completedPriorities.reduce((sum, t) => sum + (weights[t.priority] || 0), 0);

    res.json({
      tasksDueToday,
      tasksDoneToday,
      tasksCompleted: await Task.countDocuments({ $or: baseOr, completed: true }),
      tasksPending,
      tasksThisWeek,
      friendsCount,
      chatsCount,
      streakDays: me?.streakDays || 0,
      points: pointsComputed,
      progressPercent: tasksDueToday > 0 ? Math.round((tasksDoneToday / tasksDueToday) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
