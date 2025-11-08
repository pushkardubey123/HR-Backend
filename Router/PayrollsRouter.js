const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const companyMiddleware = require("../Middleware/companyMiddleware"); // add this
const {
  createPayroll,
  getAllPayrolls,
  getPayrollById,
  updatePayroll,
  deletePayroll,
  getPayrollByEmployeeId,
} = require("../Controllers/PayrollController");

const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

router.use(auth, companyMiddleware,subscriptionMiddleware,moduleAccess("payroll"), );

router.post("/", createPayroll);
router.get("/", getAllPayrolls);
router.get("/employee/:id", getPayrollByEmployeeId);
router.get("/:id", getPayrollById);
router.put("/:id", updatePayroll);
router.delete("/:id", deletePayroll);

module.exports = router;
