const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const {
  applyWFH,
  getMyWFH,
  getAllWFH,
  updateWFHStatus,
  adminAssignWFH,
} = require("../Controllers/workFromHomeController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

// Employee applies for WFH
router.post("/wfh/apply", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("wfh"),  applyWFH);

// Employee gets their own WFH requests
router.get("/wfh/my", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("wfh"),  getMyWFH);

// Admin gets all WFH requests
router.get("/wfh/all", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("wfh"),  getAllWFH);

// Admin updates WFH status
router.put("/wfh/status/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("wfh"),  updateWFHStatus);

// Admin directly assigns WFH
router.post("/admin/assign-wfh", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("wfh"),  adminAssignWFH);

module.exports = router;
