const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  },
  completedAt: {
  type: Date,
  default: null
},
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low"
  },
  category: {
    type: String,
    enum: ["work", "personal", "study", "health"],
    default: "personal"
  },
  dueDate: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  subtasks: {
    type: [
      {
        title: { type: String, required: true, trim: true },
        completed: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

// 🚀 PERFORMANCE INDEXES
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

// 🔍 text search for future AI search
taskSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Task", taskSchema);