const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function adminMiddleware(req, res, next) {
  try {
    // ✅ Step 1: Check authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    // ✅ Step 2: Verify JWT
    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Step 3: Fetch user from DB to check isAdmin + isBanned
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    // ✅ Attach user to request
    req.user = {
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};