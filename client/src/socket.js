import { io } from "socket.io-client";

// ✅ CRA uses process.env, NOT import.meta.env (that's Vite only)
// Falls back to localhost if env variable is not set
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const socket = io(API_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"], // ✅ polling as fallback if websocket fails
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000, // ✅ cap the delay at 5s on repeated failures
  timeout: 10000,             // ✅ 10s connection timeout
});

// ✅ Dev-only connection logs (silent in production)
if (process.env.NODE_ENV === "development") {
  socket.on("connect",         () => console.log("🟢 Socket connected:", socket.id));
  socket.on("disconnect", (reason) => console.log("🔴 Socket disconnected:", reason));
  socket.on("connect_error",  (err) => console.warn("⚠️ Socket error:", err.message));
}