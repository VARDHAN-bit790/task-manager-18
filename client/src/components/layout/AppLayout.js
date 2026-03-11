import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ✅ Detect if screen is mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

function AppLayout({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const deleteAllTasks = async () => {
    if (!window.confirm("Delete ALL tasks? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/tasks/all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete all tasks:", err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: darkMode ? "#0d0d0d" : "#f0f2f7",
        transition: "background 0.3s ease",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Sidebar — desktop only */}
      {!isMobile && <Sidebar darkMode={darkMode} />}

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <Topbar
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode((d) => !d)}
          handleLogout={handleLogout}
          deleteAllTasks={deleteAllTasks}
          isMobile={isMobile}
        />

        {/* Page content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobile ? "16px 14px 80px" : "28px 32px",
            color: darkMode ? "#e8e8e8" : "#1a1a2e",
            transition: "color 0.3s ease",
          }}
        >
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      {isMobile && <BottomNav darkMode={darkMode} />}
    </div>
  );
}

export default AppLayout;