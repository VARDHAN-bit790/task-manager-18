import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

export default function ActiveUsers() {
  const navigate    = useNavigate();
  const token       = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/active-users`, { headers: authHeaders });
      setUsers(res.data);
      setLastRefresh(new Date());
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Admin access required");
        navigate("/dashboard");
      } else {
        toast.error("Failed to load active users");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchUsers, 60000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Styles ────────────────────────────────────────────
  const S = {
    page: {
      minHeight: "100vh",
      background: "#0d0d0d",
      color: "#e8e8ff",
      fontFamily: "'DM Sans', sans-serif",
    },
    topbar: {
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(13,13,13,0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid #2a2a3d",
      padding: "0 32px", height: "64px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    container: { maxWidth: "900px", margin: "0 auto", padding: "32px 24px" },
    panel: {
      background: "#161622", border: "1px solid #2a2a3d",
      borderRadius: "16px", padding: "24px", marginBottom: "20px",
    },
    input: {
      background: "#1e1e30", border: "1px solid #2a2a3d",
      borderRadius: "10px", padding: "10px 14px",
      color: "#e8e8ff", fontFamily: "'DM Sans', sans-serif",
      fontSize: "14px", outline: "none", width: "240px",
    },
    card: {
      background: "#1a1a2e",
      border: "1px solid #2a2a3d",
      borderRadius: "14px",
      padding: "16px 20px",
      marginBottom: "10px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      cursor: "pointer",
      transition: "all 0.18s ease",
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
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }
        .user-card:hover {
          background: #1e1e38 !important;
          border-color: #3a3a5a !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 10px 28px rgba(0,0,0,0.35) !important;
        }
        .refresh-btn:hover {
          background: #2a2a44 !important;
          transform: translateY(-1px) !important;
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Pulsing green dot */}
              <div style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 8px #22c55e",
                animation: "pulse 2s ease infinite",
              }} />
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: "17px", color: "#fff",
              }}>
                Active Users Today
              </span>
            </div>
          </div>

          {/* Refresh button */}
          <button
            className="refresh-btn"
            onClick={fetchUsers}
            disabled={loading}
            style={{
              background: "#1e1e30", border: "1px solid #2a2a3d",
              color: "#c8c8dc", padding: "8px 16px",
              borderRadius: "10px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, fontSize: "13px",
              marginTop: 0, minHeight: "unset",
              transition: "all 0.15s ease",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "⟳ Loading..." : "⟳ Refresh"}
          </button>
        </div>

        <div style={S.container}>

          {/* ── Header + Stats ── */}
          <div style={{ marginBottom: "28px", animation: "fadeUp 0.3s ease" }}>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: "26px", color: "#fff", marginBottom: "6px",
            }}>
              🟢 Who's Online Today
            </h1>
            <p style={{ color: "#555", fontSize: "13px" }}>
              Last refreshed: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 60s
            </p>
          </div>

          {/* ── Summary panel ── */}
          <div style={{
            ...S.panel,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            animation: "fadeUp 0.35s ease",
          }}>
            {[
              { icon: "🟢", label: "Active Today",   value: users.length,
                color: "#22c55e" },
              { icon: "📋", label: "Tasks Created",  value: users.reduce((a, u) => a + u.totalTasks, 0),
                color: "#6c63ff" },
              { icon: "✅", label: "Tasks Completed", value: users.reduce((a, u) => a + u.completedTasks, 0),
                color: "#38bdf8" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", marginBottom: "6px" }}>{s.icon}</div>
                <div style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: "28px", color: s.color,
                }}>
                  {loading ? <Skeleton h="28px" w="50px" r="8px" /> : s.value}
                </div>
                <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Search + List ── */}
          <div style={{ ...S.panel, animation: "fadeUp 0.45s ease" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px",
            }}>
              <h3 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: "15px", color: "#fff",
              }}>
                Users ({filtered.length})
              </h3>
              <input
                style={S.input}
                placeholder="🔍  Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* User cards */}
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ ...S.card, gap: "14px" }}>
                  <Skeleton w="44px" h="44px" r="12px" />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Skeleton h="16px" w="140px" />
                    <Skeleton h="12px" w="200px" />
                  </div>
                  <Skeleton h="24px" w="70px" r="20px" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>😴</div>
                <p style={{ fontSize: "15px", color: "#555" }}>
                  {search ? "No users match your search" : "No users logged in today yet"}
                </p>
              </div>
            ) : (
              filtered.map((user, i) => (
                <div
                  key={user._id}
                  className="user-card"
                  style={{ ...S.card, animationDelay: `${i * 0.05}s` }}
                  onClick={() => navigate(`/admin/users/${user._id}`)}
                >
                  {/* Avatar */}
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                    background: "linear-gradient(135deg,#6c63ff,#a78bfa)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "15px", fontWeight: 800, color: "#fff",
                    fontFamily: "'Syne', sans-serif",
                    position: "relative",
                  }}>
                    {initials(user.name)}
                    {/* Online dot */}
                    <div style={{
                      position: "absolute", bottom: "-2px", right: "-2px",
                      width: "12px", height: "12px", borderRadius: "50%",
                      background: "#22c55e", border: "2px solid #1a1a2e",
                      boxShadow: "0 0 6px #22c55e",
                    }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "14px", fontWeight: 600, color: "#e8e8ff",
                      marginBottom: "3px",
                    }}>
                      {user.name}
                    </div>
                    <div style={{
                      fontSize: "12px", color: "#555",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {user.email}
                    </div>
                  </div>

                  {/* Task stats */}
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{
                      fontSize: "16px", fontWeight: 700,
                      color: "#6c63ff", fontFamily: "'Syne', sans-serif",
                    }}>
                      {user.totalTasks}
                    </div>
                    <div style={{ fontSize: "10px", color: "#555" }}>tasks</div>
                  </div>

                  {/* Last login time */}
                  <div style={{
                    fontSize: "12px", color: "#22c55e", fontWeight: 600,
                    flexShrink: 0, textAlign: "right",
                  }}>
                    {timeAgo(user.lastLoginAt)}
                  </div>

                  {/* Arrow */}
                  <div style={{ color: "#333", fontSize: "16px", flexShrink: 0 }}>→</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}