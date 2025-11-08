const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getEventById,
} = require("../Controllers/eventController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

router.post("/create", authMiddleware, attachCompanyId,subscriptionMiddleware,moduleAccess("event"), createEvent);

router.get("/", authMiddleware, attachCompanyId,subscriptionMiddleware,moduleAccess("event"), getAllEvents);

router.put("/:id", authMiddleware, attachCompanyId,subscriptionMiddleware,moduleAccess("event"), updateEvent);

router.delete("/:id", authMiddleware, attachCompanyId,subscriptionMiddleware,moduleAccess("event"), deleteEvent);

router.get("/employee/:id",authMiddleware, attachCompanyId,subscriptionMiddleware,moduleAccess("event"), getEventById);

module.exports = router;
