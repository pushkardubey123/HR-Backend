// /Router/reportRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const {
  generateDynamicReport ,
  getReports,
  getDashboardAnalytics,
} = require("../Controllers/reportController");

// 🔹 Create Report Entry
router.post("/generate", auth, generateDynamicReport );

router.get("/stream", generateDynamicReport); // /api/reports/stream?type=users


// 🔹 Dashboard Analytics
router.get("/dashboard", auth, getDashboardAnalytics);

module.exports = router;
