import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function timeAgo(date) {
  if (!date) return "No date";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Skeleton({ w = "100%", h = "16px", r = "8px" }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "linear-gradient(90deg,#2a2a3d 25%,#3a3a55 50%,#2a2a3d 75%)",
      backgroundSize: "200% 100%",
      animation: "skeleton-loading 1.4s ease infinite",
    }} />
  );
}

const PRIORITY_COLORS = {
  high:   { bg: "rgba(239,68,68,0.12)",   text: "#ef4444" },
  medium: { bg: "rgba(245,158,11,0.12)",  text: "#f59e0b" },
  low:    { bg: "rgba(34,197,94,0.12)",   text: "#22c55e" },
};

const CATEGORY_ICONS = {
  work:     "💼",
  personal: "👤",
  study:    "📚",
  health:   "💪",
};

export default function AdminUserTasks() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const token      = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [user,    setUser]    = useState(null);
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all"); // all | pending | completed
  const [search,  setSearch]  = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/users/${id}`,       { headers: authHeaders }),
        axios.get(`${API_URL}/api/admin/users/${id}/tasks`, { headers: authHeaders }),
      ]);
      setUser(userRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Admin access required");
        navigate("/dashboard");
      } else {
        toast.error("Failed to load user data");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredTasks = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"       ? true :
      filter === "completed" ? t.status === "completed" :
      filter === "pending"   ? t.status === "pending" : true;
    return matchSearch && matchFilter;
  });

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount   = tasks.filter((t) => t.status === "pending").length;
  const completionRate = tasks.length > 0
    ? Math.round((completedCount / tasks.length) * 100) : 0;

  // ── Styles ──────────────────────────────────────────────
  const S = {
    page: {
      minHeight: "100vh",
      background: "#0d0d0d",
      color: "#e8e8ff",
      fontFamily: "'DM Sans', sans-serif",
    },
    topbar: {
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(13,13,13,0.9)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid #2a2a3d",
      padding: "0 32px", height: "64px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    container: { maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" },
    panel: {
      background: "#161622", border: "1px solid #2a2a3d",
      borderRadius: "16px", padding: "24px", marginBottom: "24px",
    },
    filterBtn: (active) => ({
      padding: "8px 16px", borderRadius: "8px", border: "none",
      background: active ? "#6c63ff" : "#1e1e30",
      color: active ? "#fff" : "#888",
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600, fontSize: "13px",
      cursor: "pointer", marginTop: 0, minHeight: "unset",
      transition: "all 0.15s ease",
    }),
    input: {
      background: "#1e1e30", border: "1px solid #2a2a3d",
      borderRadius: "10px", padding: "10px 14px",
      color: "#e8e8ff", fontFamily: "'DM Sans', sans-serif",
      fontSize: "14px", outline: "none", width: "240px",
    },
    taskCard: {
      background: "#1a1a2e", border: "1px solid #2a2a3d",
      borderRadius: "14px", padding: "18px 20px",
      marginBottom: "10px",
      transition: "transform 0.18s ease, box-shadow 0.18s ease",
      cursor: "default",
      animation: "fadeUp 0.3s ease both",
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        @keyframes skeleton-loading {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .task-row:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 10px 28px rgba(0,0,0,0.4) !important;
          border-color: #3a3a5a !important;
        }
        @media (max-width: 768px) {
          .user-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .task-meta { flex-wrap: wrap !important; }
        }
      `}</style>

      <div style={S.page}>

        {/* ── Topbar ── */}
        <div style={S.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => navigate("/admin")}
              style={{
                background: "#1e1e30", border: "1px solid #2a2a3d",
                color: "#c8c8dc", padding: "8px 14px",
                borderRadius: "10px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600, fontSize: "13px",
                marginTop: 0, minHeight: "unset",
              }}
            >
              ← Admin Panel
            </button>
            <span style={{ color: "#2a2a3d" }}>|</span>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, fontSize: "17px", color: "#fff",
            }}>
              {loading ? "Loading..." : `${user?.name}'s Tasks`}
            </span>
          </div>
          <span style={{
            background: "rgba(108,99,255,0.2)", color: "#a78bfa",
            padding: "3px 12px", borderRadius: "20px",
            fontSize: "11px", fontWeight: 700,
          }}>
            🛡️ ADMIN VIEW
          </span>
        </div>

        <div style={S.container}>

          {/* ── User Profile Card ── */}
          <div style={{ ...S.panel, animation: "fadeUp 0.3s ease" }}>
            {loading ? (
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <Skeleton w="64px" h="64px" r="16px" />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Skeleton w="160px" h="22px" />
                  <Skeleton w="220px" h="16px" />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                {/* Avatar */}
                <div style={{
                  width: "64px", height: "64px", borderRadius: "16px", flexShrink: 0,
                  background: "linear-gradient(135deg,#6c63ff,#a78bfa)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px", fontWeight: 800, color: "#fff",
                  fontFamily: "'Syne', sans-serif",
                }}>
                  {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 800,
                    fontSize: "22px", color: "#fff", marginBottom: "4px",
                  }}>
                    {user?.name}
                  </h2>
                  <p style={{ color: "#666688", fontSize: "14px" }}>{user?.email}</p>
                  <p style={{ color: "#555", fontSize: "12px", marginTop: "4px" }}>
                    Joined {new Date(user?.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    {" · "} Last login {timeAgo(user?.lastLoginAt)}
                  </p>
                </div>

                {/* Status badge */}
                <div style={{
                  padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
                  background: user?.isBanned ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                  color: user?.isBanned ? "#ef4444" : "#22c55e",
                }}>
                  {user?.isBanned ? "🚫 Banned" : "✅ Active"}
                </div>
              </div>
            )}
          </div>

          {/* ── Stats Row ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px", marginBottom: "24px",
          }} className="user-stats-grid">
            {[
              { icon: "📋", label: "Total Tasks",  value: tasks.length,    color: "#6c63ff" },
              { icon: "✅", label: "Completed",    value: completedCount,  color: "#22c55e" },
              { icon: "⏳", label: "Pending",      value: pendingCount,    color: "#f59e0b" },
              { icon: "📊", label: "Completion",   value: `${completionRate}%`, color: "#38bdf8" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "#161622", border: "1px solid #2a2a3d",
                borderRadius: "14px", padding: "18px",
                animation: `fadeUp ${0.3 + i * 0.08}s ease both`,
              }}>
                <div style={{ fontSize: "22px", marginBottom: "8px" }}>{s.icon}</div>
                <div style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: "24px", color: s.color,
                }}>
                  {loading ? <Skeleton h="28px" w="50px" /> : s.value}
                </div>
                <div style={{ fontSize: "12px", color: "#666688", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Tasks List ── */}
          <div style={{ ...S.panel, animation: "fadeUp 0.5s ease" }}>
            {/* Header */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "20px",
              flexWrap: "wrap", gap: "12px",
            }}>
              <h3 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: "16px", color: "#fff",
              }}>
                📋 All Tasks ({filteredTasks.length})
              </h3>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <input
                  style={S.input}
                  placeholder="🔍  Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {["all", "pending", "completed"].map((f) => (
                  <button key={f} style={S.filterBtn(filter === f)} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Cards */}
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ ...S.taskCard, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <Skeleton h="18px" w="60%" />
                  <Skeleton h="14px" w="40%" />
                  <Skeleton h="8px"  r="20px" />
                </div>
              ))
            ) : filteredTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
                <p style={{ fontSize: "15px" }}>No tasks found</p>
              </div>
            ) : (
              filteredTasks.map((task, i) => {
                const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low;
                const isDone = task.status === "completed";
                return (
                  <div
                    key={task._id}
                    className="task-row"
                    style={{ ...S.taskCard, animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Title row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                        {/* Status dot */}
                        <div style={{
                          width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0,
                          background: isDone ? "#22c55e" : "#f59e0b",
                          boxShadow: `0 0 6px ${isDone ? "#22c55e" : "#f59e0b"}`,
                        }} />
                        <span style={{
                          fontSize: "15px", fontWeight: 600,
                          color: isDone ? "#555" : "#e8e8ff",
                          textDecoration: isDone ? "line-through" : "none",
                        }}>
                          {task.title}
                        </span>
                      </div>

                      {/* Priority badge */}
                      <span style={{
                        padding: "3px 10px", borderRadius: "20px",
                        fontSize: "11px", fontWeight: 700,
                        background: pc.bg, color: pc.text,
                        textTransform: "capitalize", flexShrink: 0,
                      }}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p style={{
                        fontSize: "13px", color: "#555",
                        marginBottom: "10px", lineHeight: "1.5",
                      }}>
                        {task.description}
                      </p>
                    )}

                    {/* Progress bar */}
                    <div style={{
                      height: "6px", background: "#2a2a3d",
                      borderRadius: "20px", overflow: "hidden", marginBottom: "12px",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: "20px",
                        width: `${task.progress || 0}%`,
                        background: isDone
                          ? "linear-gradient(90deg,#22c55e,#16a34a)"
                          : "linear-gradient(90deg,#6c63ff,#a78bfa)",
                        transition: "width 0.5s ease",
                      }} />
                    </div>

                    {/* Meta info */}
                    <div style={{
                      display: "flex", gap: "14px",
                      alignItems: "center", flexWrap: "wrap",
                    }} className="task-meta">
                      <span style={{ fontSize: "12px", color: "#555" }}>
                        {CATEGORY_ICONS[task.category] || "📌"} {task.category}
                      </span>
                      <span style={{ fontSize: "12px", color: "#555" }}>
                        📊 {task.progress || 0}% done
                      </span>
                      {task.dueDate && (
                        <span style={{
                          fontSize: "12px",
                          color: new Date(task.dueDate) < new Date() && !isDone
                            ? "#ef4444" : "#555",
                        }}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                          {new Date(task.dueDate) < new Date() && !isDone && " ⚠️ Overdue"}
                        </span>
                      )}
                      {task.subtasks?.length > 0 && (
                        <span style={{ fontSize: "12px", color: "#555" }}>
                          ✅ {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                        </span>
                      )}
                      <span style={{ fontSize: "12px", color: "#444", marginLeft: "auto" }}>
                        Created {timeAgo(task.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}