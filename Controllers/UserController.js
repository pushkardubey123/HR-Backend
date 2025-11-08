const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userTbl = require("../Modals/User");
const sendOTP = require("../utils/sendOtp");
const pendingAdminTbl = require("../Modals/PendingAdmin");
const pendingTbl = require("../Modals/PendingUser");
const fs = require("fs");
const path = require("path");
const Subscription = require("../Modals/Subscription");

// -------------------- Register --------------------
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      dob,
      address,
      departmentId,
      designationId,
      shiftId,
      doj,
      emergencyContact,
      pan,
      bankAccount,
      companyId,
      companyName, // for admin registration
      role,        // "employee" or "admin"
    } = req.body;

    const emailExists =
      (await pendingTbl.findOne({ email })) ||
      (await pendingAdminTbl.findOne({ email })) ||
      (await userTbl.findOne({ email }));

    if (emailExists) {
      return res.json({
        success: false,
        error: true,
        message: "Email already exists",
        code: 400,
      });
    }

    let profilePic = null;
    if (req.files && req.files.profilePic) {
      const img = req.files.profilePic;
      const uploadPath = "uploads/profiles";
      if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
      const filename = Date.now() + "_" + img.name;
      const fullPath = path.join(uploadPath, filename);
      await img.mv(fullPath);
      profilePic = `profiles/${filename}`;
    }

    // ✅ If superadmin registering admin
    if (role === "admin") {
      const pendingAdmin = new pendingAdminTbl({
        name,
        email,
        password,
        phone,
        companyName,
        address,
        profilePic,
      });
      await pendingAdmin.save();
      return res.json({
        success: true,
        message: "Admin registration pending superadmin approval",
        code: 201,
      });
    }

    // ✅ Otherwise, employee registration for specific company
    const pendingUser = new pendingTbl({
      name,
      email,
      password,
      phone,
      gender,
      dob,
      address,
      departmentId,
      designationId,
      shiftId,
      doj,
      emergencyContact: JSON.parse(emergencyContact),
      pan,
      bankAccount,
      profilePic,
      companyId: companyId || null,
    });

    await pendingUser.save();

    res.json({
      success: true,
      message: "Employee registration pending admin approval",
      code: 201,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Pending Admins --------------------
const getPendingAdmins = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const admins = await pendingAdminTbl.find();
    res.json({ success: true, message: "Pending admins fetched", data: admins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const approvePendingAdmin = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const pendingAdmin = await pendingAdminTbl.findById(req.params.id);
    if (!pendingAdmin)
      return res.status(404).json({ success: false, message: "Pending admin not found" });

    const hashedPassword = await bcrypt.hash(pendingAdmin.password, 10);

    const newAdmin = new userTbl({
      name: pendingAdmin.name,
      email: pendingAdmin.email,
      phone: pendingAdmin.phone,
      passwordHash: hashedPassword,
      role: "admin",
      address: pendingAdmin.address,
      profilePic: pendingAdmin.profilePic,
      companyName: pendingAdmin.companyName || `${pendingAdmin.name} Company`,
    });

    // ✅ Trial logic
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    if (!newAdmin.hasUsedTrial) {
      await Subscription.create({
        adminId: newAdmin._id,
        modules: ["employee_management"], // default trial modules
        startDate: now,
        endDate: trialEnd,
        isTrial: true,
        planType: "trial",
        status: "active",
      });
      newAdmin.hasUsedTrial = true; // mark used trial
    }

    newAdmin.status = "approved";
    await newAdmin.save();
    await pendingAdminTbl.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Admin approved successfully with 10-day trial" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error approving admin" });
  }
};

const rejectPendingAdmin = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await pendingAdminTbl.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Admin request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error rejecting admin" });
  }
};
const getPendingUsers = async (req, res) => {
  try {
    let filter = {};

    // ✅ Agar admin hai to sirf apne companyId (yaani apna _id) ke employees dekhe
    if (req.user.role === "admin") {
      filter = { companyId: req.user.id };
    }
    // ✅ Employee ko access nahi
    else {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Access denied",
        code: 403,
      });
    }

    const users = await pendingTbl
      .find(filter)
      .populate("departmentId", "name")
      .populate("designationId", "name")
      .populate("shiftId", "name");

    res.json({
      success: true,
      error: false,
      message: "Pending users fetched",
      code: 200,
      data: users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500,
    });
  }
};


// -------------------- Approve Pending User --------------------
const approvePendingUser = async (req, res) => {
  try {
    const pendingUser = await pendingTbl.findById(req.params.id);
    const { basicSalary } = req.body;

    if (!pendingUser) {
      return res
        .status(404)
        .json({ success: false, message: "Pending user not found" });
    }

    const hashedPassword = await bcrypt.hash(pendingUser.password, 10);

    const user = new userTbl({
      ...pendingUser.toObject(),
      passwordHash: hashedPassword,
      role: "employee",
      basicSalary: basicSalary || 0,
      companyId:
        req.user.role === "admin"
          ? req.user.id // ✅ correct key from JWT payload
          : req.companyId || null, // ✅ support superadmin approving on behalf of admin
    });

    console.log("Logged User:", req.user);
    console.log("Attached Company:", req.companyId);
    console.log("Saving Employee with CompanyID:", user.companyId);

    await user.save();
    await pendingTbl.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "User approved and moved to main DB" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error approving user", error: err });
  }
};

// -------------------- Reject Pending User --------------------
const rejectPendingUser = async (req, res) => {
  try {
    const user = await pendingTbl.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pending user not found" });
    }

    if (user.profilePic) {
      const imagePath = path.join(__dirname, "..", "uploads", user.profilePic);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await pendingTbl.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to reject user" });
  }
};

// -------------------- Login --------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Check user existence
    const user = await userTbl.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: true, message: "User not found" });

    // 🔹 Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, error: true, message: "Invalid password" });

    // 🔹 Generate JWT Token
const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
    companyId: user.companyId || user._id, // ✅ Important for admin link
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);


    // 🔹 Prepare subscription info (for admins only)
    let subscriptionInfo = null;
    if (user.role === "admin") {
      const latestSub = await Subscription.findOne({ adminId: user._id })
        .sort({ createdAt: -1 });

      if (latestSub) {
        const now = new Date();
        const endDate = new Date(latestSub.endDate);
        const daysLeft = Math.max(
          0,
          Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
        );

        // 🔹 Mark expired if endDate < today
        if (endDate < now && latestSub.status !== "expired") {
          latestSub.status = "expired";
          await latestSub.save();
        }

        subscriptionInfo = {
          planType: latestSub.planType,
          modules: latestSub.modules,
          startDate: latestSub.startDate,
          endDate: latestSub.endDate,
          isTrial: latestSub.isTrial,
          status: latestSub.status,
          daysLeft,
        };
      }
    }

    // 🔹 Response
    res.json({
      success: true,
      error: false,
      message: "Login successful",
      code: 200,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        companyId: user.companyId,
        profilePic: user.profilePic,
        subscription: subscriptionInfo, // ✅ Added subscription details
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res
      .status(500)
      .json({ success: false, error: true, message: "Server error during login" });
  }
};



// -------------------- Forget / OTP / Reset --------------------
const userForgetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userTbl.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "Email is not Exist" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendOTP(email, otp);

  res.json({ success: true, message: "OTP sent successfully!" });
};

const userVerifyPassword = async (req, res) => {
  const { email, otp } = req.body;
  const user = await userTbl.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < new Date()) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP!" });
  }

  res.json({ success: true, message: "OTP verified successfully" });
};

const userResetPassword = async (req, res) => {
  const { email, newPassword, otp } = req.body;
  const user = await userTbl.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < new Date()) {
    return res
      .status(400)
      .json({ success: false, message: "OTP is wrong or expired!" });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password changed successfully!" });
};

// ✅ Get all approved companies (admins)
const getAllCompanies = async (req, res) => {
  try {
    const companies = await userTbl.find({ role: "admin" })
      .select("_id name email companyName");

    res.json({
      success: true,
      message: "Companies fetched successfully",
      data: companies,
    });
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { getAllCompanies };


// -------------------- Users CRUD --------------------
const getAllUsers = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "admin") {
      filter = { role: "employee", companyId: req.user.id };
    } else if (req.user.role === "superadmin" && req.query.adminId) {
      filter = { role: "employee", companyId: req.query.adminId };
    }

    const users = await userTbl
      .find(filter)
      .select("-passwordHash")
      .populate("departmentId", "name")
      .populate("designationId", "name")
      .populate("shiftId", "name");

    res.json({
      success: true,
      message: "Users fetched",
      data: users,
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Internal Server Error",
      code: 500,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? { _id: req.params.id, companyId: req.user.id }
        : { _id: req.params.id };

    const user = await userTbl
      .findOne(filter)
      .select("-passwordHash")
      .populate("departmentId", "name")
      .populate("designationId", "name")
      .populate("shiftId", "name");

    if (!user)
      return res.json({ success: false, message: "User not found", code: 404 });

    res.json({
      success: true,
      message: "User fetched",
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Internal Server Error", code: 500 });
  }
};

const updateUser = async (req, res) => {
  try {
    const updated = await userTbl.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res.json({ success: false, message: "User not found", code: 404 });

    res.json({ success: true, message: "Updated", data: updated });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Internal Server Error", code: 500 });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await userTbl.findById(req.params.id);
    if (!user)
      return res.json({ success: false, message: "User not found", code: 404 });

    if (user.profilePic) {
      const imagePath = path.join(__dirname, "..", "uploads", user.profilePic);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await userTbl.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Internal Server Error", code: 500 });
  }
};

// -------------------- Birthdays / Anniversaries --------------------
const getBirthdaysAndAnniversaries = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? { role: "employee", companyId: req.user.id }
        : { role: "employee", status: "active" };

    const users = await userTbl.find(filter);

    const today = new Date();
    const todayMonthDay = `${today.getMonth() + 1}-${today.getDate()}`;

    const birthdays = [];
    const anniversaries = [];

    users.forEach((user) => {
      const dob = new Date(user.dob);
      const doj = new Date(user.doj);

      if (
        `${dob.getMonth() + 1}-${dob.getDate()}` === todayMonthDay
      )
        birthdays.push(user);
      if (
        `${doj.getMonth() + 1}-${doj.getDate()}` === todayMonthDay
      )
        anniversaries.push(user);
    });

    res.json({
      success: true,
      message: "Birthdays and anniversaries fetched",
      data: { birthdays, anniversaries },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// -------------------- Employee Dates --------------------
const getAllEmployeeDates = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? { role: "employee", companyId: req.user.id }
        : { role: "employee" };
    const employees = await userTbl.find(filter, "name dob doj");

    res.json({
      success: true,
      message: "Employee DOB and DOJ list fetched",
      data: employees,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee DOB and DOJ",
    });
  }
};


module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  userForgetPassword,
  userResetPassword,
  userVerifyPassword,
  getPendingUsers,
  approvePendingUser,
  rejectPendingUser,
  getBirthdaysAndAnniversaries,
  getAllEmployeeDates,
  approvePendingAdmin,
  rejectPendingAdmin,
  getPendingAdmins,
  getAllCompanies
};
