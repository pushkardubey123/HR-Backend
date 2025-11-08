const router = require("express").Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const {
  createExitRequest,
  getAllExitRequests,
  getExitRequestsByEmployee,
  updateExitRequestByAdmin,
  deleteExitRequest,
} = require("../Controllers/exitController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

// Submit exit request (employee)
router.post("/submit", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("exit"),  createExitRequest);

// Get all exit requests for logged-in employee
router.get("/my-requests", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("exit"),  getExitRequestsByEmployee);

// Get all exit requests (admin)
router.get("/", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("exit"),  getAllExitRequests);

// Update exit request by admin
router.put("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("exit"),  updateExitRequestByAdmin);

// Delete exit request (only pending)
router.delete("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("exit"),  deleteExitRequest);

module.exports = router;
