const Document = require("../Modals/Document");
const path = require("path");
const fs = require("fs");
const deleteFile = require("../utils/deleteFile");
const userTbl = require("../Modals/User");

// Utility for current timestamp
const getCurrentTimestamp = () => new Date().toISOString();

// -------------------- Upload Document --------------------
const uploadDocument = async (req, res) => {
  try {
    const { employeeId, documentType } = req.body;

    if (!employeeId || !documentType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const employee = await userTbl.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    // Role-based access: admin of same company or employee themselves
    if (req.user.role === "employee" && req.user.id.toString() !== employeeId) {
      return res.status(403).json({ success: false, message: "You can only upload documents for yourself" });
    }
    if (req.user.role === "admin" && employee.companyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "You can only upload documents for your company's employees" });
    }

    const file = req.files.file;
    const filename = Date.now() + "_" + file.name;
    const uploadDir = path.join(__dirname, "..", "uploads", "documents");

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const finalPath = path.join(uploadDir, filename);
    await file.mv(finalPath);

    const newDoc = new Document({
      employeeId,
      companyId: employee.companyId || null,
      documentType,
      fileUrl: `documents/${filename}`,
      uploadedBy: req.user.id,
      uploadedAt: getCurrentTimestamp(),
    });

    const savedDoc = await newDoc.save();
    res.status(201).json({ success: true, message: "Document uploaded successfully", data: savedDoc });
  } catch (err) {
    console.error("Error in uploadDocument:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Get Documents --------------------
const getDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) return res.status(400).json({ success: false, message: "Employee ID is required" });

    const employee = await userTbl.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    // Role-based access with companyId
    if (req.user.role === "employee" && req.user.id.toString() !== employeeId) {
      return res.status(403).json({ success: false, message: "You can only view your own documents" });
    }
    if (req.user.role === "admin" && employee.companyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "You can only view documents of your company's employees" });
    }

    const docs = await Document.find({ employeeId, companyId: employee.companyId || null })
      .populate("uploadedBy", "name role")
      .populate("employeeId", "name email")
      .sort({ uploadedAt: -1 });

    res.status(200).json({ success: true, message: "Documents fetched successfully", data: docs });
  } catch (err) {
    console.error("Error in getDocuments:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Delete Document --------------------
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    // Role-based access with companyId
    if (req.user.role === "employee" && doc.uploadedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "You cannot delete this document" });
    }
    if (req.user.role === "admin" && doc.companyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "You cannot delete documents outside your company" });
    }

    deleteFile(doc.fileUrl);
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Document deleted successfully" });
  } catch (err) {
    console.error("Error in deleteDocument:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Edit Document Type --------------------
const editDocumentType = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.body;

    if (!documentType) return res.status(400).json({ success: false, message: "Document type is required" });

    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    // Role-based access with companyId
    if (req.user.role === "employee" && doc.uploadedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "You cannot edit this document" });
    }
    if (req.user.role === "admin" && doc.companyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "You cannot edit documents outside your company" });
    }

    doc.documentType = documentType;
    const updatedDoc = await doc.save();

    res.status(200).json({ success: true, message: "Document type updated successfully", data: updatedDoc });
  } catch (err) {
    console.error("Error in editDocumentType:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument,
  editDocumentType,
};
