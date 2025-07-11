// backend/src/routes/bookRoutes.js
const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

// Sync data dari external API
router.post("/sync", bookController.syncData.bind(bookController));

// CRUD operations
router.get("/", bookController.getAllBooks.bind(bookController));
router.get("/search", bookController.searchBooks.bind(bookController));
router.get(
  "/recommendations",
  bookController.getRecommendations.bind(bookController)
);
router.get(
  "/knowledge-graph",
  bookController.getKnowledgeGraph.bind(bookController)
);
router.get("/analytics", bookController.getAnalytics.bind(bookController));
router.get("/:id", bookController.getBookById.bind(bookController));

// User interactions
router.post("/rate", bookController.rateBook.bind(bookController));

module.exports = router;

// backend/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const { createTables } = require("./config/database");

// Import routes
const bookRoutes = require("./routes/bookRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/books", bookRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize database and start server
async function startServer() {
  try {
    await createTables();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
