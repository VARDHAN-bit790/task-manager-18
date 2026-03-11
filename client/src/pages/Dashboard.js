import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { socket } from "../socket";
import { LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRobot, FaFire, FaChartLine, FaExclamationTriangle,
  FaCheckCircle, FaLightbulb, FaMoon, FaSun,
} from "react-icons/fa";

const API_URL = "https://task-manager-18.onrender.com";

const DARK = {
  bg:"#0f0f13",sidebar:"#16161d",sidebarBorder:"#2a2a35",card:"#1a1a24",cardBorder:"#2a2a35",
  widget:"#13131a",panel:"#1a1a24",input:"#1a1a24",inputBorder:"#2a2a35",text:"#f0eee8",
  subtext:"#9998a8",muted:"#6b6a7a",accent:"#7c6af7",accentSoft:"#7c6af715",modalBg:"#1a1a24",
  modalInput:"#0f0f13",skeleton1:"#1a1a24",skeleton2:"#22222e",insightItem:"#1e1e28",
  focusGrad:"linear-gradient(135deg,#1a1a24,#1e1a2e)",chartGrid:"#2a2a35",chartAxis:"#4a4a5a",
  tooltipBg:"#1a1a24",tooltipBorder:"#2a2a35",tooltipText:"#f0eee8",tbBtn:"#1e1e28",
  navActive:"#7c6af715",taskDone:"#4a4a5a",progressBg:"#2a2a35",
};

const LIGHT = {
  bg:"#eef0f5",sidebar:"#ffffff",sidebarBorder:"#d0d3e0",card:"#ffffff",cardBorder:"#d0d3e0",
  widget:"#f4f5f9",panel:"#ffffff",input:"#f4f5f9",inputBorder:"#c8cad8",text:"#1a1033",
  subtext:"#5a5f7a",muted:"#9fa3b8",accent:"#7c3aed",accentSoft:"#7c3aed12",modalBg:"#ffffff",
  modalInput:"#f4f5f9",skeleton1:"#eceef4",skeleton2:"#dfe1ec",insightItem:"#f4f5f9",
  focusGrad:"linear-gradient(135deg,#ede8ff,#ddd5ff)",chartGrid:"#e2e4ed",chartAxis:"#9fa3b8",
  tooltipBg:"#ffffff",tooltipBorder:"#d0d3e0",tooltipText:"#1a1033",tbBtn:"#f4f5f9",
  navActive:"#7c3aed12",taskDone:"#9fa3b8",progressBg:"#e2e4ed",
};

const buildStyles = (tk) => `
 @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap')
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${tk.bg}; color: ${tk.text}; min-height: 100vh; transition: background 0.35s ease, color 0.35s ease; }
  .dash-shell { display: grid; grid-template-columns: 240px 1fr 280px; min-height: 100vh; }
  .dash-sidebar { background: ${tk.sidebar}; border-right: 1px solid ${tk.sidebarBorder}; padding: 32px 20px; display: flex; flex-direction: column; gap: 4px; position: sticky; top: 0; height: 100vh; transition: background 0.35s ease; overflow-y: auto; }
  .dash-sidebar h2 { font-family: 'Montserrat', sans-serif; }
  .dash-sidebar h2 span { color: ${tk.accent}; }
  .nav-btn { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: none; background: transparent; color: ${tk.subtext}; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; text-align: left; width: 100%; transition: all 0.18s ease; }
  .nav-btn:hover { background: ${tk.navActive}; color: ${tk.text}; }
  .nav-btn.active { background: ${tk.navActive}; color: ${tk.accent}; font-weight: 600; }
  .admin-nav-btn { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; width: 100%; transition： all 0.18s ease; }
  .admin-nav-btn:hover { filter: brightness(1.2); transform: translateX(3px); }
  .theme-toggle { display: flex; align-items: center; gap: 9px; padding: 10px 14px; border-radius: 10px; border: 1px solid ${tk.sidebarBorder}; background: ${tk.card}; color: ${tk.subtext}; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.2s ease; margin-top: 6px; }
  .theme-toggle:hover { border-color: ${tk.accent}; color: ${tk.accent}; }
  .dash-main { padding: 32px 28px; overflow-y: auto; background: ${tk.bg}; transition: background 0.35s ease; }
  .dash-right { background: ${tk.sidebar}; border-left: 1px solid ${tk.sidebarBorder}; padding: 28px 20px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; transition: background 0.35s ease; }
  .dash-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .dash-topbar h1 { font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.8px; color: ${tk.text}; }
  .dash-topbar h1 span { color: ${tk.accent}; }
  .tb-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid ${tk.cardBorder}; background: ${tk.tbBtn}; color: ${tk.subtext}; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.18s; font-family: 'DM Sans', sans-serif; }
  .tb-btn.danger:hover { border-color: #ef4444; color: #ef4444; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .stat-card { background: ${tk.card}; border: 1px solid ${tk.cardBorder}; border-radius: 14px; padding: 18px; transition: all 0.2s; cursor: default; box-shadow: 0 4px 16px rgba(0,0,0,0.13); }
  .stat-card .stat-icon { font-size: 20px; margin-bottom: 10px; }
  .stat-card h3 { font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 800; color: ${tk.text}; letter-spacing: -1px; }
  .stat-card p { font-size: 12px; color: ${tk.muted}; margin-top: 2px; }
  .panel { background: ${tk.panel}; border: 1px solid ${tk.cardBorder}; border-radius: 16px; padding: 20px; margin-bottom: 18px; transition: background 0.35s ease; box-shadow: 0 4px 16px rgba(0,0,0,0.13); }
  .panel h3 { font-family: 'Montserrat', sans-serif; }
  .add-task-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
  .task-input-field { flex: 1 1 200px; padding: 11px 16px; background: ${tk.input}; border: 1px solid ${tk.inputBorder}; border-radius: 10px; color: ${tk.text}; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
  .task-input-field:focus { border-color: ${tk.accent}; }
  .task-input-field::placeholder { color: ${tk.muted}; }
  .task-select { padding: 11px 14px; background: ${tk.input}; border: 1px solid ${tk.inputBorder}; border-radius: 10px; color: ${tk.subtext}; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; }
  .add-btn-main { padding: 11px 22px; background: ${tk.accent}; border: none; border-radius: 10px; color: white; font-weight: 700; font-size: 14px; cursor: pointer; transition: opacity 0.2s, transform 0.1s; font-family: 'DM Sans', sans-serif; }
  .add-btn-main:hover { opacity: 0.88; transform: translateY(-1px); }
  .add-btn-main:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
  .filter-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .filter-pill { padding: 6px 14px; border-radius: 999px; border: 1px solid ${tk.cardBorder}; background: transparent; color: ${tk.muted}; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; text-transform: capitalize; }
  .filter-pill:hover { border-color: ${tk.accent}; color: ${tk.text}; }
  .filter-pill.active { background: ${tk.accent}; border-color: ${tk.accent}; color: white; }
  .search-bar { width: 100%; padding: 11px 16px; background: ${tk.input}; border: 1px solid ${tk.inputBorder}; border-radius: 10px; color: ${tk.text}; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; margin-bottom: 18px; transition: border-color 0.2s; }
  .search-bar::placeholder { color: ${tk.muted}; }
  .task-card-item { background: ${tk.card}; border: 1px solid ${tk.cardBorder}; border-radius: 14px; padding: 16px 18px; margin-bottom: 12px; cursor: pointer; }
  .task-card-item.overdue { border-color: #ef444460; }
  .task-card-item.soon { border-color: #f59e0b60; }
  .task-meta-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
  .chip { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .task-title-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px; }
  .task-title { font-weight: 600; font-size: 15px; color: ${tk.text}; flex: 1; }
  .task-title.done { text-decoration: line-through; color: ${tk.taskDone}; }
  .priority-badge { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; color: white; white-space: nowrap; }
  .progress-bar-wrap { width: 100%; height: 5px; background: ${tk.progressBg}; border-radius: 999px; overflow: hidden; margin: 10px 0 6px; }
  .progress-bar-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
  .task-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
  .task-actions { display: flex; gap: 6px; }
  .action-btn { padding: 5px 12px; border-radius: 7px; border: 1px solid ${tk.cardBorder}; background: transparent; color: ${tk.subtext}; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
  .action-btn.complete { border-color: #22c55e40; color: #22c55e; }
  .action-btn.complete:hover { background: #22c55e20; }
  .action-btn.undo { border-color: #f59e0b40; color: #f59e0b; }
  .action-btn.undo:hover { background: #f59e0b20; }
  .action-btn.edit { border-color: ${tk.accent}40; color: ${tk.accent}; }
  .action-btn.edit:hover { background: ${tk.accent}20; }
  .action-btn.del { border-color: #ef444440; color: #ef4444; }
  .action-btn.del:hover { background: #ef444420; }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .skeleton { height: 80px; border-radius: 14px; background: linear-gradient(90deg, ${tk.skeleton1} 25%, ${tk.skeleton2} 37%, ${tk.skeleton1} 63%); background-size: 800px 100%; animation: shimmer 1.4s infinite; margin-bottom: 12px; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 999; backdrop-filter: blur(5px); }
  .modal-box { background: ${tk.modalBg}; border: 1px solid ${tk.cardBorder}; border-radius: 18px; padding: 28px; width: 340px; }
  .modal-box h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 18px; color: ${tk.text}; }
  .modal-input { width: 100%; padding: 10px 14px; background: ${tk.modalInput}; border: 1px solid ${tk.inputBorder}; border-radius: 9px; color: ${tk.text}; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; margin-bottom: 12px; }
  .modal-input:focus { border-color: ${tk.accent}; }
  .modal-actions { display: flex; gap: 10px; margin-top: 6px; }
  .modal-save { flex: 1; padding: 10px; background: ${tk.accent}; border: none; border-radius: 9px; color: white; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .modal-cancel { flex: 1; padding: 10px; background: ${tk.cardBorder}; border: none; border-radius: 9px; color: ${tk.subtext}; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .widget { background: ${tk.widget}; border: 1px solid ${tk.cardBorder}; border-radius: 14px; padding: 16px; transition: background 0.35s ease; box-shadow: 0 4px 16px rgba(0,0,0,0.13); }
  .widget h4 { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: ${tk.muted}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
  .insight-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 9px; background: ${tk.insightItem}; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: ${tk.subtext}; }
  .focus-item { padding: 10px 12px; border-radius: 10px; background: ${tk.accentSoft}; cursor: pointer; margin-bottom: 8px; transition: background 0.15s; border: 1px solid ${tk.accent}20; }
  .focus-item:hover { background: ${tk.accent}25; }
  .empty-state { text-align: center; padding: 50px 20px; color: ${tk.muted}; }
  .empty-state h3 { font-size: 18px; margin-bottom: 6px; }
  .ai-badge { font-size: 12px; color: ${tk.accent}; font-weight: 600; margin-bottom: 10px; }
  .streak-num { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; text-align: center; }
  @keyframes sidebarPulse { 0%,100% { box-shadow: 0 0 6px #22c55e; } 50% { box-shadow: 0 0 12px #22c55e; } }
  .admin-divider { height: 1px; background: ${tk.sidebarBorder}; margin: 8px 0; }
  .admin-section-label { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${tk.muted}; padding: 0 14px; margin-bottom: 4px; }
`;

const getDueStatus = (d) => { if (!d) return "none"; const diff = (new Date(d) - new Date()) / 864e5; return diff < 0 ? "overdue" : diff <= 2 ? "soon" : "safe"; };
const getDueCountdown = (d) => { if (!d) return ""; const diff = Math.ceil((new Date(d) - new Date()) / 864e5); return diff < 0 ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : `${diff}d left`; };
const getProgressColor = (p) => p < 40 ? "#ef4444" : p < 80 ? "#f59e0b" : "#22c55e";
const getPriorityColor = (p) => p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#22c55e";
const getRiskLevel = (task) => { if (!task.dueDate) return "safe"; const diff = (new Date(task.dueDate) - new Date()) / 864e5; const prog = task.progress || 0; if (diff < 1 && prog < 80) return "critical"; if (diff <= 3 && prog < 60) return "risk"; return "safe"; };
const getTaskScore = (task) => { if (task.status === "completed") return -1; let s = task.priority === "high" ? 50 : task.priority === "medium" ? 30 : 10; if (task.dueDate) { const d = (new Date(task.dueDate) - new Date()) / 864e5; if (d < 0) s += 40; else if (d <= 2) s += 25; else if (d <= 7) s += 10; } return s + (100 - (task.progress || 0)) * 0.1; };
const getFocusReason = (task) => { const r = []; if (task.priority === "high") r.push("⚠️ High priority"); if (task.dueDate) { const d = (new Date(task.dueDate) - new Date()) / 864e5; if (d < 0) r.push("🚨 Overdue"); else if (d <= 2) r.push("⏰ Due soon"); } return r.join(" • "); };
const getSubtaskProgress = (task) => { if (!task.subtasks?.length) return { percent: task.progress || 0, text: null }; const done = task.subtasks.filter((s) => s.completed).length; return { percent: Math.round((done / task.subtasks.length) * 100), text: `${done}/${task.subtasks.length} subtasks` }; };
const suggestCategory = (title) => { const t = title.toLowerCase(); const study = ["study","exam","learn","coding","dsa","ml","ai","java","python","react","node"]; const health = ["gym","workout","run","exercise","yoga","cardio","diet","meditation"]; const work = ["meeting","client","project","deadline","report","deploy","bug","interview","job"]; const sc = study.filter(k => t.includes(k)).length; const hc = health.filter(k => t.includes(k)).length; const wc = work.filter(k => t.includes(k)).length; const max = Math.max(sc, hc, wc); if (max === 0) return "personal"; if (max === sc) return "study"; if (max === hc) return "health"; return "work"; };

function Dashboard({ view = "dashboard" }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const tk = darkMode ? DARK : LIGHT;
  const toggleTheme = () => setDarkMode(prev => { localStorage.setItem("darkMode", String(!prev)); return !prev; });

  // ✅ Check if admin from JWT
  const isAdmin = (() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return !!payload.isAdmin;
    } catch { return false; }
  })();

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("personal");
  const [autoCategory, setAutoCategory] = useState(true);
  const [autoPriority, setAutoPriority] = useState(true);
  const [aiPriority, setAiPriority] = useState(null);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editTask, setEditTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const aiTimerRef = useRef(null);
  const notifTimerRef = useRef(null);
  const navigate = useNavigate();
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
  useEffect(() => { if (!title) { setAutoCategory(true); setAutoPriority(true); } }, [title]);
  useEffect(() => () => clearTimeout(aiTimerRef.current), []);

  const overdueCount = tasks.filter(t => t.dueDate && t.status !== "completed" && new Date(t.dueDate) < new Date()).length;
  const pendingCount = tasks.filter(t => t.status === "pending").length;

  useEffect(() => {
    if (tasks.length === 0) return;
    setTimeout(() => {
      if (overdueCount > 0) {
        toast(`🚨 You have ${overdueCount} overdue task${overdueCount > 1 ? "s" : ""}!`, { icon: "⏰", style: { background: "#ef4444", color: "white", fontWeight: "600", borderRadius: "10px" }, duration: 5000 });
      } else if (pendingCount > 0) {
        toast(`📋 ${pendingCount} task${pendingCount > 1 ? "s" : ""} pending — keep going!`, { icon: "💪", style: { background: tk.accent, color: "white", fontWeight: "600", borderRadius: "10px" }, duration: 4000 });
      }
    }, 3000);
    notifTimerRef.current = setInterval(() => {
      if (overdueCount > 0) {
        toast(`🚨 Reminder: ${overdueCount} overdue task${overdueCount > 1 ? "s" : ""} need attention!`, { icon: "⏰", style: { background: "#ef4444", color: "white", fontWeight: "600", borderRadius: "10px" }, duration: 5000 });
      } else if (pendingCount > 0) {
        toast(`💪 Still ${pendingCount} task${pendingCount > 1 ? "s" : ""} to go — you got this!`, { icon: "📋", style: { background: tk.accent, color: "white", fontWeight: "600", borderRadius: "10px" }, duration: 4000 });
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(notifTimerRef.current);
  }, [tasks, overdueCount, pendingCount, tk.accent]);

  const predictPriorityAI = useCallback(async (val) => {
    if (!val || val.trim().length < 4) return;
    try {
      setPriorityLoading(true);
      const res = await axios.post(`${API_URL}/api/tasks/ai-priority`, { title: val }, { headers: { Authorization: `Bearer ${token}` } });
      setAiPriority(res.data.priority);
      if (autoPriority) setPriority(res.data.priority);
    } catch { } finally { setPriorityLoading(false); }
  }, [token, autoPriority]);

  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const highPriorityCount = tasks.filter(t => t.priority === "high").length;
  const highPendingCount = tasks.filter(t => t.priority === "high" && t.status !== "completed").length;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
  const productivityScore = Math.min(100, Math.round(completionRate * 0.6 + (pendingCount === 0 ? 20 : 0) + (highPendingCount === 0 ? 20 : 0)));
  const workloadScore = Math.min(100, pendingCount * 2 + highPendingCount * 5 + overdueCount * 8);
  const pressureStatus = workloadScore >= 80 ? { label: "Overloaded", color: "#ef4444", emoji: "🚨" } : workloadScore >= 40 ? { label: "Busy", color: "#f59e0b", emoji: "😬" } : { label: "Relaxed", color: "#22c55e", emoji: "😌" };
  const productivityMessage = overdueCount > 0 ? { text: "🚨 Clear overdue tasks first", color: "#ef4444" } : highPendingCount >= 3 ? { text: "⚠️ Too many high-priority tasks", color: "#f59e0b" } : completionRate >= 70 ? { text: "🚀 Excellent productivity!", color: "#22c55e" } : { text: "🙂 Keep going!", color: "#3b82f6" };

  const insights = [];
  if (overdueCount > 0) insights.push({ type: "warning", text: `${overdueCount} overdue tasks need attention` });
  if (highPendingCount > 0) insights.push({ type: "priority", text: `${highPendingCount} high priority tasks pending` });
  if (completionRate >= 60) insights.push({ type: "productivity", text: `Strong completion rate (${completionRate}%)` });
  if (!insights.length) insights.push({ type: "safe", text: "Everything is under control! 🎉" });

  const suggestions = [];
  if (overdueCount > 0) suggestions.push(`Finish ${overdueCount} overdue tasks first`);
  if (highPendingCount > 0) suggestions.push(`Complete ${highPendingCount} high priority tasks today`);
  if (pendingCount > 5) suggestions.push("Clear small tasks to reduce workload");
  if (completionRate > 70) suggestions.push("Great productivity — keep the momentum!");

  const todaysFocus = [...tasks].map(t => ({ ...t, focusScore: getTaskScore(t) })).filter(t => t.focusScore > 0).sort((a, b) => b.focusScore - a.focusScore).slice(0, 3);

  const getCurrentStreak = () => { let streak = 0; for (let i = 0; i < 30; i++) { const d = new Date(); d.setDate(d.getDate() - i); const day = d.toISOString().split("T")[0]; if (tasks.some(t => t.updatedAt?.startsWith(day) && t.status === "completed")) streak++; else break; } return streak; };
  const currentStreak = getCurrentStreak();
  const streakStatus = currentStreak >= 7 ? { text: "🔥 On fire!", color: "#ef4444" } : currentStreak >= 3 ? { text: "🚀 Great consistency!", color: "#22c55e" } : currentStreak >= 1 ? { text: "🙂 Keep going!", color: "#3b82f6" } : { text: "Complete a task today!", color: tk.muted };
  const getLast7DaysData = () => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const day = d.toISOString().split("T")[0]; return { day: d.toLocaleDateString("en-US", { weekday: "short" }), value: tasks.filter(t => t.updatedAt?.startsWith(day) && t.status === "completed").length }; });

  const addTask = async () => {
    if (!title.trim()) return;
    const tempId = Date.now();
    const finalCat = autoCategory && title.trim().length > 2 ? suggestCategory(title) : category;
    const optimistic = { _id: tempId, title, priority, status: "pending", category: finalCat, dueDate: dueDate || null, progress: 0, subtasks: [], createdAt: new Date() };
    setTasks(p => [optimistic, ...p]);
    setTitle(""); setDueDate(""); setCategory("personal"); setAutoCategory(true); setPriority("medium"); setAiPriority(null);
    try {
      const res = await axios.post(`${API_URL}/api/tasks`, { title: optimistic.title, priority: optimistic.priority, status: "pending", category: optimistic.category, dueDate: optimistic.dueDate }, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(p => p.map(t => t._id === tempId ? res.data : t));
      toast.success("Task added ✨");
    } catch { setTasks(p => p.filter(t => t._id !== tempId)); toast.error("Failed to add task"); }
  };

  const deleteTask = async (id) => { const prev = tasks; setTasks(p => p.filter(t => t._id !== id)); try { await axios.delete(`${API_URL}/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } }); } catch { setTasks(prev); toast.error("Delete failed"); } };
  const deleteAllTasks = async () => { if (!window.confirm("Delete ALL tasks?")) return; try { await axios.delete(`${API_URL}/api/tasks/delete-all`, { headers: { Authorization: `Bearer ${token}` } }); setTasks([]); toast.success("All tasks deleted 🗑️"); } catch { toast.error("Failed to delete all"); } };
  const toggleComplete = async (task) => { const newStatus = task.status === "completed" ? "pending" : "completed"; setTasks(p => p.map(t => t._id === task._id ? { ...t, status: newStatus } : t)); try { await axios.put(`${API_URL}/api/tasks/${task._id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } }); } catch { setTasks(p => p.map(t => t._id === task._id ? { ...t, status: task.status } : t)); toast.error("Update failed"); } };
  const openEditModal = (task) => { setEditTask(task); setEditTitle(task.title || ""); setEditPriority(task.priority || "medium"); setEditDueDate(task.dueDate ? task.dueDate.split("T")[0] : ""); };
  const handleUpdateTask = async () => { if (!editTitle.trim()) { toast.error("Title cannot be empty"); return; } try { await axios.put(`${API_URL}/api/tasks/${editTask._id}`, { title: editTitle, priority: editPriority, dueDate: editDueDate || null }, { headers: { Authorization: `Bearer ${token}` } }); toast.success("Task updated ✨"); setEditTask(null); fetchTasks(); } catch { toast.error("Update failed"); } };
  const handleLogout = () => { localStorage.removeItem("token"); window.location.href = "/"; };

  const filteredTasks = tasks.filter(task => { const mf = filter === "all" ? true : filter === "pending" ? task.status === "pending" : filter === "completed" ? task.status === "completed" : filter === "high" ? task.priority === "high" : task.category === filter; return mf && task.title.toLowerCase().includes(search.toLowerCase()); }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const cardVariants = { hidden: { opacity: 0, y: 30, scale: 0.97 }, visible: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] } }), exit: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2 } } };
  const panelVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4 } } };
  const statVariants = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.1 } }) };

  return (
    <>
      <style>{buildStyles(tk)}</style>
      <div className="dash-shell">

        {/* ── LEFT SIDEBAR ── */}
        <div className="dash-sidebar">
          <h2>Task<span>Flow</span></h2>

          {/* Main nav */}
          {[
            { label: "📊 Dashboard", path: "/dashboard", key: "dashboard" },
            { label: "📋 Tasks",     path: "/tasks",     key: "tasks" },
            { label: "📈 Insights",  path: "/insights",  key: "insights" },
            { label: "👤 Profile",   path: "/profile",   key: "profile" },
          ].map(item => (
            <button key={item.key} className={`nav-btn ${view === item.key ? "active" : ""}`} onClick={() => navigate(item.path)}>
              {item.label}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          {/* ✅ Admin section — only visible to admin */}
          {isAdmin && (
            <>
              <div className="admin-divider" />
              <div className="admin-section-label">Admin</div>

              {/* 🟢 Active Users */}
              <button
                className="admin-nav-btn"
                onClick={() => navigate("/admin/active-users")}
                style={{ color: "#22c55e" }}
              >
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "#22c55e", boxShadow: "0 0 6px #22c55e",
                  animation: "sidebarPulse 2s ease infinite", flexShrink: 0,
                }} />
                Active Users
              </button>

              {/* 🛡️ Admin Panel */}
              <button
                className="admin-nav-btn"
                onClick={() => navigate("/admin")}
                style={{ color: "#a78bfa" }}
              >
                🛡️ Admin Panel
              </button>
              <div className="admin-divider" />
            </>
          )}

          {/* Theme toggle + Logout */}
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode
              ? <><FaSun style={{ color: "#f59e0b", fontSize: "15px" }} /> Switch to Light</>
              : <><FaMoon style={{ color: tk.accent, fontSize: "14px" }} /> Switch to Dark</>
            }
          </button>
          <button className="nav-btn" style={{ color: "#ef4444", marginTop: "4px" }} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="dash-main">
          <div className="dash-topbar">
            <h1>{view === "dashboard" ? <>Overview <span>Dashboard</span></> : <>My <span>Tasks</span></>}</h1>
            {view === "tasks" && <button className="tb-btn danger" onClick={deleteAllTasks}>🗑 Delete All</button>}
          </div>

          {view === "dashboard" && (
            <>
              <div className="stats-grid">
                {[
                  { icon: "📝", val: totalTasks, label: "Total Tasks" },
                  { icon: "✅", val: completedCount, label: "Completed" },
                  { icon: "⏳", val: pendingCount, label: "Pending" },
                  { icon: "🔥", val: highPriorityCount, label: "High Priority" },
                ].map((s, i) => (
                  <motion.div className="stat-card" key={s.label} custom={i} variants={statVariants} initial="hidden" animate="visible" whileHover={{ y: -4, boxShadow: `0 8px 20px ${tk.accent}20`, transition: { duration: 0.2 } }}>
                    <div className="stat-icon">{s.icon}</div><h3>{s.val}</h3><p>{s.label}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div className="panel" variants={panelVariants} initial="hidden" animate="visible">
                <h3><FaChartLine style={{ color: tk.accent }} /> Weekly Productivity</h3>
                <div style={{ width: "100%", height: 200 }}>
                  <ResponsiveContainer minWidth={0}>
                    <LineChart data={getLast7DaysData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke={tk.chartGrid} />
                      <XAxis dataKey="day" stroke={tk.chartAxis} tick={{ fontSize: 12, fill: tk.chartAxis }} />
                      <YAxis allowDecimals={false} stroke={tk.chartAxis} tick={{ fontSize: 12, fill: tk.chartAxis }} />
                      <Tooltip contentStyle={{ background: tk.tooltipBg, border: `1px solid ${tk.tooltipBorder}`, borderRadius: "8px", color: tk.tooltipText }} />
                      <Line type="monotone" dataKey="value" stroke={tk.accent} strokeWidth={2.5} dot={{ r: 4, fill: tk.accent }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {todaysFocus.length > 0 && (
                <motion.div className="panel" style={{ background: tk.focusGrad, borderColor: `${tk.accent}40` }} variants={panelVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                  <h3>🔥 Today's Focus</h3>
                  {todaysFocus.map((task, i) => (
                    <motion.div key={task._id} className="focus-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} onClick={() => navigate(`/task/${task._id}`)}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: tk.text }}>{task.title}</div>
                      <div style={{ fontSize: "11px", color: tk.accent, marginTop: "2px" }}>{getFocusReason(task)}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <motion.div className="panel" variants={panelVariants} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
                <h3><FaRobot style={{ color: tk.accent }} /> AI Insights</h3>
                {insights.map((item, i) => {
                  const icon = item.type === "warning" ? <FaExclamationTriangle color="#f59e0b" /> : item.type === "priority" ? <FaFire color="#ef4444" /> : item.type === "productivity" ? <FaChartLine color="#22c55e" /> : <FaCheckCircle color="#22c55e" />;
                  return (<motion.div key={i} className="insight-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>{icon} {item.text}</motion.div>);
                })}
              </motion.div>

              {suggestions.length > 0 && (
                <motion.div className="panel" variants={panelVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                  <h3><FaLightbulb style={{ color: "#f59e0b" }} /> AI Suggestions</h3>
                  {suggestions.map((s, i) => (
                    <motion.div key={i} className="insight-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}><FaCheckCircle color="#22c55e" /> {s}</motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}

          {view === "tasks" && (
            <>
              <div className="add-task-row">
                <input className="task-input-field" placeholder="What needs to be done?" value={title}
                  onChange={(e) => { const val = e.target.value; setTitle(val); clearTimeout(aiTimerRef.current); aiTimerRef.current = setTimeout(() => predictPriorityAI(val), 600); if (val.trim().length > 2 && autoCategory) setCategory(suggestCategory(val)); }}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                />
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="task-select" />
                <select className="task-select" value={category} onChange={e => { setCategory(e.target.value); setAutoCategory(false); }}>
                  <option value="personal">🟢 Personal</option><option value="work">🔵 Work</option><option value="study">🟣 Study</option><option value="health">🔴 Health</option>
                </select>
                <select className="task-select" value={priority} onChange={e => { setPriority(e.target.value); setAutoPriority(false); }}>
                  <option value="low">🟢 Low</option><option value="medium">🟡 Medium</option><option value="high">🔴 High</option>
                </select>
                <button className="add-btn-main" onClick={addTask} disabled={!title.trim()}>+ Add Task</button>
              </div>

              {aiPriority && (<div className="ai-badge">🤖 AI suggests: <strong>{aiPriority}</strong>{priorityLoading && " (thinking...)"}</div>)}

              <div className="stats-grid">
                {[{ icon: "📝", val: totalTasks, label: "Total" }, { icon: "✅", val: completedCount, label: "Completed" }, { icon: "⏳", val: pendingCount, label: "Pending" }, { icon: "🔥", val: highPriorityCount, label: "High" }].map((s, i) => (
                  <motion.div className="stat-card" key={s.label} custom={i} variants={statVariants} initial="hidden" animate="visible" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                    <div className="stat-icon">{s.icon}</div><h3>{s.val}</h3><p>{s.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="filter-row">
                {["all","pending","completed","high","work","personal","study","health"].map(f => (
                  <button key={f} className={`filter-pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>

              <input className="search-bar" placeholder="🔍 Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />

              {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton" />)
              : filteredTasks.length === 0 ? (
                <div className="empty-state"><h3>📭 No tasks found</h3><p>Add a task or change your filter</p></div>
              ) : (
                <AnimatePresence>
                  {filteredTasks.map((task, i) => {
                    const dueStatus = getDueStatus(task.dueDate);
                    const risk = getRiskLevel(task);
                    const prog = getSubtaskProgress(task);
                    return (
                      <motion.div key={task._id} className={`task-card-item ${dueStatus}`} custom={i} variants={cardVariants} initial="hidden" animate="visible" exit="exit" layout
                        whileHover={{ y: -4, scale: 1.01, boxShadow: `0 10px 25px ${tk.accent}18`, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.98 }} onClick={() => navigate(`/task/${task._id}`)}>
                        <div className="task-meta-row">
                          <span className="chip" style={{ background: `${tk.accent}20`, color: tk.accent }}>{task.category}</span>
                          <span className="chip" style={{ background: risk === "critical" ? "#7f1d1d" : risk === "risk" ? "#78350f" : "#14532d", color: risk === "critical" ? "#fca5a5" : risk === "risk" ? "#fde68a" : "#86efac" }}>
                            {risk === "critical" ? "🔴 Critical" : risk === "risk" ? "🟡 At Risk" : "🟢 Safe"}
                          </span>
                          {task.dueDate && (<span className="chip" style={{ background: `${tk.accent}15`, color: tk.subtext }}>⏰ {getDueCountdown(task.dueDate)}</span>)}
                        </div>
                        <div className="task-title-row">
                          <span className={`task-title ${task.status === "completed" ? "done" : ""}`}>{task.title}</span>
                          <span className="priority-badge" style={{ background: getPriorityColor(task.priority) }}>{task.priority}</span>
                        </div>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: tk.muted, marginBottom: "4px" }}>
                            <span>{prog.text || "Progress"}</span><span>{prog.percent}%</span>
                          </div>
                          <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${prog.percent}%`, background: getProgressColor(prog.percent) }} /></div>
                        </div>
                        <div className="task-footer" onClick={e => e.stopPropagation()}>
                          <span style={{ fontSize: "11px", color: dueStatus === "overdue" ? "#ef4444" : dueStatus === "soon" ? "#f59e0b" : tk.muted }}>
                            {dueStatus === "overdue" ? "🔴 Overdue" : dueStatus === "soon" ? "🟡 Due soon" : "🟢 On track"}
                          </span>
                          <div className="task-actions">
                            <button className={`action-btn ${task.status === "completed" ? "undo" : "complete"}`} onClick={() => toggleComplete(task)}>{task.status === "completed" ? "Undo" : "✓ Done"}</button>
                            <button className="action-btn edit" onClick={() => openEditModal(task)}>Edit</button>
                            <button className="action-btn del" onClick={() => deleteTask(task._id)}>Delete</button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="dash-right">
          <motion.div className="widget" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <h4>🤖 AI Score</h4>
            <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
              <svg width="110" height="110">
                <circle cx="55" cy="55" r="46" stroke={tk.cardBorder} strokeWidth="9" fill="none" />
                <circle cx="55" cy="55" r="46" stroke={tk.accent} strokeWidth="9" fill="none" strokeDasharray={289} strokeDashoffset={289 - (289 * productivityScore) / 100} strokeLinecap="round" transform="rotate(-90 55 55)" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                <text x="55" y="62" textAnchor="middle" fontSize="22" fontWeight="800" fill={tk.accent} fontFamily="Syne">{productivityScore}</text>
              </svg>
            </div>
            <p style={{ textAlign: "center", fontSize: "13px", fontWeight: 600, color: productivityMessage.color }}>{productivityMessage.text}</p>
          </motion.div>

          <motion.div className="widget" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <h4>🔥 Streak</h4>
            <div className="streak-num" style={{ color: streakStatus.color }}>{currentStreak}</div>
            <p style={{ textAlign: "center", fontSize: "12px", color: tk.muted, marginTop: "2px" }}>days</p>
            <p style={{ textAlign: "center", fontSize: "13px", color: streakStatus.color, fontWeight: 600, marginTop: "6px" }}>{streakStatus.text}</p>
          </motion.div>

          <motion.div className="widget" style={{ borderColor: `${pressureStatus.color}40` }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <h4>⚖️ Workload</h4>
            <div style={{ fontSize: "22px", fontWeight: 800, color: pressureStatus.color, textAlign: "center" }}>{pressureStatus.emoji} {pressureStatus.label}</div>
            <p style={{ textAlign: "center", fontSize: "12px", color: tk.muted, marginTop: "6px" }}>Score: {workloadScore}/100</p>
          </motion.div>

          {view === "dashboard" && todaysFocus.length > 0 && (
            <motion.div className="widget" style={{ borderColor: `${tk.accent}40` }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
              <h4>🎯 Focus Now</h4>
              {todaysFocus.map(task => (
                <div key={task._id} className="focus-item" onClick={() => navigate(`/task/${task._id}`)}>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: tk.text }}>{task.title}</div>
                  <div style={{ fontSize: "11px", color: tk.accent, marginTop: "2px" }}>{getFocusReason(task)}</div>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div className="widget" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
            <h4>📊 Quick Stats</h4>
            {[
              { label: "Completion", val: `${completionRate}%`, color: completionRate > 70 ? "#22c55e" : "#f59e0b" },
              { label: "Overdue", val: overdueCount, color: overdueCount > 0 ? "#ef4444" : "#22c55e" },
              { label: "High Pending", val: highPendingCount, color: highPendingCount > 0 ? "#f59e0b" : "#22c55e" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: tk.muted }}>{s.label}</span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: s.color }}>{s.val}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editTask && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditTask(null)}>
            <motion.div className="modal-box" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <h3>✏️ Edit Task</h3>
              <input className="modal-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Task title" />
              <select className="modal-input" value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                <option value="low">🟢 Low</option><option value="medium">🟡 Medium</option><option value="high">🔴 High</option>
              </select>
              <input type="date" className="modal-input" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} />
              <div className="modal-actions">
                <button className="modal-save" onClick={handleUpdateTask}>Save Changes</button>
                <button className="modal-cancel" onClick={() => setEditTask(null)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Dashboard;