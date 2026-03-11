import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "../socket";
import { FaMoon, FaSun, FaPlus, FaSearch } from "react-icons/fa";

const API_URL = "http://localhost:5000";

const DARK = {
  bg: "#0f0f13", sidebar: "#16161d", sidebarBorder: "#2a2a35",
  card: "#1a1a24", cardBorder: "#2a2a35", text: "#f0eee8",
  subtext: "#9998a8", muted: "#6b6a7a", accent: "#7c6af7",
  navActive: "#7c6af715", input: "#1a1a24", inputBorder: "#2a2a35",
  skeleton1: "#1a1a24", skeleton2: "#22222e",
  modalBg: "#1a1a24", modalInput: "#0f0f13",
  progressBg: "#2a2a35", taskDone: "#4a4a5a",
};

const LIGHT = {
  bg: "#eef0f5", sidebar: "#ffffff", sidebarBorder: "#e2e4ed",
  card: "#ffffff", cardBorder: "#d8dae6", text: "#1a1033",
  subtext: "#5a5f7a", muted: "#9fa3b8", accent: "#7c3aed",
  navActive: "#7c3aed12", input: "#f4f5f9", inputBorder: "#c8cad8",
  skeleton1: "#eceef4", skeleton2: "#dfe1ec",
  modalBg: "#ffffff", modalInput: "#f4f5f9",
  progressBg: "#e2e4ed", taskDone: "#9fa3b8",
};

const buildStyles = (tk) => `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${tk.bg}; color: ${tk.text}; min-height: 100vh; transition: background 0.35s, color 0.35s; }
  .tasks-shell { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }

  .tasks-sidebar { background: ${tk.sidebar}; border-right: 1px solid ${tk.sidebarBorder}; padding: 32px 20px; display: flex; flex-direction: column; gap: 4px; position: sticky; top: 0; height: 100vh; transition: background 0.35s; overflow-y: auto; }
  .tasks-sidebar h2 { font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 800; color: ${tk.text}; padding: 0 12px; margin-bottom: 24px; letter-spacing: -0.5px; }
  .tasks-sidebar h2 span { color: ${tk.accent}; }
  .nav-btn { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: none; background: transparent; color: ${tk.subtext}; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; text-align: left; width: 100%; transition: all 0.18s; }
  .nav-btn:hover { background: ${tk.navActive}; color: ${tk.text}; }
  .nav-btn.active { background: ${tk.navActive}; color: ${tk.accent}; font-weight: 600; }
  .theme-toggle { display: flex; align-items: center; gap: 9px; padding: 10px 14px; border-radius: 10px; border: 1px solid ${tk.sidebarBorder}; background: ${tk.card}; color: ${tk.subtext}; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.2s; margin-top: 6px; }
  .theme-toggle:hover { border-color: ${tk.accent}; color: ${tk.accent}; }
  .admin-divider { height: 1px; background: ${tk.sidebarBorder}; margin: 8px 0; }
  .admin-section-label { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${tk.muted}; padding: 0 14px; margin-bottom: 4px; }
  .admin-nav-btn { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; width: 100%; transition: all 0.18s; }
  .admin-nav-btn:hover { filter: brightness(1.2); transform: translateX(3px); }
  @keyframes sidebarPulse { 0%,100% { box-shadow: 0 0 6px #22c55e; } 50% { box-shadow: 0 0 12px #22c55e; } }

  .tasks-main { padding: 32px 28px; overflow-y: auto; background: ${tk.bg}; transition: background 0.35s; }
  .tasks-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .tasks-topbar h1 { font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 800; color: ${tk.text}; letter-spacing: -0.8px; }
  .tasks-topbar h1 span { color: ${tk.accent}; }

  .stats-row { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat-pill { padding: 8px 18px; border-radius: 999px; border: 1px solid ${tk.cardBorder}; background: ${tk.card}; font-size: 13px; font-weight: 600; color: ${tk.subtext}; display: flex; align-items: center; gap: 6px; }

  .add-task-bar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; padding: 16px; background: ${tk.card}; border: 1px solid ${tk.cardBorder}; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
  .task-input { flex: 1 1 200px; padding: 10px 14px; background: ${tk.input}; border: 1px solid ${tk.inputBorder}; border-radius: 10px; color: ${tk.text}; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
  .task-input:focus { border-color: ${tk.accent}; }
  .task-input::placeholder { color: ${tk.muted}; }
  .task-select { padding: 10px 14px; background: ${tk.input}; border: 1px solid ${tk.inputBorder}; border-radius: 10px; color: ${tk.subtext}; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; }
  .add-btn { padding: 10px 20px; background: ${tk.accent}; border: none; border-radius: 10px; color: white; font-weight: 700; font-size: 14px; cursor: pointer; transition: opacity 0.2s, transform 0.1s; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 7px; white-space: nowrap; }
  .add-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .add-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
  .ai-badge { font-size: 12px; color: ${tk.accent}; font-weight: 600; margin-bottom: 10px; }

  .toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; }
  .search-wrap { position: relative; flex: 1; min-width: 200px; }
  .search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: ${tk.muted}; font-size: 13px; }
  .search-input { width: 100%; padding: 10px 14px 10px 34px; background: ${tk.input}; border: 1px solid ${tk.inputBorder}; border-radius: 10px; color: ${tk.text}; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
  .search-input:focus { border-color: ${tk.accent}; }
  .search-input::placeholder { color: ${tk.muted}; }
  .filter-pill { padding: 8px 14px; border-radius: 999px; border: 1px solid ${tk.cardBorder}; background: transparent; color: ${tk.muted}; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; text-transform: capitalize; }
  .filter-pill:hover { border-color: ${tk.accent}; color: ${tk.text}; }
  .filter-pill.active { background: ${tk.accent}; border-color: ${tk.accent}; color: white; }
  .sort-select { padding: 9px 14px; background: ${tk.input}; border: 1px solid ${tk.inputBorder}; border-radius: 10px; color: ${tk.subtext}; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; }

  .section-header { display: flex; align-items: center; gap: 10px; margin: 24px 0 12px; }
  .section-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; white-space: nowrap; }
  .section-line { flex: 1; height: 1px; background: ${tk.cardBorder}; }
  .section-count { font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 999px; }

  .task-row { background: ${tk.card}; border: 1px solid ${tk.cardBorder}; box-shadow: 0 4px 16px rgba(0,0,0,0.13); border-left: 4px solid transparent; border-radius: 14px; padding: 16px 20px; margin-bottom: 8px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all 0.18s; }
  .task-row:hover { transform: translateX(4px); box-shadow: 0 8px 24px rgba(0,0,0,0.16); }
  .task-row.completed-row { opacity: 0.65; }

  .check-circle { width: 22px; height: 22px; border-radius: 50%; border: 2px solid ${tk.cardBorder}; background: transparent; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; transition: all 0.18s; }
  .check-circle.done { border-color: #22c55e; background: #22c55e; }
  .check-circle:hover { border-color: #22c55e; }

  .task-info { flex: 1; min-width: 0; }
  .task-name { font-weight: 600; font-size: 15px; color: ${tk.text}; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .task-name.done { text-decoration: line-through; color: ${tk.taskDone}; }
  .task-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .chip { padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; }

  .progress-section { width: 140px; flex-shrink: 0; }
  .progress-top { display: flex; justify-content: space-between; font-size: 11px; color: ${tk.muted}; margin-bottom: 4px; }
  .progress-bar { height: 6px; background: ${tk.progressBg}; border-radius: 999px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }

  .priority-badge { padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; color: white; flex-shrink: 0; text-transform: capitalize; }

  .row-actions { display: flex; gap: 6px; flex-shrink: 0; }
  .action-btn { padding: 5px 12px; border-radius: 7px; border: 1px solid ${tk.cardBorder}; background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
  .action-btn.complete { border-color: #22c55e40; color: #22c55e; }
  .action-btn.complete:hover { background: #22c55e20; }
  .action-btn.undo { border-color: #f59e0b40; color: #f59e0b; }
  .action-btn.undo:hover { background: #f59e0b20; }
  .action-btn.edit { border-color: ${tk.accent}40; color: ${tk.accent}; }
  .action-btn.edit:hover { background: ${tk.accent}20; }
  .action-btn.del { border-color: #ef444440; color: #ef4444; }
  .action-btn.del:hover { background: #ef444420; }

  .empty-state { text-align: center; padding: 60px 20px; color: ${tk.muted}; }
  .empty-state div { font-size: 40px; margin-bottom: 12px; }

  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .skel { border-radius: 14px; background: linear-gradient(90deg, ${tk.skeleton1} 25%, ${tk.skeleton2} 37%, ${tk.skeleton1} 63%); background-size: 800px 100%; animation: shimmer 1.4s infinite; margin-bottom: 8px; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 999; backdrop-filter: blur(5px); }
  .modal-box { background: ${tk.modalBg}; border: 1px solid ${tk.cardBorder}; border-radius: 18px; padding: 28px; width: 340px; }
  .modal-box h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 18px; color: ${tk.text}; }
  .modal-input { width: 100%; padding: 10px 14px; background: ${tk.modalInput}; border: 1px solid ${tk.inputBorder}; border-radius: 9px; color: ${tk.text}; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; margin-bottom: 12px; }
  .modal-input:focus { border-color: ${tk.accent}; }
  .modal-actions { display: flex; gap: 10px; margin-top: 6px; }
  .modal-save { flex: 1; padding: 10px; background: ${tk.accent}; border: none; border-radius: 9px; color: white; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .modal-cancel { flex: 1; padding: 10px; background: ${tk.cardBorder}; border: none; border-radius: 9px; color: ${tk.subtext}; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
`;

const getDueStatus = (d) => { if (!d) return "safe"; const diff = (new Date(d) - new Date()) / 864e5; return diff < 0 ? "overdue" : diff <= 2 ? "soon" : "safe"; };
const getDueCountdown = (d) => { if (!d) return null; const diff = Math.ceil((new Date(d) - new Date()) / 864e5); return diff < 0 ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : `${diff}d left`; };
const getPriorityColor = (p) => p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#22c55e";
const getProgressColor = (p) => p < 40 ? "#ef4444" : p < 80 ? "#f59e0b" : "#22c55e";
const getCategoryColor = (c) => ({ study: "#8b5cf6", personal: "#22c55e", health: "#ef4444", work: "#3b82f6" }[c] || "#7c6af7");
const getSubtaskProgress = (task) => { if (!task.subtasks?.length) return task.progress || 0; const done = task.subtasks.filter(s => s.completed).length; return Math.round((done / task.subtasks.length) * 100); };
const suggestCategory = (t) => { const s = t.toLowerCase(); if (["study","exam","learn","coding","dsa","ml","java","python","react","node"].some(k => s.includes(k))) return "study"; if (["gym","workout","run","exercise","yoga","diet","meditation"].some(k => s.includes(k))) return "health"; if (["meeting","client","project","deadline","report","deploy","bug","interview"].some(k => s.includes(k))) return "work"; return "personal"; };

function Tasks() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const tk = darkMode ? DARK : LIGHT;
  const toggleTheme = () => setDarkMode(prev => { localStorage.setItem("darkMode", String(!prev)); return !prev; });
  const isAdmin = (() => { try { const p = JSON.parse(atob(localStorage.getItem("token").split(".")[1])); return !!p.isAdmin; } catch { return false; } })();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("personal");
  const [aiPriority, setAiPriority] = useState(null);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const aiTimerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    socket.off("tasksUpdated").on("tasksUpdated", () => { toast.success("Tasks synced 🔄"); fetchTasks(); });
    return () => socket.off("tasksUpdated");
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data);
    } catch { toast.error("Failed to load tasks"); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const predictPriority = useCallback(async (val) => {
    if (!val || val.trim().length < 4) return;
    try {
      setPriorityLoading(true);
      const res = await axios.post(`${API_URL}/api/tasks/ai-priority`, { title: val }, { headers: { Authorization: `Bearer ${token}` } });
      setAiPriority(res.data.priority); setPriority(res.data.priority);
    } catch { } finally { setPriorityLoading(false); }
  }, [token]);

  const addTask = async () => {
    if (!title.trim()) return;
    const tempId = Date.now();
    const finalCat = title.trim().length > 2 ? suggestCategory(title) : category;
    const optimistic = { _id: tempId, title, priority, status: "pending", category: finalCat, dueDate: dueDate || null, progress: 0, subtasks: [], createdAt: new Date() };
    setTasks(p => [optimistic, ...p]);
    setTitle(""); setDueDate(""); setPriority("medium"); setAiPriority(null);
    try {
      const res = await axios.post(`${API_URL}/api/tasks`, { title: optimistic.title, priority: optimistic.priority, status: "pending", category: optimistic.category, dueDate: optimistic.dueDate }, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(p => p.map(t => t._id === tempId ? res.data : t));
      toast.success("Task added ✨");
    } catch { setTasks(p => p.filter(t => t._id !== tempId)); toast.error("Failed to add task"); }
  };

  const deleteTask = async (id) => { const prev = tasks; setTasks(p => p.filter(t => t._id !== id)); try { await axios.delete(`${API_URL}/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } }); } catch { setTasks(prev); toast.error("Delete failed"); } };
  const toggleComplete = async (task) => { const ns = task.status === "completed" ? "pending" : "completed"; setTasks(p => p.map(t => t._id === task._id ? { ...t, status: ns } : t)); try { await axios.put(`${API_URL}/api/tasks/${task._id}`, { status: ns }, { headers: { Authorization: `Bearer ${token}` } }); } catch { setTasks(p => p.map(t => t._id === task._id ? { ...t, status: task.status } : t)); toast.error("Update failed"); } };
  const openEdit = (task) => { setEditTask(task); setEditTitle(task.title || ""); setEditPriority(task.priority || "medium"); setEditDueDate(task.dueDate ? task.dueDate.split("T")[0] : ""); };
  const handleUpdate = async () => { if (!editTitle.trim()) { toast.error("Title cannot be empty"); return; } try { await axios.put(`${API_URL}/api/tasks/${editTask._id}`, { title: editTitle, priority: editPriority, dueDate: editDueDate || null }, { headers: { Authorization: `Bearer ${token}` } }); toast.success("Task updated ✨"); setEditTask(null); fetchTasks(); } catch { toast.error("Update failed"); } };

  const filtered = tasks
    .filter(t => {
      const mf = filter === "all" ? true : filter === "pending" ? t.status === "pending" : filter === "completed" ? t.status === "completed" : filter === "high" ? t.priority === "high" : t.category === filter;
      return mf && t.title.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "priority") { const o = { high: 3, medium: 2, low: 1 }; return o[b.priority] - o[a.priority]; }
      if (sort === "due") return new Date(a.dueDate || "9999") - new Date(b.dueDate || "9999");
      return 0;
    });

  const pendingTasks = filtered.filter(t => t.status === "pending");
  const completedTasks = filtered.filter(t => t.status === "completed");
  const overdueCount = tasks.filter(t => t.dueDate && t.status !== "completed" && new Date(t.dueDate) < new Date()).length;

  const rowVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { duration: 0.25, delay: i * 0.04 } }),
    exit: { opacity: 0, x: 16, transition: { duration: 0.18 } },
  };

  const TaskRow = ({ task, index }) => {
    const dueStatus = getDueStatus(task.dueDate);
    const prog = getSubtaskProgress(task);
    const countdown = getDueCountdown(task.dueDate);
    const isDone = task.status === "completed";
    return (
      <motion.div
        className={`task-row ${isDone ? "completed-row" : ""}`}
        style={{ borderLeftColor: isDone ? "#22c55e" : getPriorityColor(task.priority) }}
        custom={index} variants={rowVariants} initial="hidden" animate="visible" exit="exit" layout
        onClick={() => navigate(`/task/${task._id}`)}
      >
        <div className={`check-circle ${isDone ? "done" : ""}`} onClick={e => { e.stopPropagation(); toggleComplete(task); }}>
          {isDone && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
        </div>

        <div className="task-info">
          <div className={`task-name ${isDone ? "done" : ""}`}>{task.title}</div>
          <div className="task-meta">
            <span className="chip" style={{ background: getCategoryColor(task.category) + "25", color: getCategoryColor(task.category) }}>{task.category}</span>
            {countdown && (
              <span className="chip" style={{ background: dueStatus === "overdue" ? "#ef444425" : dueStatus === "soon" ? "#f59e0b25" : "#22c55e20", color: dueStatus === "overdue" ? "#ef4444" : dueStatus === "soon" ? "#f59e0b" : "#22c55e" }}>
                ⏰ {countdown}
              </span>
            )}
            {task.subtasks?.length > 0 && (
              <span style={{ fontSize: 11, color: tk.muted }}>📎 {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</span>
            )}
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-top">
            <span>Progress</span>
            <span style={{ color: getProgressColor(prog), fontWeight: 700 }}>{prog}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${prog || 3}%`, background: getProgressColor(prog) }} />
          </div>
        </div>

        <span className="priority-badge" style={{ background: getPriorityColor(task.priority) }}>{task.priority}</span>

        <div className="row-actions" onClick={e => e.stopPropagation()}>
          <button className={`action-btn ${isDone ? "undo" : "complete"}`} onClick={() => toggleComplete(task)}>
            {isDone ? "↩ Undo" : "✓ Done"}
          </button>
          <button className="action-btn edit" onClick={() => openEdit(task)}>Edit</button>
          <button className="action-btn del" onClick={() => deleteTask(task._id)}>Delete</button>
        </div>
      </motion.div>
    );
  };

  const navItems = [
    { label: "📊 Dashboard", path: "/dashboard" },
    { label: "📋 Tasks",     path: "/tasks" },
    { label: "📈 Insights",  path: "/insights" },
    { label: "👤 Profile",   path: "/profile" },
  ];

  return (
    <>
      <style>{buildStyles(tk)}</style>
      <div className="tasks-shell">

        {/* SIDEBAR */}
        <div className="tasks-sidebar">
          <h2>Task<span>Flow</span></h2>
          {navItems.map(item => (
            <button key={item.path} className={`nav-btn ${location.pathname === item.path ? "active" : ""}`} onClick={() => navigate(item.path)}>
              {item.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {isAdmin && (
            <>
              <div className="admin-divider" />
              <div className="admin-section-label">Admin</div>
              <button className="admin-nav-btn" onClick={() => navigate("/admin/active-users")} style={{ color: "#22c55e" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", animation: "sidebarPulse 2s ease infinite", flexShrink: 0 }} />
                Active Users
              </button>
              <button className="admin-nav-btn" onClick={() => navigate("/admin")} style={{ color: "#a78bfa" }}>
                🛡️ Admin Panel
              </button>
              <div className="admin-divider" />
            </>
          )}
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? <><FaSun style={{ color: "#f59e0b", fontSize: "15px" }} /> Switch to Light</> : <><FaMoon style={{ color: tk.accent, fontSize: "14px" }} /> Switch to Dark</>}
          </button>
          <button className="nav-btn" style={{ color: "#ef4444", marginTop: "4px" }} onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}>
            🚪 Logout
          </button>
        </div>

        {/* MAIN */}
        <div className="tasks-main">
          <motion.div className="tasks-topbar" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1>My <span>Tasks</span></h1>
          </motion.div>

          {/* Stats */}
          <motion.div className="stats-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="stat-pill">📋 {tasks.length} Total</div>
            <div className="stat-pill" style={{ color: "#22c55e", borderColor: "#22c55e30" }}>✅ {tasks.filter(t => t.status === "completed").length} Done</div>
            <div className="stat-pill" style={{ color: "#f59e0b", borderColor: "#f59e0b30" }}>⏳ {tasks.filter(t => t.status === "pending").length} Pending</div>
            {overdueCount > 0 && <div className="stat-pill" style={{ color: "#ef4444", borderColor: "#ef444430" }}>🚨 {overdueCount} Overdue</div>}
          </motion.div>

          {/* Add task */}
          <motion.div className="add-task-bar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <input className="task-input" placeholder="What needs to be done?" value={title}
              onChange={e => {
                const val = e.target.value; setTitle(val);
                clearTimeout(aiTimerRef.current);
                aiTimerRef.current = setTimeout(() => predictPriority(val), 600);
                if (val.trim().length > 2) setCategory(suggestCategory(val));
              }}
              onKeyDown={e => e.key === "Enter" && addTask()}
            />
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="task-select" />
            <select className="task-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="personal">🟢 Personal</option>
              <option value="work">🔵 Work</option>
              <option value="study">🟣 Study</option>
              <option value="health">🔴 Health</option>
            </select>
            <select className="task-select" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
            <button className="add-btn" onClick={addTask} disabled={!title.trim()}>
              <FaPlus size={12} /> Add Task
            </button>
          </motion.div>

          {aiPriority && <div className="ai-badge">🤖 AI suggests: <strong>{aiPriority}</strong>{priorityLoading && " (thinking...)"}</div>}

          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-wrap">
              <FaSearch />
              <input className="search-input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {["all","pending","completed","high","work","study","health","personal"].map(f => (
              <button key={f} className={`filter-pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">🕐 Newest</option>
              <option value="oldest">🕓 Oldest</option>
              <option value="priority">🔥 Priority</option>
              <option value="due">⏰ Due Date</option>
            </select>
          </div>

          {/* Task list */}
          {loading ? (
            [...Array(5)].map((_, i) => <div key={i} className="skel" style={{ height: 72 }} />)
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div>📭</div>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No tasks found</p>
              <p style={{ fontSize: 13 }}>Add a task or change your filter</p>
            </div>
          ) : (
            <>
              {pendingTasks.length > 0 && (
                <>
                  <div className="section-header">
                    <span className="section-title" style={{ color: tk.accent }}>⏳ Pending</span>
                    <div className="section-line" />
                    <span className="section-count" style={{ background: tk.accent + "20", color: tk.accent }}>{pendingTasks.length}</span>
                  </div>
                  <AnimatePresence>
                    {pendingTasks.map((task, i) => <TaskRow key={task._id} task={task} index={i} />)}
                  </AnimatePresence>
                </>
              )}
              {completedTasks.length > 0 && (
                <>
                  <div className="section-header">
                    <span className="section-title" style={{ color: "#22c55e" }}>✅ Completed</span>
                    <div className="section-line" />
                    <span className="section-count" style={{ background: "#22c55e20", color: "#22c55e" }}>{completedTasks.length}</span>
                  </div>
                  <AnimatePresence>
                    {completedTasks.map((task, i) => <TaskRow key={task._id} task={task} index={i} />)}
                  </AnimatePresence>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editTask && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditTask(null)}>
            <motion.div className="modal-box" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <h3>✏️ Edit Task</h3>
              <input className="modal-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Task title" />
              <select className="modal-input" value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
              <input type="date" className="modal-input" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} />
              <div className="modal-actions">
                <button className="modal-save" onClick={handleUpdate}>Save Changes</button>
                <button className="modal-cancel" onClick={() => setEditTask(null)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Tasks;