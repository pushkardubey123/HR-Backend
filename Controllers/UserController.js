const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const userTbl = require("../Modals/User");
const sendOTP = require("../utils/sendOtp");
const pendingTbl = require("../Modals/PendingUser");

const register = async (req, res) => {
  try {
    const { name, email, password, phone, gender, dob, address, departmentId, designationId, shiftId, doj, emergencyContact } = req.body;

    const emailExists = await pendingTbl.findOne({ email }) || await userTbl.findOne({ email });
    if (emailExists) {
      return res.json({ success: false, error: true, message: "Email already exists", code: 400 });
    }

    let profilePic = null;
    if (req.files && req.files.profilePic) {
      const img = req.files.profilePic;
      const filename = `${Date.now()}_${img.name}`;
      const uploadPath = path.join(__dirname, "..", "uploads", filename);
      await img.mv(uploadPath);
      profilePic = filename;
    }

    const pendingUser = new pendingTbl({
      name, email, password, phone, gender, dob, address,
      departmentId, designationId, shiftId, doj,
      emergencyContact: JSON.parse(emergencyContact),
      profilePic
    });

    await pendingUser.save();
    res.json({
      success: true,
      message: "Registration pending admin approval",
      code: 201
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getPendingUsers = async (req, res) => {
  try {
    const users = await pendingTbl
      .find()
      .populate("departmentId", "name")   // ✅ Only 'name' field
      .populate("designationId", "name")
      .populate("shiftId", "name");

    res.status(200).json({
      success: true,
      error: false,
      message: "Pending users fetched successfully",
      code: 200,
      data: users,
    });
  } catch (err) {
    console.error("Get Pending Users Error:", err.message);
    res.status(500).json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500,
    });
  }
};

const approvePendingUser = async (req, res) => {
  try {
    const pendingUser = await pendingTbl.findById(req.params.id);
    if (!pendingUser) {
      return res.status(404).json({ success: false, message: "Pending user not found" });
    }

    const hashedPassword = await bcrypt.hash(pendingUser.password, 10);

    const user = new userTbl({
      ...pendingUser.toObject(),
      passwordHash: hashedPassword,
      role: "employee"
    });

    await user.save();
    await pendingTbl.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "User approved and moved to main DB" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error approving user" });
  }
};

const rejectPendingUser=async (req, res) => {
  try {
    const { id } = req.params;
    await pendingUserTbl.findByIdAndDelete(id);
    res.json({ success: true, message: "User request rejected" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to reject user" });
  }
}
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userTbl.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.json({ success: false, error: true, message: "Invalid credentials", code: 400 });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      success: true, error: false, message: "Login successful", code: 200,
      token,
      data: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        profilePic: user.profilePic, phone: user.phone, departmentId: user.departmentId,
        designationId: user.designationId, shiftId: user.shiftId, status: user.status,
      }
    });
  } catch (err) {
    res.json({ success: false, error: true, message: "Internal Server Error", code: 500 });
  }
};

const userForgetPassword =async (req, res) => {
  const { email } = req.body;
  
  const user = await userTbl.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "Email is not Exist" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendOTP(email, otp);

  res.json({ success: true, message: "OTP sending successfully !" });
};

const userVerifyPassword=async (req, res) => {
  const { email, otp } = req.body;

  const user = await userTbl.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < new Date()) {
    return res.status(400).json({ success: false, message: "OTP is wrong or OTP is expired !" });
  }

  res.json({ success: true, message: "OTP is right,Enter New Passsword" });
}

const userResetPassword=async (req, res) => {
  const { email, newPassword, otp } = req.body;

  const user = await userTbl.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < new Date()) {
    return res.status(400).json({ success: false, message: "OTP is wrong or expired !" });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10); 
  user.otp = undefined;    
  user.otpExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password changed !" });
}
const getAllUsers = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({ success: false, error: true, message: "Access denied", code: 403 });
  }
  try {
    const users = await userTbl.find({ role: "employee" })
      .select("-passwordHash")
      .populate("departmentId", "name")
      .populate("designationId", "name")
      .populate("shiftId", "name");
    res.json({ success: true, error: false, message: "Users fetched", code: 200, data: users });
  } catch (err) {
    res.json({ success: false, error: true, message: "Internal Server Error", code: 500 });
  }
};


const getUserById = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({ success: false, error: true, message: "Access denied", code: 403 });
  }
  try {
    const user = await userTbl.findById(req.params.id)
      .select("-passwordHash")
      .populate("departmentId", "name")
      .populate("designationId", "name")
      .populate("shiftId", "name");
    if (!user) {
      return res.json({ success: false, error: true, message: "Not found", code: 404 });
    }
    res.json({ success: true, error: false, message: "User found", code: 200, data: user });
  } catch (err) {
    res.json({ success: false, error: true, message: "Internal Server Error", code: 500 });
  }
};

// 🔹 Update Employee
const updateUser = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({ success: false, error: true, message: "Access denied", code: 403 });
  }
  try {
    const updated = await userTbl.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.json({ success: false, error: true, message: "User not found", code: 404 });
    res.json({ success: true, error: false, message: "Updated", code: 200, data: updated });
  } catch (err) {
    res.json({ success: false, error: true, message: "Internal Server Error", code: 500 });
  }
};

// 🔹 Delete Employee
const deleteUser = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({ success: false, error: true, message: "Access denied", code: 403 });
  }
  try {
    const deleted = await userTbl.findByIdAndDelete(req.params.id);
    if (!deleted) return res.json({ success: false, error: true, message: "User not found", code: 404 });
    res.json({ success: true, error: false, message: "Deleted", code: 200 });
  } catch (err) {
    res.json({ success: false, error: true, message: "Internal Server Error", code: 500 });
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
  rejectPendingUser
};
