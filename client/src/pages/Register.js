import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const API_URL = "http://localhost:5000";

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

  .auth-page::before {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, #7c3aed22, transparent 70%);
    top: -100px; right: -100px;
    border-radius: 50%;
  }
  .auth-page::after {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    background: radial-gradient(circle, #7c3aed18, transparent 70%);
    bottom: -80px; left: -80px;
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

  .input-group { margin-bottom: 16px; }
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

  /* password strength bar */
  .strength-bar-wrap {
    height: 4px;
    background: #ede8ff;
    border-radius: 999px;
    margin-top: 8px;
    overflow: hidden;
  }
  .strength-bar-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease, background 0.3s ease;
  }
  .strength-label {
    font-size: 11px;
    font-weight: 600;
    margin-top: 4px;
  }

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
  .divider-line { flex: 1; height: 1px; background: #ede8ff; }
  .divider-text { font-size: 12px; color: #c4b8e8; font-weight: 500; }

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

// ── Password strength checker ──
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score: 20, label: "Weak", color: "#ef4444" };
  if (score === 2) return { score: 40, label: "Fair", color: "#f59e0b" };
  if (score === 3) return { score: 65, label: "Good", color: "#3b82f6" };
  return { score: 100, label: "Strong 💪", color: "#22c55e" };
};

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const strength = getStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      toast.success("Account created! Please sign in 🎉");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed ❌");
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
          <h1 className="auth-title">Create account 🚀</h1>
          <p className="auth-subtitle">Start managing your tasks smarter today</p>

          {/* Form */}
          <form onSubmit={handleRegister}>

            {/* Name */}
            <motion.div className="input-group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="input-label">Full Name</label>
              <div className="input-wrap">
                <FaUser className="input-icon" />
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div className="input-group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
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
            </motion.div>

            {/* Password */}
            <motion.div className="input-group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="input-label">Password</label>
              <div className="input-wrap">
                <FaLock className="input-icon" />
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* ✅ Password strength bar */}
              {password && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="strength-bar-wrap">
                    <div className="strength-bar-fill" style={{ width: `${strength.score}%`, background: strength.color }} />
                  </div>
                  <p className="strength-label" style={{ color: strength.color }}>{strength.label}</p>
                </motion.div>
              )}
            </motion.div>

            {/* Submit */}
            <motion.button
              type="submit"
              className="auth-btn"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {loading ? <><span className="spinner" />Creating account...</> : "Create Account →"}
            </motion.button>
          </form>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">already have an account?</span>
            <div className="divider-line" />
          </div>

          <div className="auth-footer">
            <Link to="/">Sign in instead →</Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Register;