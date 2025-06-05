const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const userTbl = require("../Modals/User");

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      gender,
      dob,
      address,
      departmentId,
      designationId,
      shiftId,
      doj,
      emergencyContact,
    } = req.body;

    const existingEmail = await userTbl.findOne({ email });
    if (existingEmail) {
      return res.json({
        success: false,
        error: true,
        message: "Email already exists !",
        code: 400,
      });
    }

    const existingPhone = await userTbl.findOne({ phone });
    if (existingPhone) {
      return res.json({
        success: false,
        error: true,
        message: "Phone number already exists !",
        code: 400,
      });
    }

    let profilePic = null;
    if (req.files && req.files.profilePic) {
      const img = req.files.profilePic;
      const filename = `${Date.now()}_${img.name}`;
      const uploadPath = path.join(__dirname, "..", "uploads", filename);
      await img.mv(uploadPath);
      profilePic = filename;
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new userTbl({
      name,
      email,
      role,
      phone,
      gender,
      dob,
      address,
      departmentId,
      designationId,
      shiftId,
      doj,
      emergencyContact: JSON.parse(emergencyContact),
      passwordHash: hash,
      profilePic,
    });

    const result = await user.save();
    if (result) {
      res.json({
        success: true,
        error: false,
        message: "Registered successfully",
        code: 201,
        result
      });
    } else {
      res.json({
        success: false,
        error: true,
        message: "Registration failed !",
        code: 400,
        result:''
      });
    }
  } catch (err) {
    console.error("Register error:", err.message);
    res.json({
      success: false,
      error: true,
      message: "Internal Server Error !",
      code: 500,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userTbl.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        error: true,
        message: "Email not found",
        code: 400,
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.json({
        success: false,
        error: true,
        message: "Invalid password",
        code: 400,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      error: false,
      message: "Login successful",
      code: 200,
      token: token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        phone: user.phone,
        departmentId: user.departmentId,
        designationId: user.designationId,
        shiftId: user.shiftId,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500,
    });
  }
};

const getAllUsers = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({
      success: false,
      error: true,
      message: "Access denied. Admin only.",
      code: 403
    });
  }

  try {
    const users = await userTbl.find({ role: "employee" }).select("-passwordHash");
    res.json({
      success: true,
      error: false,
      message: "Employee list fetched successfully",
      code: 200,
      data: users
    });
  } catch (err) {
    res.json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500
    });
  }
};

// 🔹 GET SINGLE USER BY ID
const getUserById = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({
      success: false,
      error: true,
      message: "Access denied. Admin only.",
      code: 403
    });
  }

  try {
    const user = await userTbl.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res.json({
        success: false,
        error: true,
        message: "Employee not found",
        code: 404
      });
    }

    res.json({
      success: true,
      error: false,
      message: "Employee details fetched successfully",
      code: 200,
      data: user
    });
  } catch (err) {
    res.json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500
    });
  }
};

// 🔹 UPDATE USER
const updateUser = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({
      success: false,
      error: true,
      message: "Access denied. Admin only.",
      code: 403
    });
  }

  try {
    const updated = await userTbl.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.json({
        success: false,
        error: true,
        message: "Employee not found",
        code: 404
      });
    }

    res.json({
      success: true,
      error: false,
      message: "Employee updated successfully",
      code: 200,
      data: updated
    });
  } catch (err) {
    res.json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500
    });
  }
};

// 🔹 DELETE USER
const deleteUser = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({
      success: false,
      error: true,
      message: "Access denied. Admin only.",
      code: 403
    });
  }

  try {
    const deleted = await userTbl.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.json({
        success: false,
        error: true,
        message: "Employee not found",
        code: 404
      });
    }

    res.json({
      success: true,
      error: false,
      message: "Employee deleted successfully",
      code: 200
    });
  } catch (err) {
    res.json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500
    });
  }
};

module.exports = { register, login,getAllUsers,
  getUserById,
  updateUser,
  deleteUser };
