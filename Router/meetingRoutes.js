const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const {
  createMeeting,
  getAllMeetings,
  updateMeeting,
  deleteMeeting,
} = require("../Controllers/meetingController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

// Create a new meeting
router.post("/create", authMiddleware, attachCompanyId,subscriptionMiddleware,moduleAccess("meeting"),createMeeting);

// Get all meetings (filtered by company if needed)
router.get("/all", authMiddleware, attachCompanyId,subscriptionMiddleware,moduleAccess("meeting"),getAllMeetings);

// Update a meeting by ID
router.put("/update/:id", authMiddleware, attachCompanyId,subscriptionMiddleware,moduleAccess("meeting"),updateMeeting);

// Delete a meeting by ID
router.delete("/delete/:id", authMiddleware, attachCompanyId,subscriptionMiddleware,moduleAccess("meeting"),deleteMeeting);

module.exports = router;
