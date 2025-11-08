const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const {
  addJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../Controllers/jobController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

router.get("/",subscriptionMiddleware,moduleAccess("job"),  getJobs);
router.get("/:id",subscriptionMiddleware,moduleAccess("job"),  getJobById);

// -------------------- Protected Job Routes --------------------
router.post("/", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("job"), addJob);        // Add job
router.put("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("job"), updateJob);  // Update job
router.delete("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("job"), deleteJob); // Delete job

module.exports = router;
