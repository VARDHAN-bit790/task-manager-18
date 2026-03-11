import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaUser, FaEnvelope, FaCalendarAlt, FaTasks,
  FaCheckCircle, FaFire, FaSignOutAlt, FaArrowLeft
} from "react-icons/fa";

const API_URL = "http://localhost:5000";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  .profile-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f3f0ff 0%, #ede8ff 50%, #e0d9ff 100%);
    padding: 32px 20px;
    position: relative;
    overflow: hidden;
  }

  .profile-page::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, #7c3aed18, transparent 70%);
    top: -150px; right: -150px;
    border-radius: 50%;
  }
  .profile-page::after {
    content: '';
    position: absolute;
    width: 350px; height: 350px;
    background: radial-gradient(circle, #7c3aed12, transparent 70%);
    bottom: -100px; left: -100px;
    border-radius: 50%;
  }

  .profile-inner {
    max-width: 720px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* Top nav */
  .profile-topnav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .back-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 16px; border-radius: 10px;
    border: 1px solid #ede8ff; background: #ffffff;
    color: #6b5ea8; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.18s;
    font-family: 'DM Sans', sans-serif;
  }
  .back-btn:hover { border-color: #7c3aed; color: #7c3aed; }

  .logout-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 16px; border-radius: 10px;
    border: 1px solid #fee2e2; background: #ffffff;
    color: #ef4444; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.18s;
    font-family: 'DM Sans', sans-serif;
  }
  .logout-btn:hover { background: #fee2e2; }

  .brand {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 800;
    color: #1a1033; letter-spacing: -0.5px;
  }
  .brand span { color: #7c3aed; }

  /* Hero card */
  .profile-hero {
    background: #ffffff;
    border-radius: 24px;
    padding: 36px;
    margin-bottom: 20px;
    box-shadow: 0 10px 40px rgba(124,58,237,0.08);
    border: 1px solid #ede8ff;
    display: flex;
    align-items: center;
    gap: 28px;
  }

  .avatar-ring {
    width: 90px; height: 90px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 36px; font-weight: 800;
    color: white; flex-shrink: 0;
    box-shadow: 0 8px 24px rgba(124,58,237,0.3);
  }

  .profile-hero-info { flex: 1; }
  .profile-name {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800;
    color: #1a1033; letter-spacing: -0.5px;
    margin-bottom: 4px;
  }
  .profile-email {
    font-size: 14px; color: #a99fd4; font-weight: 400;
    display: flex; align-items: center; gap: 6px;
  }
  .profile-joined {
    font-size: 12px; color: #c4b8e8;
    margin-top: 8px;
    display: flex; align-items: center; gap: 6px;
  }

  /* Info cards grid */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 20px;
  }

  .info-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid #ede8ff;
    box-shadow: 0 4px 16px rgba(124,58,237,0.05);
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .info-card-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: #f3f0ff;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .info-card-label {
    font-size: 12px; color: #a99fd4;
    font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.5px; margin-bottom: 3px;
  }
  .info-card-value {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 700;
    color: #1a1033;
  }

  /* Stat cards */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 20px;
  }
  .stat-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid #ede8ff;
    text-align: center;
    box-shadow: 0 4px 16px rgba(124,58,237,0.05);
  }
  .stat-card .stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 32px; font-weight: 800;
    color: #7c3aed; letter-spacing: -1px;
  }
  .stat-card .stat-label {
    font-size: 12px; color: #a99fd4;
    font-weight: 600; margin-top: 4px;
  }

  /* Account details */
  .detail-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #ede8ff;
    box-shadow: 0 4px 16px rgba(124,58,237,0.05);
  }
  .detail-card h3 {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
    color: #1a1033; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .detail-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    background: #f9f7ff;
    border-radius: 10px;
    margin-bottom: 10px;
    border: 1px solid #ede8ff;
  }
  .detail-row-icon {
    width: 36px; height: 36px;
    border-radius: 9px;
    background: #ede8ff;
    display: flex; align-items: center; justify-content: center;
    color: #7c3aed; font-size: 14px; flex-shrink: 0;
  }
  .detail-row-label {
    font-size: 11px; color: #a99fd4;
    font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .detail-row-value {
    font-size: 14px; font-weight: 600; color: #1a1033;
    margin-top: 2px;
  }

  /* Skeleton */
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .skel {
    border-radius: 12px;
    background: linear-gradient(90deg, #ede8ff 25%, #ddd5ff 37%, #ede8ff 63%);
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite;
  }
`;

// ── Skeleton loader ──
function ProfileSkeleton() {
  return (
    <div className="profile-inner">
      <div style={{ height: 160, marginBottom: 20 }} className="skel" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={{ height: 90 }} className="skel" />
        <div style={{ height: 90 }} className="skel" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        <div style={{ height: 100 }} className="skel" />
        <div style={{ height: 100 }} className="skel" />
        <div style={{ height: 100 }} className="skel" />
      </div>
    </div>
  );
}

function Profile() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          axios.get(`${API_URL}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUser(userRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  const statCards = [
    { icon: <FaTasks color="#7c3aed" />, num: totalTasks, label: "Total Tasks" },
    { icon: <FaCheckCircle color="#22c55e" />, num: completedTasks, label: "Completed" },
    { icon: <FaFire color="#f59e0b" />, num: pendingTasks, label: "Pending" },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="profile-page">
        <div className="profile-inner">

          {/* Top Nav */}
          <motion.div className="profile-topnav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
              <FaArrowLeft size={12} /> Dashboard
            </button>
            <div className="brand">Task<span>Flow</span></div>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt size={12} /> Logout
            </button>
          </motion.div>

          {loading ? <ProfileSkeleton /> : (
            <>
              {/* Hero */}
              <motion.div className="profile-hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="avatar-ring">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="profile-hero-info">
                  <div className="profile-name">{user?.name}</div>
                  <div className="profile-email">
                    <FaEnvelope size={12} /> {user?.email}
                  </div>
                  <div className="profile-joined">
                    <FaCalendarAlt size={11} /> Joined {joinedDate}
                  </div>
                </div>
                {/* completion badge */}
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <svg width="80" height="80">
                    <circle cx="40" cy="40" r="32" stroke="#ede8ff" strokeWidth="7" fill="none" />
                    <circle cx="40" cy="40" r="32" stroke="#7c3aed" strokeWidth="7" fill="none"
                      strokeDasharray={201}
                      strokeDashoffset={201 - (201 * completionRate) / 100}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)"
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                    <text x="40" y="46" textAnchor="middle" fontSize="15" fontWeight="800" fill="#7c3aed" fontFamily="Montserrat, sans-serif">
                      {completionRate}%
                    </text>
                  </svg>
                  <p style={{ fontSize: "11px", color: "#a99fd4", marginTop: "2px", fontWeight: 600 }}>Completion</p>
                </div>
              </motion.div>

              {/* Stat Cards */}
              <div className="stats-row">
                {statCards.map((s, i) => (
                  <motion.div key={s.label} className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -4, boxShadow: "0 10px 28px rgba(124,58,237,0.12)", transition: { duration: 0.2 } }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                    <div className="stat-num">{s.num}</div>
                    <div className="stat-label">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Account Details */}
              <motion.div className="detail-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h3><FaUser color="#7c3aed" /> Account Details</h3>

                <div className="detail-row">
                  <div className="detail-row-icon"><FaUser /></div>
                  <div>
                    <div className="detail-row-label">Full Name</div>
                    <div className="detail-row-value">{user?.name}</div>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-row-icon"><FaEnvelope /></div>
                  <div>
                    <div className="detail-row-label">Email Address</div>
                    <div className="detail-row-value">{user?.email}</div>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-row-icon"><FaCalendarAlt /></div>
                  <div>
                    <div className="detail-row-label">Member Since</div>
                    <div className="detail-row-value">{joinedDate}</div>
                  </div>
                </div>

                <div className="detail-row" style={{ marginBottom: 0 }}>
                  <div className="detail-row-icon"><FaTasks /></div>
                  <div>
                    <div className="detail-row-label">Productivity</div>
                    <div className="detail-row-value" style={{ color: completionRate > 70 ? "#22c55e" : completionRate > 40 ? "#f59e0b" : "#ef4444" }}>
                      {completionRate}% completion rate
                    </div>
                  </div>
                </div>
              </motion.div>

            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;