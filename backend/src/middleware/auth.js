const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Middleware to authenticate a JWT
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found." });
    req.user = user;
    next();
  } catch (err)  {
    return res.status(403).json({ error: "Invalid or expired token." });  
  }
}

// Middleware to ensure the user is an admin
function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Admin privileges required." });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
};