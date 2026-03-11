import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaRobot, FaPlus, FaTrash, FaCheck,
  FaCalendarAlt, FaTag, FaFire, FaClock
} from "react-icons/fa";

const API_URL = "https://task-manager-18.onrender.com";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  .td-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f3f0ff 0%, #ede8ff 50%, #e0d9ff 100%);
    padding: 32px 20px;
    position: relative;
    overflow: hidden;
  }
  .td-page::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, #7c3aed15, transparent 70%);
    top: -150px; right: -150px;
    border-radius: 50%;
  }
  .td-page::after {
    content: '';
    position: absolute;
    width: 350px; height: 350px;
    background: radial-gradient(circle, #7c3aed10, transparent 70%);
    bottom: -100px; left: -100px;
    border-radius: 50%;
  }

  .td-inner {
    max-width: 720px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* Topbar */
  .td-topbar {
    display: flex; align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .back-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 16px; border-radius: 10px;
    border: 1px solid #ede8ff; background: #ffffff;
    color: #6b5ea8; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.18s;
    font-family: 'DM Sans', sans-serif;
  }
  .back-btn:hover { border-color: #7c3aed; color: #7c3aed; }

  .brand {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 800; color: #1a1033;
  }
  .brand span { color: #7c3aed; }

  /* Main card */
  .td-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 32px;
    border: 1px solid #ede8ff;
    box-shadow: 0 10px 40px rgba(124,58,237,0.08);
    margin-bottom: 20px;
  }

  /* Badge row */
  .badge-row {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .badge {
    padding: 4px 12px; border-radius: 999px;
    font-size: 12px; font-weight: 700;
    text-transform: capitalize;
  }
  .badge.high { background: #fee2e2; color: #ef4444; }
  .badge.medium { background: #fef3c7; color: #d97706; }
  .badge.low { background: #dcfce7; color: #16a34a; }
  .badge.completed { background: #dcfce7; color: #16a34a; }
  .badge.pending { background: #ede8ff; color: #7c3aed; }

  /* Task title */
  .td-title {
    font-family: 'Syne', sans-serif;
    font-size: 24px; font-weight: 800;
    color: #1a1033; letter-spacing: -0.5px;
    margin-bottom: 20px; line-height: 1.3;
  }

  /* Meta info row */
  .meta-row {
    display: flex; gap: 16px; flex-wrap: wrap;
    margin-bottom: 24px;
  }
  .meta-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; color: #a99fd4; font-weight: 500;
  }
  .meta-item strong { color: #6b5ea8; }

  /* Progress section */
  .progress-section {
    margin-bottom: 28px;
  }
  .progress-header {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 8px;
  }
  .progress-label {
    font-size: 13px; font-weight: 600; color: #6b5ea8;
  }
  .progress-pct {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 800; color: #7c3aed;
  }
  .progress-track {
    width: 100%; height: 10px;
    background: #ede8ff; border-radius: 999px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; border-radius: 999px;
    transition: width 0.6s ease;
  }
  .progress-msg {
    font-size: 12px; color: #a99fd4;
    margin-top: 6px; font-weight: 500;
  }

  /* Subtasks section */
  .subtasks-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 28px;
    border: 1px solid #ede8ff;
    box-shadow: 0 10px 40px rgba(124,58,237,0.06);
  }
  .subtasks-header {
    display: flex; align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .subtasks-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 700; color: #1a1033;
    display: flex; align-items: center; gap: 8px;
  }
  .subtask-count {
    background: #f3f0ff; color: #7c3aed;
    font-size: 12px; font-weight: 700;
    padding: 2px 8px; border-radius: 999px;
  }
  .delete-all-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 12px; border-radius: 8px;
    border: 1px solid #fee2e2; background: #fff5f5;
    color: #ef4444; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .delete-all-btn:hover { background: #fee2e2; }

  /* Add subtask row */
  .add-subtask-row {
    display: flex; gap: 8px; margin-bottom: 16px;
  }
  .subtask-input {
    flex: 1; padding: 10px 14px;
    background: #f9f7ff; border: 1.5px solid #ede8ff;
    border-radius: 10px; color: #1a1033; font-size: 14px;
    font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.2s;
  }
  .subtask-input:focus { border-color: #7c3aed; }
  .subtask-input::placeholder { color: #c4b8e8; }

  .add-btn {
    padding: 10px 16px; border-radius: 10px;
    border: none; background: #7c3aed; color: white;
    font-size: 13px; font-weight: 700; cursor: pointer;
    transition: opacity 0.2s; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 6px;
  }
  .add-btn:hover { opacity: 0.88; }
  .add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .ai-btn {
    padding: 10px 14px; border-radius: 10px;
    border: 1px solid #ede8ff;
    background: linear-gradient(135deg, #f3f0ff, #ede8ff);
    color: #7c3aed; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 6px;
  }
  .ai-btn:hover { border-color: #7c3aed; background: #ede8ff; }

  /* Subtask items */
  .subtask-item {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 12px 14px; border-radius: 12px;
    border: 1px solid #ede8ff;
    margin-bottom: 8px; transition: all 0.2s;
    background: #f9f7ff;
  }
  .subtask-item.done { background: #f0fdf4; border-color: #bbf7d0; }
  .subtask-item:hover { border-color: #7c3aed30; }

  .subtask-left {
    display: flex; align-items: center; gap: 12px; flex: 1;
  }
  .subtask-checkbox {
    width: 20px; height: 20px;
    border-radius: 6px; border: 2px solid #d8ceff;
    background: white; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s;
  }
  .subtask-checkbox.checked {
    background: #7c3aed; border-color: #7c3aed;
  }
  .subtask-text {
    font-size: 14px; font-weight: 500; color: #1a1033;
    transition: all 0.2s;
  }
  .subtask-text.done { text-decoration: line-through; color: #a99fd4; }

  .subtask-del-btn {
    padding: 5px 10px; border-radius: 7px;
    border: 1px solid #fee2e2; background: transparent;
    color: #ef4444; font-size: 11px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif; flex-shrink: 0;
  }
  .subtask-del-btn:hover { background: #fee2e2; }

  /* Empty state */
  .empty-subtasks {
    text-align: center; padding: 32px;
    color: #c4b8e8; font-size: 14px;
  }
  .empty-subtasks p { margin-top: 8px; }

  /* Loading skeleton */
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .skel {
    border-radius: 12px;
    background: linear-gradient(90deg, #ede8ff 25%, #ddd5ff 37%, #ede8ff 63%);
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white; border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
`;

const getProgressColor = (p) => p < 40 ? "#ef4444" : p < 80 ? "#f59e0b" : "#22c55e";

const getDueStatus = (dueDate) => {
  if (!dueDate) return null;
  const diff = (new Date(dueDate) - new Date()) / 864e5;
  if (diff < 0) return { label: "Overdue", color: "#ef4444" };
  if (diff <= 2) return { label: "Due soon", color: "#f59e0b" };
  return { label: "On track", color: "#22c55e" };
};

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [newSubtask, setNewSubtask] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const token = localStorage.getItem("token");

  const fetchTask = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTask(res.data);
    } catch { toast.error("Failed to load task"); }
  };

  useEffect(() => { fetchTask(); }, [id]);

  const computedProgress = !task ? 0
    : !task.subtasks?.length ? (task.progress || 0)
    : Math.round(task.subtasks.filter(s => s.completed).length / task.subtasks.length * 100);

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    setAddingSubtask(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/tasks/${task._id}/subtasks`,
        { title: newSubtask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTask(res.data);
      setNewSubtask("");
      toast.success("Subtask added ✨");
    } catch { toast.error("Failed to add subtask"); }
    finally { setAddingSubtask(false); }
  };

  const generateSubtasks = async () => {
    setGeneratingAI(true);
    try {
      await axios.post(
        `${API_URL}/api/tasks/${task._id}/auto-subtasks`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("AI subtasks generated ✨");
      fetchTask();
    } catch { toast.error("Generation failed ❌"); }
    finally { setGeneratingAI(false); }
  };

  const deleteAllSubtasks = async () => {
    if (!window.confirm("Delete ALL subtasks?")) return;
    try {
      await axios.delete(
        `${API_URL}/api/tasks/${task._id}/subtasks/delete-all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("All subtasks deleted 🧹");
      fetchTask();
    } catch { toast.error("Failed to delete subtasks"); }
  };

  const toggleSubtask = async (sub) => {
    const prev = task;
    setTask({ ...task, subtasks: task.subtasks.map(s => s._id === sub._id ? { ...s, completed: !s.completed } : s) });
    try {
      const res = await axios.patch(
        `${API_URL}/api/tasks/${task._id}/subtasks/${sub._id}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTask(res.data);
    } catch { setTask(prev); toast.error("Update failed"); }
  };

  const deleteSubtask = async (subId) => {
    try {
      const res = await axios.delete(
        `${API_URL}/api/tasks/${task._id}/subtasks/${subId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTask(res.data);
      toast.success("Subtask deleted 🗑️");
    } catch { toast.error("Delete failed"); }
  };

  const dueStatus = task ? getDueStatus(task.dueDate) : null;
  const dueFormatted = task?.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null;

  // ── Skeleton ──
  if (!task) return (
    <>
      <style>{STYLES}</style>
      <div className="td-page">
        <div className="td-inner">
          <div className="td-topbar">
            <div className="skel" style={{ width: 100, height: 38 }} />
            <div className="skel" style={{ width: 100, height: 24 }} />
          </div>
          <div className="skel" style={{ height: 220, marginBottom: 20 }} />
          <div className="skel" style={{ height: 300 }} />
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div className="td-page">
        <div className="td-inner">

          {/* Topbar */}
          <motion.div className="td-topbar"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          >
            <button className="back-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft size={11} /> Back
            </button>
            <div className="brand">Task<span>Flow</span></div>
            <div style={{ width: 80 }} />
          </motion.div>

          {/* Main Card */}
          <motion.div className="td-card"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          >
            {/* Badges */}
            <div className="badge-row">
              <span className={`badge ${task.priority}`}>{task.priority} priority</span>
              <span className={`badge ${task.status}`}>{task.status}</span>
              {task.category && (
                <span className="badge" style={{ background: "#f3f0ff", color: "#7c3aed" }}>
                  {task.category}
                </span>
              )}
              {dueStatus && (
                <span className="badge" style={{ background: `${dueStatus.color}18`, color: dueStatus.color }}>
                  {dueStatus.label}
                </span>
              )}
            </div>

            {/* Title */}
            <div className="td-title">{task.title}</div>

            {/* Meta */}
            <div className="meta-row">
              {dueFormatted && (
                <div className="meta-item">
                  <FaCalendarAlt size={12} />
                  <span>Due: <strong>{dueFormatted}</strong></span>
                </div>
              )}
              <div className="meta-item">
                <FaTag size={12} />
                <span>Category: <strong style={{ textTransform: "capitalize" }}>{task.category}</strong></span>
              </div>
              <div className="meta-item">
                <FaFire size={12} />
                <span>Priority: <strong style={{ textTransform: "capitalize" }}>{task.priority}</strong></span>
              </div>
              {task.subtasks?.length > 0 && (
                <div className="meta-item">
                  <FaClock size={12} />
                  <span><strong>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</strong> subtasks done</span>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Overall Progress</span>
                <span className="progress-pct">{computedProgress}%</span>
              </div>
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  style={{ background: getProgressColor(computedProgress) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${computedProgress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="progress-msg">
                {computedProgress === 100 ? "🎉 All done! Amazing work!" : `${100 - computedProgress}% remaining — keep going! 💪`}
              </p>
            </div>
          </motion.div>

          {/* Subtasks Card */}
          <motion.div className="subtasks-card"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Header */}
            <div className="subtasks-header">
              <div className="subtasks-title">
                <FaCheck color="#7c3aed" />
                Subtasks
                <span className="subtask-count">{task.subtasks?.length || 0}</span>
              </div>
              {task.subtasks?.length > 0 && (
                <button className="delete-all-btn" onClick={deleteAllSubtasks}>
                  <FaTrash size={10} /> Delete All
                </button>
              )}
            </div>

            {/* Add row */}
            <div className="add-subtask-row">
              <input
                className="subtask-input"
                type="text"
                placeholder="Add a subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
              />
              <button className="ai-btn" onClick={generateSubtasks} disabled={generatingAI}>
                {generatingAI ? <span className="spinner" /> : <FaRobot size={12} />}
                {generatingAI ? "Generating..." : "AI Generate"}
              </button>
              <button className="add-btn" onClick={handleAddSubtask} disabled={!newSubtask.trim() || addingSubtask}>
                {addingSubtask ? <span className="spinner" /> : <FaPlus size={11} />}
                Add
              </button>
            </div>

            {/* Subtask list */}
            {!task.subtasks?.length ? (
              <div className="empty-subtasks">
                <div style={{ fontSize: 28 }}>📋</div>
                <p>No subtasks yet — add one above or use AI Generate!</p>
              </div>
            ) : (
              <AnimatePresence>
                {task.subtasks.map((sub, i) => (
                  <motion.div
                    key={sub._id}
                    className={`subtask-item ${sub.completed ? "done" : ""}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="subtask-left">
                      {/* Custom checkbox */}
                      <div
                        className={`subtask-checkbox ${sub.completed ? "checked" : ""}`}
                        onClick={() => toggleSubtask(sub)}
                      >
                        {sub.completed && <FaCheck size={10} color="white" />}
                      </div>
                      <span className={`subtask-text ${sub.completed ? "done" : ""}`}>
                        {sub.title}
                      </span>
                    </div>
                    <button className="subtask-del-btn" onClick={() => deleteSubtask(sub._id)}>
                      <FaTrash size={10} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </motion.div>

        </div>
      </div>
    </>
  );
}

export default TaskDetails;