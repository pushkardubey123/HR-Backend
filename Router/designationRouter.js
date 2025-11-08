const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");

const {
  addDesignation,
  getDesignations,
  updateDesignation,
  deleteDesignation,
} = require("../Controllers/desinationController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

// -------------------- Protected Routes --------------------
// Add designation - only admin
router.post("/", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"), addDesignation);

// Get all designations - admin/employee can access
router.get("/", getDesignations);

// Update designation - only admin
router.put("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"), updateDesignation);

// Delete designation - only admin
router.delete("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"), deleteDesignation);

module.exports = router;
