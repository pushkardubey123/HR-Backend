const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const companyMiddleware = require("../Middleware/companyMiddleware"); // ✅ added company middleware
const {
  generateDynamicReport,
  getReports,
  getDashboardAnalytics,
} = require("../Controllers/reportController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");
// ✅ Protect and attach companyId for all authenticated routes
router.use(auth, companyMiddleware,subscriptionMiddleware,moduleAccess("report"), );

// ✅ Generate report
router.post("/generate", generateDynamicReport);

// ✅ Stream report directly (no auth needed if intentionally public)
router.get("/stream", generateDynamicReport);

// ✅ Dashboard analytics for logged-in company
router.get("/dashboard", getDashboardAnalytics);

// ✅ Fetch saved reports (optional endpoint, restored safely)
router.get("/", getReports);

module.exports = router;
