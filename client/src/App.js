import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import TaskDetails from "./pages/TaskDetails";
import { Toaster } from "react-hot-toast";
import Profile from "./pages/Profile";
import { useEffect } from "react";
import { socket } from "./socket";
import Insights from "./pages/Insights";
import Tasks from "./pages/Tasks";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserTasks from "./pages/AdminUserTasks";
import ActiveUsers from "./pages/ActiveUsers";

// ✅ Admin-only route guard
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Login />;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem("token");
      return <Login />;
    }
    if (!payload.isAdmin) return <Dashboard />;
    return children;
  } catch {
    return <Login />;
  }
}

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }
      socket.auth = { userId: payload.userId };
      socket.connect();
    } catch (err) {
      console.error("Socket auth failed", err);
    }
    return () => socket.disconnect();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: "'DM Sans', sans-serif", borderRadius: "10px", fontSize: "14px" },
          success: { style: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" } },
          error:   { style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" } },
        }}
      />
      <Routes>
        <Route path="/"         element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tasks"     element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/task/:id"  element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/insights"  element={<ProtectedRoute><Insights /></ProtectedRoute>} />
        <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users/:id"     element={<AdminRoute><AdminUserTasks /></AdminRoute>} />
        <Route path="/admin/active-users"  element={<AdminRoute><ActiveUsers /></AdminRoute>} />
        <Route path="*"          element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;