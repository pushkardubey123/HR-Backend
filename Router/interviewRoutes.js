const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");

const {
  scheduleInterview,
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
} = require("../Controllers/InterviewController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

// -------------------- Schedule a new interview --------------------
router.post("/schedule", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("interview"),  scheduleInterview);

// -------------------- Get all interviews (admin/company filtered) --------------------
router.get("/", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("interview"),  getAllInterviews);

// -------------------- Get interview by ID --------------------
router.get("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("interview"),  getInterviewById);

// -------------------- Update interview --------------------
router.put("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("interview"),  updateInterview);

// -------------------- Delete interview --------------------
router.delete("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("interview"),  deleteInterview);

module.exports = router;
