import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, Legend
} from "recharts";
import {
  FaChartLine, FaChartPie, FaChartBar, FaFire,
  FaCheckCircle, FaExclamationTriangle, FaTasks, FaMoon, FaSun
} from "react-icons/fa";

const API_URL = "https://task-manager-18.onrender.com";

const DARK = {
  bg: "#0f0f13", sidebar: "#16161d", sidebarBorder: "#2a2a35",
  card: "#1a1a24", cardBorder: "#2a2a35", text: "#f0eee8",
  subtext: "#9998a8", muted: "#6b6a7a", accent: "#7c6af7",
  navActive: "#7c6af715", chartGrid: "#2a2a35", chartAxis: "#4a4a5a",
  tooltipBg: "#1a1a24", tooltipBorder: "#2a2a35", tooltipText: "#f0eee8",
  skeleton1: "#1a1a24", skeleton2: "#22222e",
};

const LIGHT = {
  bg: "#eef0f5", sidebar: "#ffffff", sidebarBorder: "#e2e4ed",
  card: "#ffffff", cardBorder: "#e2e4ed", text: "#1a1033",
  subtext: "#5a5f7a", muted: "#9fa3b8", accent: "#7c3aed",
  navActive: "#7c3aed12", chartGrid: "#e2e4ed", chartAxis: "#9fa3b8",
  tooltipBg: "#ffffff", tooltipBorder: "#e2e4ed", tooltipText: "#1a1033",
  skeleton1: "#e2e4ed", skeleton2: "#dfe1ec",
};

const buildStyles = (tk) => `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${tk.bg}; color: ${tk.text}; min-height: 100vh; transition: background 0.35s, color 0.35s; }

  .ins-shell { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }

  .ins-sidebar {
    background: ${tk.sidebar}; border-right: 1px solid ${tk.sidebarBorder};
    padding: 32px 20px; display: flex; flex-direction: column;
    gap: 4px; position: sticky; top: 0; height: 100vh;
    transition: background 0.35s; overflow-y: auto;
  }
  .ins-sidebar h2 { font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 800; color: ${tk.text}; padding: 0 12px; margin-bottom: 24px; letter-spacing: -0.5px; }
  .ins-sidebar h2 span { color: ${tk.accent}; }

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

  .ins-main { padding: 32px 28px; overflow-y: auto; background: ${tk.bg}; transition: background 0.35s; }

  .ins-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
  .ins-topbar h1 { font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 800; color: ${tk.text}; letter-spacing: -0.8px; }
  .ins-topbar h1 span { color: ${tk.accent}; }

  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .kpi-card { border-radius: 18px; padding: 22px; color: white; position: relative; overflow: hidden; }
  .kpi-card::after { content: ''; position: absolute; width: 80px; height: 80px; background: rgba(255,255,255,0.08); border-radius: 50%; bottom: -20px; right: -20px; }
  .kpi-card h3 { font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 900; letter-spacing: -1px; margin-bottom: 4px; }
  .kpi-card p { font-size: 13px; opacity: 0.85; font-weight: 500; }
  .kpi-icon { font-size: 20px; margin-bottom: 10px; opacity: 0.9; }

  .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .summary-card { background: ${tk.card}; border: 1px solid ${tk.cardBorder}; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 14px; transition: background 0.35s; }
  .summary-icon { width: 44px; height: 44px; border-radius: 12px; background: ${tk.navActive}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .summary-label { font-size: 11px; color: ${tk.muted}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-value { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 800; color: ${tk.text}; margin-top: 2px; }

  .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .chart-card { background: ${tk.card}; border: 1px solid ${tk.cardBorder}; border-radius: 20px; padding: 24px; transition: background 0.35s; }
  .chart-card.full { grid-column: 1 / -1; }
  .chart-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: ${tk.text}; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .skel { border-radius: 16px; background: linear-gradient(90deg, ${tk.skeleton1} 25%, ${tk.skeleton2} 37%, ${tk.skeleton1} 63%); background-size: 800px 100%; animation: shimmer 1.4s infinite; }
`;

const CustomTooltip = ({ active, payload, label, tk }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: tk.tooltipBg, border: `1px solid ${tk.tooltipBorder}`, borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: tk.tooltipText, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const CATEGORY_COLORS = { work: "#3b82f6", study: "#8b5cf6", health: "#ef4444", personal: "#22c55e" };

function Insights() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const tk = darkMode ? DARK : LIGHT;
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const toggleTheme = () => setDarkMode(prev => { localStorage.setItem("darkMode", String(!prev)); return !prev; });

  const isAdmin = (() => {
    try { const p = JSON.parse(atob(token.split(".")[1])); return !!p.isAdmin; } catch { return false; }
  })();

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data);
    } catch { toast.error("Failed to load insights"); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const pending = tasks.filter(t => t.status === "pending").length;
  const overdue = tasks.filter(t => t.dueDate && t.status !== "completed" && new Date(t.dueDate) < new Date()).length;
  const highPending = tasks.filter(t => t.priority === "high" && t.status !== "completed").length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const productivityScore = Math.min(100, Math.round(completionRate * 0.6 + (pending === 0 ? 20 : 0) + (highPending === 0 ? 20 : 0)));

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const day = d.toISOString().split("T")[0];
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      Completed: tasks.filter(t => t.updatedAt?.startsWith(day) && t.status === "completed").length,
      Created: tasks.filter(t => t.createdAt?.startsWith(day)).length,
    };
  });

  const categoryData = ["work", "study", "health", "personal"].map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: tasks.filter(t => t.category === cat).length,
    color: CATEGORY_COLORS[cat],
  })).filter(c => c.value > 0);

  const priorityData = [
    { name: "High", value: tasks.filter(t => t.priority === "high").length, color: "#ef4444" },
    { name: "Medium", value: tasks.filter(t => t.priority === "medium").length, color: "#f59e0b" },
    { name: "Low", value: tasks.filter(t => t.priority === "low").length, color: "#22c55e" },
  ].filter(p => p.value > 0);

  const categoryCompletion = ["work", "study", "health", "personal"].map(cat => {
    const catTasks = tasks.filter(t => t.category === cat);
    const catCompleted = catTasks.filter(t => t.status === "completed").length;
    return { name: cat.charAt(0).toUpperCase() + cat.slice(1), Completed: catCompleted, Pending: catTasks.length - catCompleted };
  }).filter(c => c.Completed + c.Pending > 0);

  const kpiCards = [
    { label: "Completion Rate", value: `${completionRate}%`, icon: <FaCheckCircle />, bg: "linear-gradient(135deg,#7c6af7,#a78bfa)", shadow: "rgba(124,106,247,0.3)" },
    { label: "Productivity Score", value: productivityScore, icon: <FaChartLine />, bg: "linear-gradient(135deg,#22c55e,#16a34a)", shadow: "rgba(34,197,94,0.3)" },
    { label: "Overdue Tasks", value: overdue, icon: <FaExclamationTriangle />, bg: "linear-gradient(135deg,#ef4444,#dc2626)", shadow: "rgba(239,68,68,0.3)" },
    { label: "High Priority", value: highPending, icon: <FaFire />, bg: "linear-gradient(135deg,#f59e0b,#d97706)", shadow: "rgba(245,158,11,0.3)" },
  ];

  const pv = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08 } }) };

  const navItems = [
    { label: "📊 Dashboard", path: "/dashboard" },
    { label: "📋 Tasks",     path: "/tasks" },
    { label: "📈 Insights",  path: "/insights" },
    { label: "👤 Profile",   path: "/profile" },
  ];

  return (
    <>
      <style>{buildStyles(tk)}</style>
      <div className="ins-shell">

        {/* ── SIDEBAR ── */}
        <div className="ins-sidebar">
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
            {darkMode
              ? <><FaSun style={{ color: "#f59e0b", fontSize: "15px" }} /> Switch to Light</>
              : <><FaMoon style={{ color: tk.accent, fontSize: "14px" }} /> Switch to Dark</>
            }
          </button>
          <button className="nav-btn" style={{ color: "#ef4444", marginTop: "4px" }}
            onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}>
            🚪 Logout
          </button>
        </div>

        {/* ── MAIN ── */}
        <div className="ins-main">
          <motion.div className="ins-topbar" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1>📊 <span>Insights</span></h1>
            <div style={{ fontSize: "13px", color: tk.muted, fontWeight: 500 }}>
              Your productivity overview
            </div>
          </motion.div>

          {loading ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                {[...Array(4)].map((_, i) => <div key={i} className="skel" style={{ height: 110 }} />)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[...Array(4)].map((_, i) => <div key={i} className="skel" style={{ height: 260 }} />)}
              </div>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="kpi-grid">
                {kpiCards.map((k, i) => (
                  <motion.div key={k.label} className="kpi-card"
                    style={{ background: k.bg, boxShadow: `0 10px 28px ${k.shadow}` }}
                    custom={i} variants={pv} initial="hidden" animate="visible"
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <div className="kpi-icon">{k.icon}</div>
                    <h3>{k.value}</h3>
                    <p>{k.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <div className="summary-grid">
                {[
                  { icon: <FaTasks color={tk.accent} />, label: "Total Tasks", value: total },
                  { icon: <FaCheckCircle color="#22c55e" />, label: "Completed", value: completed },
                  { icon: <FaFire color="#f59e0b" />, label: "Pending", value: pending },
                ].map((s, i) => (
                  <motion.div key={s.label} className="summary-card"
                    custom={i + 4} variants={pv} initial="hidden" animate="visible"
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  >
                    <div className="summary-icon">{s.icon}</div>
                    <div>
                      <div className="summary-label">{s.label}</div>
                      <div className="summary-value">{s.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="charts-grid">

                {/* Weekly trend */}
                <motion.div className="chart-card full" custom={7} variants={pv} initial="hidden" animate="visible">
                  <div className="chart-title"><FaChartLine color={tk.accent} /> Weekly Activity Trend</div>
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer minWidth={0}>
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={tk.chartGrid} />
                        <XAxis dataKey="day" stroke={tk.chartAxis} tick={{ fontSize: 12, fill: tk.chartAxis }} />
                        <YAxis allowDecimals={false} stroke={tk.chartAxis} tick={{ fontSize: 12, fill: tk.chartAxis }} />
                        <Tooltip content={<CustomTooltip tk={tk} />} />
                        <Legend wrapperStyle={{ color: tk.subtext, fontSize: 12 }} />
                        <Line type="monotone" dataKey="Completed" stroke={tk.accent} strokeWidth={2.5} dot={{ r: 4, fill: tk.accent }} />
                        <Line type="monotone" dataKey="Created" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: "#a855f7" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Category pie */}
                <motion.div className="chart-card" custom={8} variants={pv} initial="hidden" animate="visible">
                  <div className="chart-title"><FaChartPie color={tk.accent} /> Tasks by Category</div>
                  {categoryData.length === 0
                    ? <div style={{ textAlign: "center", padding: "40px", color: tk.muted }}>No data yet</div>
                    : <div style={{ width: "100%", height: 220 }}>
                        <ResponsiveContainer minWidth={0}>
                          <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                              {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip tk={tk} />} />
                            <Legend wrapperStyle={{ color: tk.subtext, fontSize: 12 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                  }
                </motion.div>

                {/* Priority pie */}
                <motion.div className="chart-card" custom={9} variants={pv} initial="hidden" animate="visible">
                  <div className="chart-title"><FaChartPie color="#f59e0b" /> Tasks by Priority</div>
                  {priorityData.length === 0
                    ? <div style={{ textAlign: "center", padding: "40px", color: tk.muted }}>No data yet</div>
                    : <div style={{ width: "100%", height: 220 }}>
                        <ResponsiveContainer minWidth={0}>
                          <PieChart>
                            <Pie data={priorityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                              {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip tk={tk} />} />
                            <Legend wrapperStyle={{ color: tk.subtext, fontSize: 12 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                  }
                </motion.div>

                {/* Completion by category bar */}
                <motion.div className="chart-card full" custom={10} variants={pv} initial="hidden" animate="visible">
                  <div className="chart-title"><FaChartBar color={tk.accent} /> Completion by Category</div>
                  {categoryCompletion.length === 0
                    ? <div style={{ textAlign: "center", padding: "40px", color: tk.muted }}>No data yet</div>
                    : <div style={{ width: "100%", height: 220 }}>
                        <ResponsiveContainer minWidth={0}>
                          <BarChart data={categoryCompletion} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke={tk.chartGrid} />
                            <XAxis dataKey="name" stroke={tk.chartAxis} tick={{ fontSize: 12, fill: tk.chartAxis }} />
                            <YAxis allowDecimals={false} stroke={tk.chartAxis} tick={{ fontSize: 12, fill: tk.chartAxis }} />
                            <Tooltip content={<CustomTooltip tk={tk} />} />
                            <Legend wrapperStyle={{ color: tk.subtext, fontSize: 12 }} />
                            <Bar dataKey="Completed" fill={tk.accent} radius={[6, 6, 0, 0]} />
                            <Bar dataKey="Pending" fill={darkMode ? "#2a2a4a" : "#dfe1ec"} radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                  }
                </motion.div>

              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Insights;