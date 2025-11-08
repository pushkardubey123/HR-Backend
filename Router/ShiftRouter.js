const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const companyMiddleware = require("../Middleware/companyMiddleware"); // ✅ added for companyId

const {
  addShift,
  getShifts,
  updateShift,
  deleteShift,
} = require("../Controllers/ShiftController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

// ✅ Routes with same structure — just added companyMiddleware where auth exists
router.post("/", auth, companyMiddleware,subscriptionMiddleware,moduleAccess("employee_management"),  addShift);
router.get("/",getShifts);
router.put("/:id", auth, companyMiddleware,subscriptionMiddleware,moduleAccess("employee_management"),  updateShift);
router.delete("/:id", auth, companyMiddleware,subscriptionMiddleware,moduleAccess("employee_management"),  deleteShift);

module.exports = router;
