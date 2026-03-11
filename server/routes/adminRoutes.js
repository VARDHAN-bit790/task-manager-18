const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Task = require("../models/Task");
const adminMiddleware = require("../middleware/adminMiddleware");

// ✅ All routes protected by adminMiddleware
router.use(adminMiddleware);

// ===============================
// GET /api/admin/stats
// Overall platform stats
// ===============================
router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeToday,
      totalTasks,
      completedTasks,
      bannedUsers,
    ] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      User.countDocuments({ isAdmin: false, createdAt: { $gte: startOfDay } }),
      User.countDocuments({ isAdmin: false, createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ isAdmin: false, createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ isAdmin: false, lastLoginAt: { $gte: startOfDay } }),
      Task.countDocuments(),
      Task.countDocuments({ status: "completed" }),
      User.countDocuments({ isBanned: true }),
    ]);

    // Signups per day for the last 7 days (for chart)
    const signupTrend = await User.aggregate([
      { $match: { isAdmin: false, createdAt: { $gte: startOfWeek } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeToday,
      totalTasks,
      completedTasks,
      bannedUsers,
      completionRate: totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0,
      signupTrend,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// GET /api/admin/users
// All users with their task stats
// ===============================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select("-password")
      .sort({ createdAt: -1 });

    // Get task stats for each user
    const userIds = users.map((u) => u._id);

    const taskStats = await Task.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: "$userId",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          highPriorityTasks: {
            $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] },
          },
        },
      },
    ]);

    // Map stats to users
    const statsMap = {};
    taskStats.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const usersWithStats = users.map((u) => {
      const stats = statsMap[u._id.toString()] || {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        highPriorityTasks: 0,
      };
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        isAdmin: u.isAdmin,
        isBanned: u.isBanned,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        ...stats,
        completionRate: stats.totalTasks > 0
          ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
          : 0,
      };
    });

    res.json(usersWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// GET /api/admin/active-users
// Users logged in today
// ===============================
router.get("/active-users", async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const activeUsers = await User.find({
      isAdmin: false,
      lastLoginAt: { $gte: startOfDay },
    })
      .select("-password")
      .sort({ lastLoginAt: -1 });

    // attach task count to each
    const userIds = activeUsers.map((u) => u._id);
    const taskCounts = await require("../models/Task").aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status","completed"] }, 1, 0] } }
      }},
    ]);
    const countMap = {};
    taskCounts.forEach((t) => { countMap[t._id.toString()] = t; });

    const result = activeUsers.map((u) => ({
      _id:         u._id,
      name:        u.name,
      email:       u.email,
      isBanned:    u.isBanned,
      lastLoginAt: u.lastLoginAt,
      createdAt:   u.createdAt,
      totalTasks:  countMap[u._id.toString()]?.total     || 0,
      completedTasks: countMap[u._id.toString()]?.completed || 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// GET /api/admin/users/:id
// Single user profile
// ===============================
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// GET /api/admin/users/:id/tasks
// All tasks for a specific user
// ===============================
router.get("/users/:id/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// PATCH /api/admin/users/:id/ban
// Toggle ban status
// ===============================
router.patch("/users/:id/ban", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isAdmin) return res.status(403).json({ message: "Cannot ban an admin" });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      message: user.isBanned ? "User banned successfully" : "User unbanned successfully",
      isBanned: user.isBanned,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// DELETE /api/admin/users/:id
// Delete user + all their tasks
// ===============================
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isAdmin) return res.status(403).json({ message: "Cannot delete an admin" });

    // Delete all their tasks too
    await Task.deleteMany({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User and all their tasks deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;