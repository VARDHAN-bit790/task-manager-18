import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ─── Helpers ───────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return "Never";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

// ─── Skeleton ──────────────────────────────────────────────
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

// ─── Stat Card ─────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, loading }) {
  return (
    <div style={{
      background: "#161622",
      border: "1px solid #2a2a3d",
      borderRadius: "16px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.4)`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
    >
      <div style={{
        width: "40px", height: "40px", borderRadius: "12px",
        background: `${color}22`, display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: "20px",
      }}>
        {icon}
      </div>
      {loading ? <Skeleton h="28px" w="60px" /> : (
        <div style={{ fontSize: "28px", fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
          {value}
        </div>
      )}
      <div style={{ fontSize: "13px", color: "#888", fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: color, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────
export default function AdminDashboard() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");

  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all"); // all | active | banned
  const [confirmId, setConfirmId] = useState(null); // for delete confirmation

  const authHeaders = { Authorization: `Bearer ${token}` };

  // ── Fetch ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`,  { headers: authHeaders }),
        axios.get(`${API_URL}/api/admin/users`,  { headers: authHeaders }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Admin access required");
        navigate("/dashboard");
      } else {
        toast.error("Failed to load admin data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Ban / Unban ────────────────────────────────────────
  const toggleBan = async (userId, currentBan, name) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/users/${userId}/ban`,
        {}, { headers: authHeaders }
      );
      setUsers((prev) => prev.map((u) =>
        u._id === userId ? { ...u, isBanned: res.data.isBanned } : u
      ));
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to update ban status");
    }
  };

  // ── Delete ─────────────────────────────────────────────
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, { headers: authHeaders });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setConfirmId(null);
      toast.success("User deleted successfully");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  // ── Filter ─────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"    ? true :
      filter === "banned" ? u.isBanned :
      filter === "active" ? !u.isBanned : true;
    return matchSearch && matchFilter;
  });

  // ── Chart data ─────────────────────────────────────────
  const chartData = stats?.signupTrend?.map((d) => ({
    date: d._id?.slice(5),
    signups: d.count,
  })) || [];

  // ── Styles ─────────────────────────────────────────────
  const S = {
    page: {
      minHeight: "100vh",
      background: "#0d0d0d",
      color: "#e8e8ff",
      fontFamily: "'DM Sans', sans-serif",
      padding: "0",
    },
    topbar: {
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(13,13,13,0.9)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid #2a2a3d",
      padding: "0 32px",
      height: "64px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "16px",
      marginBottom: "32px",
    },
    panel: {
      background: "#161622",
      border: "1px solid #2a2a3d",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "24px",
    },
    panelTitle: {
      fontFamily: "'Syne', sans-serif",
      fontWeight: 800, fontSize: "16px",
      color: "#fff", marginBottom: "20px",
    },
    input: {
      background: "#1e1e30", border: "1px solid #2a2a3d",
      borderRadius: "10px", padding: "10px 14px",
      color: "#e8e8ff", fontFamily: "'DM Sans', sans-serif",
      fontSize: "14px", outline: "none", width: "260px",
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
    row: {
      display: "grid",
      gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr",
      gap: "12px", alignItems: "center",
      padding: "14px 16px",
      borderRadius: "12px",
      transition: "background 0.15s ease",
    },
    badge: (banned) => ({
      display: "inline-block",
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11px", fontWeight: 700,
      background: banned ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
      color: banned ? "#ef4444" : "#22c55e",
    }),
    actionBtn: (color) => ({
      padding: "6px 12px", borderRadius: "8px", border: "none",
      background: `${color}22`, color: color,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600, fontSize: "12px",
      cursor: "pointer", marginTop: 0, minHeight: "unset",
      transition: "all 0.15s ease",
    }),
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
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .admin-row:hover { background: #1e1e30 !important; }
        .admin-action-btn:hover { filter: brightness(1.2); transform: translateY(-1px); }
        @media (max-width: 768px) {
          .admin-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .admin-user-row   { grid-template-columns: 1fr 1fr !important; }
          .admin-col-hide   { display: none !important; }
        }
      `}</style>

      <div style={S.page}>
        {/* ── Topbar ── */}
        <div style={S.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "10px",
              background: "linear-gradient(135deg,#6c63ff,#a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px",
            }}>🛡️</div>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: "18px", color: "#fff",
            }}>Admin Panel</span>
            <span style={{
              background: "rgba(108,99,255,0.2)", color: "#a78bfa",
              padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
            }}>SUPER ADMIN</span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "#1e1e30", border: "1px solid #2a2a3d",
              color: "#c8c8dc", padding: "8px 16px",
              borderRadius: "10px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, fontSize: "13px",
              marginTop: 0, minHeight: "unset",
            }}
          >
            ← Back to App
          </button>
        </div>

        <div style={S.container}>

          {/* ── Page title ── */}
          <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease" }}>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: "28px", color: "#fff", marginBottom: "4px",
            }}>
              Platform Overview
            </h1>
            <p style={{ color: "#666688", fontSize: "14px" }}>
              Monitor users, activity, and platform health
            </p>
          </div>

          {/* ── Stat Cards ── */}
          <div style={S.statsGrid} className="admin-stats-grid">
            <StatCard icon="👥" label="Total Users"     value={stats?.totalUsers     ?? "—"} color="#6c63ff" loading={loading} sub={`+${stats?.newUsersToday ?? 0} today`} />
            <StatCard icon="🟢" label="Active Today"    value={stats?.activeToday    ?? "—"} color="#22c55e" loading={loading} sub="logged in today" />
            <StatCard icon="📋" label="Total Tasks"     value={stats?.totalTasks     ?? "—"} color="#f59e0b" loading={loading} sub={`${stats?.completionRate ?? 0}% done`} />
            <StatCard icon="📅" label="New This Week"   value={stats?.newUsersThisWeek ?? "—"} color="#38bdf8" loading={loading} sub="new signups" />
            <StatCard icon="🚫" label="Banned Users"    value={stats?.bannedUsers    ?? "—"} color="#ef4444" loading={loading} />
          </div>

          {/* ── Signup Trend Chart ── */}
          <div style={{ ...S.panel, animation: "fadeUp 0.5s ease" }}>
            <div style={S.panelTitle}>📈 Signup Trend (Last 7 Days)</div>
            {loading ? (
              <Skeleton h="180px" r="12px" />
            ) : chartData.length === 0 ? (
              <p style={{ color: "#555", textAlign: "center", padding: "40px 0" }}>No signup data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={180} minWidth={0}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
                  <XAxis dataKey="date" tick={{ fill: "#666688", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#666688", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#161622", border: "1px solid #2a2a3d", borderRadius: "10px", color: "#e8e8ff" }}
                    cursor={{ stroke: "#6c63ff", strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone" dataKey="signups" stroke="#6c63ff"
                    strokeWidth={2.5} dot={{ fill: "#6c63ff", r: 4 }}
                    activeDot={{ r: 6, fill: "#a78bfa" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Users Table ── */}
          <div style={{ ...S.panel, animation: "fadeUp 0.6s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div style={S.panelTitle}>👤 All Users ({filteredUsers.length})</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <input
                  style={S.input}
                  placeholder="🔍  Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {["all", "active", "banned"].map((f) => (
                  <button key={f} style={S.filterBtn(filter === f)} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Header */}
            <div style={{ ...S.row, background: "#1a1a2e", marginBottom: "8px" }} className="admin-user-row">
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#666688", textTransform: "uppercase", letterSpacing: "0.8px" }}>User</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#666688", textTransform: "uppercase", letterSpacing: "0.8px" }} className="admin-col-hide">Email</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#666688", textTransform: "uppercase", letterSpacing: "0.8px" }} className="admin-col-hide">Tasks</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#666688", textTransform: "uppercase", letterSpacing: "0.8px" }} className="admin-col-hide">Last Login</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#666688", textTransform: "uppercase", letterSpacing: "0.8px" }}>Status</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#666688", textTransform: "uppercase", letterSpacing: "0.8px" }}>Actions</span>
            </div>

            {/* Table Rows */}
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ ...S.row, marginBottom: "8px" }}>
                  <Skeleton h="36px" r="10px" />
                  <Skeleton h="16px" w="140px" />
                  <Skeleton h="16px" w="40px" />
                  <Skeleton h="16px" w="60px" />
                  <Skeleton h="24px" w="60px" r="20px" />
                  <Skeleton h="28px" w="80px" r="8px" />
                </div>
              ))
            ) : filteredUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "#555" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="admin-row admin-user-row"
                  onClick={() => navigate(`/admin/users/${user._id}`)}
                  style={{ ...S.row, marginBottom: "6px", borderRadius: "12px", cursor: "pointer" }}
                >
                  {/* Name + avatar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                      background: user.isBanned
                        ? "rgba(239,68,68,0.2)"
                        : "linear-gradient(135deg,#6c63ff,#a78bfa)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: 700, color: "#fff",
                    }}>
                      {initials(user.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#e8e8ff" }}>{user.name}</div>
                      <div style={{ fontSize: "11px", color: "#555" }}>
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ fontSize: "13px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="admin-col-hide">
                    {user.email}
                  </div>

                  {/* Task stats */}
                  <div style={{ fontSize: "13px", color: "#c8c8dc" }} className="admin-col-hide">
                    <span style={{ fontWeight: 700, color: "#fff" }}>{user.totalTasks}</span>
                    <span style={{ color: "#555" }}> tasks</span>
                    <br />
                    <span style={{ fontSize: "11px", color: "#22c55e" }}>{user.completionRate}% done</span>
                  </div>

                  {/* Last login */}
                  <div style={{ fontSize: "12px", color: "#666688" }} className="admin-col-hide">
                    {timeAgo(user.lastLoginAt)}
                  </div>

                  {/* Status badge */}
                  <div>
                    <span style={S.badge(user.isBanned)}>
                      {user.isBanned ? "Banned" : "Active"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button
                      className="admin-action-btn"
                      style={S.actionBtn(user.isBanned ? "#22c55e" : "#f59e0b")}
                      onClick={() => toggleBan(user._id, user.isBanned, user.name)}
                      title={user.isBanned ? "Unban user" : "Ban user"}
                    >
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>

                    {confirmId === user._id ? (
                      <>
                        <button
                          className="admin-action-btn"
                          style={S.actionBtn("#ef4444")}
                          onClick={() => deleteUser(user._id)}
                        >Sure?</button>
                        <button
                          className="admin-action-btn"
                          style={S.actionBtn("#555")}
                          onClick={() => setConfirmId(null)}
                        >No</button>
                      </>
                    ) : (
                      <button
                        className="admin-action-btn"
                        style={S.actionBtn("#ef4444")}
                        onClick={() => setConfirmId(user._id)}
                        title="Delete user"
                      >Delete</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}