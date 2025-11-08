const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const {
  addDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} = require("../Controllers/departmentController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");
// Protected - Need auth + companyId
router.post("/", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"), addDepartment);
router.get("/", getDepartments);
router.put("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"), updateDepartment);
router.delete("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"), deleteDepartment);

module.exports = router;
