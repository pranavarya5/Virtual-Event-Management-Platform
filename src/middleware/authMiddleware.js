const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { findUserById } = require("../data/users");

/**
 * Middleware to authenticate JWT token
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Invalid token. User not found." });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

/**
 * Middleware to authorize by role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
