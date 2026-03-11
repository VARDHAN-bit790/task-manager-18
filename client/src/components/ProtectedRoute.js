import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true; // If token is malformed, treat as expired
  }
}

function LoadingSpinner() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      gap: "16px",
      background: "#0f0f0f",
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "3px solid #333",
        borderTop: "3px solid #6366f1",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#888", fontSize: "14px", fontFamily: "sans-serif" }}>
        Verifying session...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const [authState, setAuthState] = useState("checking"); // "checking" | "authorized" | "unauthorized"
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthState("unauthorized");
        return;
      }

      if (isTokenExpired(token)) {
        // Clean up expired token
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthState("unauthorized");
        return;
      }

      setAuthState("authorized");
    };

    checkAuth();
  }, [location.pathname]); // Re-check on route change

  if (authState === "checking") return <LoadingSpinner />;

  if (authState === "unauthorized") {
    // Preserve the page user tried to visit so we can redirect back after login
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;