import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/dashboard",      label: "Dashboard",    icon: "📊" },
  { path: "/tasks",          label: "Tasks",        icon: "📋" },
  { path: "/insights",       label: "Insights",     icon: "📈" },
  { path: "/profile",        label: "Profile",      icon: "👤" },
];

function Sidebar({ darkMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Check if current user is admin from JWT
  const isAdmin = (() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return !!payload.isAdmin;
    } catch { return false; }
  })();

  const bg       = darkMode ? "#161622" : "#ffffff";
  const border   = darkMode ? "#2a2a3d" : "#e8ecf4";
  const text      = darkMode ? "#c8c8dc" : "#4a4a6a";
  const activeText = darkMode ? "#ffffff" : "#1a1a2e";
  const activeBg  = darkMode ? "#2a2a4a" : "#eef0ff";
  const activeBorder = "#6c63ff";
  const hoverBg   = darkMode ? "#1e1e30" : "#f5f6ff";
  const titleColor = darkMode ? "#ffffff" : "#1a1a2e";
  const dotColor  = "#6c63ff";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

        .sidebar-nav-btn {
          transition: background 0.18s ease, color 0.18s ease, transform 0.15s ease;
        }
        .sidebar-nav-btn:hover {
          transform: translateX(4px);
        }
        .sidebar-nav-btn:active {
          transform: translateX(2px) scale(0.98);
        }
        @keyframes sidebarPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #22c55e; }
          50%       { opacity: 0.5; box-shadow: 0 0 12px #22c55e; }
        }
      `}</style>

      <div
        style={{
          width: "230px",
          minWidth: "230px",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: "28px 16px",
          gap: "6px",
          background: bg,
          borderRight: `1px solid ${border}`,
          boxShadow: darkMode
            ? "4px 0 24px rgba(0,0,0,0.4)"
            : "4px 0 24px rgba(0,0,0,0.05)",
          transition: "background 0.3s ease, border 0.3s ease",
          fontFamily: "'DM Sans', sans-serif",
          zIndex: 10,
        }}
      >
        {/* Logo / Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "4px 12px 20px",
            borderBottom: `1px solid ${border}`,
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              boxShadow: "0 4px 12px rgba(108,99,255,0.35)",
            }}
          >
            ✓
          </div>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: "17px",
              color: titleColor,
              letterSpacing: "-0.3px",
            }}
          >
            TaskFlow
          </span>
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: dotColor,
              marginLeft: "auto",
              boxShadow: `0 0 6px ${dotColor}`,
            }}
          />
        </div>

        {/* Nav label */}
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: darkMode ? "#555577" : "#aab0c8",
            padding: "0 12px",
            marginBottom: "4px",
          }}
        >
          Navigation
        </span>

        {/* Nav Items */}
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              className="sidebar-nav-btn"
              onClick={() => navigate(path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 14px",
                borderRadius: "12px",
                border: "none",
                borderLeft: isActive ? `3px solid ${activeBorder}` : "3px solid transparent",
                background: isActive ? activeBg : "transparent",
                color: isActive ? activeText : text,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = hoverBg;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "17px" }}>{icon}</span>
              {label}
              {isActive && (
                <span
                  style={{
                    marginLeft: "auto",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: activeBorder,
                  }}
                />
              )}
            </button>
          );
        })}

        {/* Bottom spacer */}
        <div style={{ flex: 1 }} />

        {/* ✅ Admin buttons — only visible to admin */}
        {isAdmin && (
          <div style={{
            display: "flex", flexDirection: "column", gap: "6px",
            marginBottom: "10px",
          }}>
            {/* Active Users button */}
            <button
              onClick={() => navigate("/admin/active-users")}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", borderRadius: "12px", border: "none",
                borderLeft: location.pathname === "/admin/active-users"
                  ? "3px solid #22c55e" : "3px solid transparent",
                background: location.pathname === "/admin/active-users"
                  ? (darkMode ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.1)")
                  : "transparent",
                color: "#22c55e",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px", fontWeight: 600,
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.12)"; }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  location.pathname === "/admin/active-users"
                    ? "rgba(34,197,94,0.15)" : "transparent";
              }}
            >
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#22c55e", boxShadow: "0 0 6px #22c55e",
                animation: "sidebarPulse 2s ease infinite", flexShrink: 0,
              }} />
              Active Users
            </button>

            {/* Admin Panel button */}
            <button
              onClick={() => navigate("/admin")}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", borderRadius: "12px", border: "none",
                borderLeft: location.pathname === "/admin"
                  ? "3px solid #6c63ff" : "3px solid transparent",
                background: location.pathname === "/admin"
                  ? (darkMode ? "rgba(108,99,255,0.15)" : "rgba(108,99,255,0.1)")
                  : "transparent",
                color: "#a78bfa",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px", fontWeight: 600,
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(108,99,255,0.12)"; }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  location.pathname === "/admin"
                    ? "rgba(108,99,255,0.15)" : "transparent";
              }}
            >
              <span style={{ fontSize: "14px" }}>🛡️</span>
              Admin Panel
            </button>
          </div>
        )}
        <div
          style={{
            padding: "12px",
            borderRadius: "12px",
            background: darkMode ? "#1e1e30" : "#f5f6ff",
            fontSize: "12px",
            color: darkMode ? "#666688" : "#9090b0",
            textAlign: "center",
            lineHeight: "1.5",
          }}
        >
          AI Task Manager<br />
          <span style={{ color: activeBorder, fontWeight: 600 }}>v1.0</span>
        </div>
      </div>
    </>
  );
}

export default Sidebar;