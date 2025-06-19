const Document = require("../Modals/Document");
const User = require("../Modals/Document");

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    const { documentType, employeeId } = req.body;
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const file = req.files.file;
    const fileName = Date.now() + "_" + file.name;
    const filePath = __dirname + `/../uploads/documents/${fileName}`;

    file.mv(filePath, async (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "File upload failed", error: err });
      }

      const doc = await Document.create({
        employeeId,
        documentType,
        fileUrl: `/uploads/documents/${fileName}`,
      });

      res.status(201).json({ success: true, message: "Document uploaded", data: doc });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Upload failed", error: error.message });
  }
};

// Get all documents (Admin)
exports.getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find().populate("employeeId", "name email");
    res.json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching documents", error: error.message });
  }
};

// Get employee documents
exports.getDocumentsByEmployee = async (req, res) => {
  try {
    const docs = await Document.find({ employeeId: req.params.id });
    res.json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching documents", error: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting document", error: error.message });
  }
};
