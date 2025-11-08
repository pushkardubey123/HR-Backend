const Job = require("../Modals/Job");

// -------------------- Add Job --------------------
const addJob = async (req, res) => {
  try {
    const body = { ...req.body, companyId: req.user.id }; // attach companyId

    if (typeof body.skills === "string") {
      body.skills = body.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const job = await Job.create(body);
    res.status(201).json({
      success: true,
      error: false,
      message: "Job created successfully",
      code: 201,
      data: job,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message,
      code: 400,
    });
  }
};

// -------------------- Get all Jobs --------------------
const getJobs = async (req, res) => {
  try {
    let filter = {};

    // 🧠 If logged in as admin or employee, filter company jobs
    if (req.user) {
      if (req.user.role === "admin") filter.companyId = req.user.id;
      if (req.user.role === "employee")
        filter.companyId = req.user.companyId || req.user.id;
    }

    // 🧩 Fetch jobs + populate admin/company name
    const data = await Job.find(filter)
      .populate("companyId", "name email") // <--- admin info
      .populate("departmentId", "name")
      .populate("designationId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      error: false,
      message: "Jobs fetched successfully",
      code: 200,
      data,
    });
  } catch (err) {
    console.error("Get Jobs Error:", err);
    res.status(500).json({
      success: false,
      error: true,
      message: err.message,
      code: 500,
    });
  }
};

// -------------------- Get Job by ID --------------------
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("companyId", "name email")
      .populate("departmentId", "name")
      .populate("designationId", "name");

    if (!job)
      return res.status(404).json({
        success: false,
        error: true,
        message: "Job not found",
        code: 404,
      });

    res.status(200).json({
      success: true,
      error: false,
      message: "Job fetched successfully",
      code: 200,
      data: job,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: true,
      message: err.message,
      code: 404,
    });
  }
};

// -------------------- Update Job --------------------
const updateJob = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.skills === "string") {
      body.skills = body.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.id },
      body,
      { new: true }
    );

    if (!job)
      return res.status(404).json({
        success: false,
        error: true,
        message: "Job not found",
        code: 404,
      });

    res.status(200).json({
      success: true,
      error: false,
      message: "Job updated successfully",
      code: 200,
      data: job,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message,
      code: 400,
    });
  }
};

// -------------------- Delete Job --------------------
const deleteJob = async (req, res) => {
  try {
    const deleted = await Job.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.id,
    });
    if (!deleted)
      return res.status(404).json({
        success: false,
        error: true,
        message: "Job not found",
        code: 404,
      });

    res.status(200).json({
      success: true,
      error: false,
      message: "Job deleted successfully",
      code: 200,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message,
      code: 400,
    });
  }
};

module.exports = {
  addJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};
