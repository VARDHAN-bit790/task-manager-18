import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Home",     icon: "📊" },
  { path: "/tasks",     label: "Tasks",    icon: "📋" },
  { path: "/insights",  label: "Insights", icon: "📈" },
  { path: "/profile",   label: "Profile",  icon: "👤" },
];

function BottomNav({ darkMode }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const bg        = darkMode ? "#161622" : "#ffffff";
  const border    = darkMode ? "#2a2a3d" : "#e8ecf4";
  const textColor = darkMode ? "#666688" : "#9090b0";
  const activeColor = "#6c63ff";
  const activeBg  = darkMode ? "rgba(108,99,255,0.15)" : "rgba(108,99,255,0.1)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600&display=swap');

        .bottom-nav {
          display: none;
        }

        @media (max-width: 768px) {
          .bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            height: 64px;
            padding: 0 8px;
            padding-bottom: env(safe-area-inset-bottom); /* iPhone notch support */
            align-items: center;
            justify-content: space-around;
            background: ${bg};
            border-top: 1px solid ${border};
            box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
            transition: background 0.3s ease;
          }
        }

        .bottom-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          flex: 1;
          padding: 6px 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 14px;
          margin-top: 0;
          min-height: unset;
          transition: background 0.18s ease, transform 0.15s ease;
        }

        .bottom-nav-btn:hover {
          background: ${activeBg};
          transform: translateY(-2px);
          box-shadow: none;
        }

        .bottom-nav-btn:active {
          transform: scale(0.93);
        }

        .bottom-nav-btn.active {
          background: ${activeBg};
        }

        .bottom-nav-icon {
          font-size: 20px;
          line-height: 1;
          transition: transform 0.18s ease;
        }

        .bottom-nav-btn.active .bottom-nav-icon {
          transform: scale(1.18);
        }

        .bottom-nav-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2px;
          transition: color 0.18s ease;
        }

        .bottom-nav-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: ${activeColor};
          margin-top: 1px;
        }
      `}</style>

      <nav className="bottom-nav">
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              className={`bottom-nav-btn ${isActive ? "active" : ""}`}
              onClick={() => navigate(path)}
              style={{ color: isActive ? activeColor : textColor }}
            >
              <span className="bottom-nav-icon">{icon}</span>
              <span className="bottom-nav-label">{label}</span>
              {isActive && <span className="bottom-nav-dot" />}
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default BottomNav;