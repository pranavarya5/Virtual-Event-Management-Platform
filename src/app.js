const express = require("express");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Virtual Event Management Platform API",
    version: "1.0.0",
  });
});

// Routes
app.use("/", authRoutes);
app.use("/events", eventRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
