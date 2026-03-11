import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const API_URL = "https://task-manager-18.onrender.com";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f3f0ff 0%, #ede8ff 50%, #e0d9ff 100%);
    padding: 20px;
    position: relative;
    overflow: hidden;
  }

  /* decorative blobs */
  .auth-page::before {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, #7c3aed22, transparent 70%);
    top: -100px; left: -100px;
    border-radius: 50%;
  }
  .auth-page::after {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    background: radial-gradient(circle, #7c3aed18, transparent 70%);
    bottom: -80px; right: -80px;
    border-radius: 50%;
  }

  .auth-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 44px 40px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(124, 58, 237, 0.12);
    border: 1px solid #ede8ff;
    position: relative;
    z-index: 1;
  }

  .auth-logo {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: #1a1033;
    margin-bottom: 28px;
    letter-spacing: -0.5px;
  }
  .auth-logo span { color: #7c3aed; }

  .auth-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: #1a1033;
    letter-spacing: -0.8px;
    margin-bottom: 6px;
  }
  .auth-subtitle {
    font-size: 14px;
    color: #a99fd4;
    margin-bottom: 32px;
    font-weight: 400;
  }

  .input-group {
    margin-bottom: 16px;
  }
  .input-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #6b5ea8;
    margin-bottom: 7px;
  }
  .input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .input-icon {
    position: absolute;
    left: 14px;
    color: #a99fd4;
    font-size: 14px;
    pointer-events: none;
  }
  .auth-input {
    width: 100%;
    padding: 12px 14px 12px 40px;
    background: #f9f7ff;
    border: 1.5px solid #ede8ff;
    border-radius: 10px;
    color: #1a1033;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .auth-input:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px #7c3aed18;
  }
  .auth-input::placeholder { color: #c4b8e8; }

  .eye-btn {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    color: #a99fd4;
    font-size: 14px;
    padding: 4px;
    transition: color 0.15s;
  }
  .eye-btn:hover { color: #7c3aed; }

  .auth-btn {
    width: 100%;
    padding: 13px;
    background: #7c3aed;
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 15px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    margin-top: 8px;
    transition: opacity 0.2s, transform 0.1s;
    letter-spacing: 0.2px;
  }
  .auth-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .auth-footer {
    text-align: center;
    margin-top: 22px;
    font-size: 14px;
    color: #a99fd4;
  }
  .auth-footer a {
    color: #7c3aed;
    font-weight: 600;
    text-decoration: none;
  }
  .auth-footer a:hover { text-decoration: underline; }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
  }
  .divider-line {
    flex: 1;
    height: 1px;
    background: #ede8ff;
  }
  .divider-text {
    font-size: 12px;
    color: #c4b8e8;
    font-weight: 500;
  }

  /* loading spinner */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    margin-right: 8px;
    vertical-align: middle;
  }
`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      toast.success("Welcome back! 👋");
     navigate(res.data.isAdmin ? "/admin" : "/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="auth-page">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Logo */}
          <div className="auth-logo">Task<span>Flow</span></div>

          {/* Title */}
          <h1 className="auth-title">Welcome back 👋</h1>
          <p className="auth-subtitle">Sign in to continue to your dashboard</p>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="input-group">
              <label className="input-label">Email address</label>
              <div className="input-wrap">
                <FaEnvelope className="input-icon" />
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrap">
                <FaLock className="input-icon" />
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              className="auth-btn"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <><span className="spinner" />Signing in...</> : "Sign In →"}
            </motion.button>
          </form>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">don't have an account?</span>
            <div className="divider-line" />
          </div>

          <div className="auth-footer">
            <Link to="/register">Create a free account →</Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Login;