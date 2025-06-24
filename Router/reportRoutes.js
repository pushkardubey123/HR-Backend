const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");

const {
  generateReport,
  getAllReports,
  getDashboardAnalytics,
} = require("../Controllers/reportController");

// 🔹 Generate a new report record (just metadata for now)
router.post("/generate", auth, generateReport);

// 🔹 Get all report logs (admin view)
router.get("/", auth, getAllReports);

// 🔹 Dashboard analytics cards (counts/summaries)
router.get("/dashboard", auth, getDashboardAnalytics);

module.exports = router;
