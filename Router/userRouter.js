const express = require("express");
const router = express.Router();
const attachCompanyId = require("../Middleware/companyMiddleware");
const {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  userForgetPassword,
  userVerifyPassword,
  userResetPassword,
  getPendingUsers,
  approvePendingUser,
  rejectPendingUser,
  getAllEmployeeDates,
  getPendingAdmins,
  approvePendingAdmin,
  rejectPendingAdmin,
  getAllCompanies,
} = require("../Controllers/UserController");
const auth = require("../Middleware/auth");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");
const userTbl = require("../Modals/User");

// Public
router.post("/user/register", register);
router.post("/user/login", login);
router.post("/user/forgot-password", userForgetPassword);
router.post("/user/verify-otp", userVerifyPassword);
router.post("/user/reset-password", userResetPassword);
router.get("/", getAllCompanies);

// Protected - Need auth + companyId
router.get("/user", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"),  getAllUsers);
router.get("/employeeget/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"),  getUserById);
router.put("/employeeget/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"),  updateUser);
router.delete("/employeedelete/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"),  deleteUser);
router.get("/user/pending-users", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"),  getPendingUsers);
router.post("/user/approve-user/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"),  approvePendingUser);
router.delete("/pending/reject/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"),  rejectPendingUser);
router.get("/user/employee-dates", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"),  getAllEmployeeDates);
router.get("/user/pending-admins", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"),  getPendingAdmins);
router.post("/user/approve-admin/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"),  approvePendingAdmin);
router.delete("/user/reject-admin/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("employee_management"),  rejectPendingAdmin);
// company-based dropdowns
router.get("/departments/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const departments = await require("../Modals/Department").find({ companyId });
    res.json({ success: true, data: departments });
  } catch (err) {
    console.error("Fetch company departments error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/designations/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const designations = await require("../Modals/Designation").find({ companyId });
    res.json({ success: true, data: designations });
  } catch (err) {
    console.error("Fetch company designations error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/shifts/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const shifts = await require("../Modals/Shift").find({ companyId });
    res.json({ success: true, data: shifts });
  } catch (err) {
    console.error("Fetch company shifts error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
router.get("/designations/:companyId/:departmentId", async (req, res) => {
  const { companyId, departmentId } = req.params;
  const data = await Designation.find({ companyId, departmentId });
  res.json({ success: true, data });
});

router.get("/admin/profile/:id", auth, async (req, res) => {
  try {
    const user = await userTbl.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: 404,
      });

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("Admin profile fetch error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
});

module.exports = router;
