const Application = require("../Modals/Application");
const userTbl = require("../Modals/User");
const path = require("path");
const fs = require("fs");
const Job = require("../Modals/Job");

// -------------------- Apply Job --------------------
const applyJob = async (req, res) => {
  try {
    const body = { ...req.body };

    // 🔍 Validate jobId
    const job = await Job.findById(body.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // 📎 Auto attach companyId from the Job (important)
    body.companyId = job.companyId;

    // 🧾 Handle file uploads (profileImage, resume, coverLetter)
    if (req.files) {
      const uploadDir = "uploads/applications";
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      if (req.files.profileImage) {
        const profileImage = req.files.profileImage;
        const profilePath = path.join(uploadDir, Date.now() + "-" + profileImage.name);
        await profileImage.mv(profilePath);
        body.profileImage = profilePath;
      }

      if (req.files.resume) {
        const resume = req.files.resume;
        const resumePath = path.join(uploadDir, Date.now() + "-" + resume.name);
        await resume.mv(resumePath);
        body.resume = resumePath;
      }

      if (req.files.coverLetter) {
        const coverLetter = req.files.coverLetter;
        const coverPath = path.join(uploadDir, Date.now() + "-" + coverLetter.name);
        await coverLetter.mv(coverPath);
        body.coverLetter = coverPath;
      }
    }

    // 👤 If logged in, link to user
    if (req.user) {
      body.userId = req.user.id;
    }

    const application = await Application.create(body);
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (err) {
    console.error("Error in applyJob:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// -------------------- Get All Applications --------------------
const getApplications = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "admin") filter.companyId = req.user.id;
    if (req.user.role === "employee") filter.userId = req.user.id;
    if (req.user.role === "superadmin") filter = {}; // superadmin can view all if needed

    const data = await Application.find(filter).populate("jobId", "title departmentId designationId");
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error in getApplications:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Get Application By ID --------------------
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate("jobId", "title description");
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    // Role-based access
    if (req.user.role === "admin" && application.companyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (req.user.role === "employee" && application.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: application });
  } catch (err) {
    console.error("Error in getApplicationById:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Reject Application --------------------
const rejectApplication = async (req, res) => {
  try {
    if (req.user.role === "employee") {
      return res.status(403).json({ success: false, message: "Employees cannot reject applications" });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    // Admin can only reject their company's applications
    if (req.user.role === "admin" && application.companyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    application.status = "rejected";
    await application.save();
    res.status(200).json({ success: true, message: "Application rejected", application });
  } catch (err) {
    console.error("Error in rejectApplication:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Shortlist Application --------------------
const shortlistApplication = async (req, res) => {
  try {
    if (req.user.role === "employee") {
      return res.status(403).json({ success: false, message: "Employees cannot shortlist applications" });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    // Admin can only shortlist their company's applications
    if (req.user.role === "admin" && application.companyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    application.status = "shortlisted";
    await application.save();
    res.status(200).json({ success: true, message: "Application shortlisted", application });
  } catch (err) {
    console.error("Error in shortlistApplication:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  applyJob,
  getApplications,
  getApplicationById,
  rejectApplication,
  shortlistApplication,
};
