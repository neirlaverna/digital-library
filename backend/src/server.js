// backend/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { createTables } = require("./config/database");

// Import routes
const bookRoutes = require("./routes/bookRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Apply rate limiting to all requests
app.use("/api/", limiter);

// Routes
app.use("/api/books", bookRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Basic info endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Digital Library API",
    version: "1.0.0",
    documentation: "/api/docs",
    health: "/health",
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);

  // Handle different types of errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      message: error.message,
      details: error.details,
    });
  }

  if (error.name === "UnauthorizedError") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing authentication",
    });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: "File Too Large",
      message: "File size exceeds the limit",
    });
  }

  // Default error response
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.path}`,
    availableRoutes: [
      "GET /",
      "GET /health",
      "GET /api/books",
      "POST /api/books/sync",
      "GET /api/books/search",
      "GET /api/books/recommendations",
      "GET /api/books/analytics",
      "GET /api/books/knowledge-graph",
    ],
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Initialize database and start server
async function startServer() {
  try {
    console.log("🔧 Initializing database...");
    await createTables();
    console.log("✅ Database initialized successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📚 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
