require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "default_jwt_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  email: {
    host: process.env.EMAIL_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
};
