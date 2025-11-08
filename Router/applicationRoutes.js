const express = require("express");
const router = express.Router();
const attachCompanyId = require("../Middleware/companyMiddleware");
const auth = require("../Middleware/auth");

const {
  applyJob,
  getApplications,
  getApplicationById,
  rejectApplication,
  shortlistApplication,
} = require("../Controllers/applicationController");


router.post("/", applyJob);

router.get("/", auth, attachCompanyId, getApplications);
router.get("/:id", auth, attachCompanyId, getApplicationById);

// Admin actions (reject/shortlist) protected
router.put("/:id/reject", auth, attachCompanyId, rejectApplication);
router.put("/:id/shortlist", auth, attachCompanyId, shortlistApplication);

module.exports = router;
