import { useState } from "react";
import { useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/dashboard": { title: "Dashboard",  subtitle: "Overview of your tasks" },
  "/tasks":     { title: "Tasks",       subtitle: "Manage and track your work" },
  "/insights":  { title: "Insights",    subtitle: "Analytics & productivity stats" },
  "/profile":   { title: "Profile",     subtitle: "Your account settings" },
};

function Topbar({ deleteAllTasks, handleLogout, toggleDarkMode, darkMode, isMobile }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || { title: "Task Manager", subtitle: "" };

  const bg        = darkMode ? "#161622" : "#ffffff";
  const border    = darkMode ? "#2a2a3d" : "#e8ecf4";
  const titleColor = darkMode ? "#ffffff" : "#1a1a2e";
  const subColor  = darkMode ? "#666688" : "#9090b0";
  const btnBg     = darkMode ? "#1e1e30" : "#f0f2f7";
  const btnHover  = darkMode ? "#2a2a44" : "#e4e6f0";
  const btnText   = darkMode ? "#c8c8dc" : "#4a4a6a";

  const handleDeleteClick = () => {
    if (confirmDelete) {
      deleteAllTasks();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

        .topbar-btn {
          transition: background 0.18s ease, transform 0.15s ease, box-shadow 0.15s ease;
          cursor: pointer;
          border: none;
          font-family: 'DM Sans', sans-serif;
        }
        .topbar-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        .topbar-btn:active {
          transform: translateY(0px) scale(0.97);
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 16px" : "0 32px",
          height: "60px",
          minHeight: "60px",
          background: bg,
          borderBottom: `1px solid ${border}`,
          boxShadow: darkMode
            ? "0 2px 16px rgba(0,0,0,0.3)"
            : "0 2px 16px rgba(0,0,0,0.04)",
          transition: "background 0.3s ease",
          zIndex: 9,
        }}
      >
        {/* Left: Page title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: "20px",
              color: titleColor,
              letterSpacing: "-0.3px",
              transition: "color 0.3s ease",
            }}
          >
            {page.title}
          </h1>
          {page.subtitle && (
            <span
              style={{
                fontSize: "12px",
                color: subColor,
                fontFamily: "'DM Sans', sans-serif",
                transition: "color 0.3s ease",
              }}
            >
              {page.subtitle}
            </span>
          )}
        </div>

        {/* Right: Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

          {/* Dark mode toggle */}
          <button
            className="topbar-btn"
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              background: btnBg,
              color: btnText,
              fontSize: "13px",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = btnHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = btnBg)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Delete all — hidden on mobile to save space */}
          {!isMobile && (
          <button
            className="topbar-btn"
            onClick={handleDeleteClick}
            title="Delete all tasks"
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              background: confirmDelete ? "rgba(239,68,68,0.15)" : btnBg,
              color: confirmDelete ? "#ef4444" : btnText,
              fontSize: "13px",
              fontWeight: confirmDelete ? 600 : 500,
              border: confirmDelete ? "1px solid rgba(239,68,68,0.3)" : "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { if (!confirmDelete) e.currentTarget.style.background = btnHover; }}
            onMouseLeave={(e) => { if (!confirmDelete) e.currentTarget.style.background = btnBg; }}
          >
            {confirmDelete ? "⚠️ Confirm?" : "🗑 Delete All"}
          </button>
          )}

          {/* Logout */}
          <button
            className="topbar-btn"
            onClick={handleLogout}
            style={{
              padding: "8px 18px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "0 4px 14px rgba(108,99,255,0.35)",
            }}
          >
            Logout →
          </button>

        </div>
      </div>
    </>
  );
}

export default Topbar;