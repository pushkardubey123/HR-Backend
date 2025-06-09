const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const userTbl = require("../Modals/User");

// 🔹 Register Employee (by Admin)
const register = async (req, res) => {
  try {
    const {
      name, email, password, role, phone, gender, dob, address,
      departmentId, designationId, shiftId, doj, emergencyContact
    } = req.body;

    if (await userTbl.findOne({ email })) {
      return res.json({ success: false, error: true, message: "Email already exists", code: 400 });
    }

    if (await userTbl.findOne({ phone })) {
      return res.json({ success: false, error: true, message: "Phone already exists", code: 400 });
    }

    let profilePic = null;
    if (req.files && req.files.profilePic) {
      const img = req.files.profilePic;
      const filename = `${Date.now()}_${img.name}`;
      const uploadPath = path.join(__dirname, "..", "uploads", filename);
      await img.mv(uploadPath);
      profilePic = filename;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userTbl({
      name, email, role, phone, gender, dob, address, departmentId,
      designationId, shiftId, doj, emergencyContact: JSON.parse(emergencyContact),
      passwordHash: hashedPassword, profilePic
    });

    const result = await user.save();
    res.json({ success: true, error: false, message: "Registered successfully", code: 201, result });
  } catch (err) {
    console.error("Register error:", err.message);
    res.json({ success: false, error: true, message: "Internal Server Error", code: 500 });
  }
};

// 🔹 Login
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

// 🔹 Get All Employees with Populated References
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

// 🔹 Get Single Employee
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
};
