const express = require("express");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

/* =====================================================
   CREATE TASK
===================================================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      category,
    } = req.body;

    const newTask = new Task({
      title,
      description,
      priority,
      dueDate,
      category: category || "personal",
      userId: req.user.userId,
    });

    await newTask.save();

    const io = req.app.get("io");
    io.to(req.user.userId).emit("tasksUpdated");

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   GET ALL TASKS
===================================================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   GET SINGLE TASK
===================================================== */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/* =====================================================
   DELETE ALL SUBTASKS
===================================================== */
router.delete(
  "/:taskId/subtasks/delete-all",
  authMiddleware,
  async (req, res) => {
    try {
      const task = await Task.findOne({
        _id: req.params.taskId,
        userId: req.user.userId,
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // ⭐ clear all subtasks
      task.subtasks = [];
      await task.save();

      const io = req.app.get("io");
      io.to(req.user.userId).emit("tasksUpdated");

      res.json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
/* =====================================================
   DELETE ALL TASKS
===================================================== */
router.delete(
  "/delete-all",
  authMiddleware,
  async (req, res) => {
    try {
      await Task.deleteMany({
        userId: req.user.userId,
      });

      const io = req.app.get("io");
      io.to(req.user.userId).emit("tasksUpdated");

      res.json({ message: "All tasks deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
/* =====================================================
   DELETE TASK
===================================================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    const io = req.app.get("io");
    io.to(req.user.userId).emit("tasksUpdated");

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   UPDATE TASK
===================================================== */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const allowedUpdates = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
      "category",
      "progress",
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    // ⭐ detect completion transition
let statusUpdate = req.body.status;

if (statusUpdate !== undefined) {
  if (statusUpdate === "completed") {
    updates.completedAt = new Date();
  } else if (statusUpdate === "pending") {
    updates.completedAt = null;
  }
}

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updates,
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const io = req.app.get("io");
    io.to(req.user.userId).emit("tasksUpdated");

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   ADD SUBTASK
===================================================== */
router.post("/:taskId/subtasks", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;

    const task = await Task.findOne({
      _id: req.params.taskId,
      userId: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.subtasks.push({ title });
    await task.save();

    const io = req.app.get("io");
    io.to(req.user.userId).emit("tasksUpdated");

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   TOGGLE SUBTASK
===================================================== */
router.patch(
  "/:taskId/subtasks/:subtaskId",
  authMiddleware,
  async (req, res) => {
    try {
      const task = await Task.findOne({
        _id: req.params.taskId,
        userId: req.user.userId,
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const subtask = task.subtasks.id(req.params.subtaskId);

      if (!subtask) {
        return res.status(404).json({ message: "Subtask not found" });
      }

      subtask.completed = !subtask.completed;
      await task.save();

      const io = req.app.get("io");
      io.to(req.user.userId).emit("tasksUpdated");

      res.json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/* =====================================================
   DELETE SUBTASK
===================================================== */
router.delete(
  "/:taskId/subtasks/:subtaskId",
  authMiddleware,
  async (req, res) => {
    try {
      const task = await Task.findOne({
        _id: req.params.taskId,
        userId: req.user.userId,
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      task.subtasks = task.subtasks.filter(
        (s) => s._id.toString() !== req.params.subtaskId
      );

      await task.save();

      const io = req.app.get("io");
      io.to(req.user.userId).emit("tasksUpdated");

      res.json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/* =====================================================
   🤖 AUTO GENERATE SUBTASKS
===================================================== */
router.post("/:taskId/auto-subtasks", authMiddleware, async (req, res) => {
  try {
    console.log("🔥 AUTO SUBTASK ROUTE HIT");
    console.log(
      "KEY CHECK:",
      process.env.OPENROUTER_API_KEY ? "FOUND" : "MISSING"
    );

    const task = await Task.findOne({
      _id: req.params.taskId,
      userId: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

const taskTitle = task.title;

let suggestions = [];

try {
  // ==============================
  // 🤖 TRY OPENROUTER LLM
  // ==============================
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "AI Task Manager App",
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a productivity assistant. Generate 5 short actionable subtasks.",
        },
        {
          role: "user",
          content: `Generate subtasks for this task: ${taskTitle}`,
        },
      ],
      max_tokens: 150,
    }),
  });

  const data = await response.json();
console.log("🧠 OPENROUTER RAW RESPONSE:", JSON.stringify(data, null, 2));
const content = data?.choices?.[0]?.message?.content;

  if (content) {
    suggestions = content
      .split("\n")
      .map((s) => s.replace(/^[-•\d.\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 5);

    console.log("🧠 AI subtasks generated");
  }

} catch (err) {
console.log("❌ AI ERROR:", err.message);
console.log("⚠️ AI failed, using fallback");
}

// ==============================
// 🛟 FALLBACK (YOUR OLD LOGIC)
// ==============================
if (suggestions.length === 0) {
  const title = task.title.toLowerCase();

  if (title.includes("mern") || title.includes("project")) {
    suggestions = [
      "Setup backend",
      "Create database schema",
      "Build API routes",
      "Design frontend UI",
      "Testing and deployment",
    ];
  } else if (title.includes("exam") || title.includes("study")) {
    suggestions = [
      "Review syllabus",
      "Prepare notes",
      "Practice problems",
      "Revise weak topics",
      "Mock test",
    ];
  } else if (title.includes("gym") || title.includes("workout")) {
    suggestions = [
      "Warm up",
      "Main workout",
      "Cardio session",
      "Stretching",
      "Track progress",
    ];
  } else {
    suggestions = [
      "Plan task",
      "Start work",
      "Make progress",
      "Review work",
      "Finalize",
    ];
  }

  console.log("🛟 Fallback subtasks used");
}
    const existingTitles = task.subtasks.map((s) =>
      s.title.toLowerCase()
    );

    const newSubs = suggestions
      .filter((s) => !existingTitles.includes(s.toLowerCase()))
      .map((title) => ({ title }));

    task.subtasks.push(...newSubs);
    await task.save();

    const io = req.app.get("io");
    io.to(req.user.userId).emit("tasksUpdated");

    res.json(task);
  } catch (error) {
    console.error("AUTO SUBTASK ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});
/* =====================================================
   🤖 AI PRIORITY PREDICTOR
===================================================== */
router.post("/ai-priority", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AI Task Manager",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
  content: `
You are a strict task priority classifier.

Your job is to output ONLY one label:
low, medium, or high.

Decision rules:

HIGH priority if:
- task mentions today or tomorrow
- task contains urgent, asap, immediately
- task contains interview, exam, deadline, important meeting
- task is time-sensitive or critical

MEDIUM priority:
- normal planned work without immediate urgency

LOW priority:
- optional, flexible, or leisure tasks

IMPORTANT:
If the task mentions "tomorrow" OR "today", you MUST return HIGH.

Return ONLY one word in lowercase.
No explanation.
`,
            },
            {
              role: "user",
              content: `Task: ${title}`,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const aiText =
      data?.choices?.[0]?.message?.content?.toLowerCase() || "medium";

    // sanitize
    let priority = "medium";
    if (aiText.includes("high")) priority = "high";
    else if (aiText.includes("low")) priority = "low";

    res.json({ priority });
  } catch (err) {
    console.error("AI PRIORITY ERROR:", err);
    res.json({ priority: "medium" }); // safe fallback
  }
});

module.exports = router;