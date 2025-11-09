const jwt = require("jsonwebtoken");

// Middleware to authenticate a JWT
function authenticateToken(req, res, next) {
  // Tokens are expected in the Authorization header: "Bearer <token>"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });

    // Attach user info from token to the request object
    req.user = decoded;
    next();
  });
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