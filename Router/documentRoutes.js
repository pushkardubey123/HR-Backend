const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const {
  uploadDocument,
  getDocuments,
  deleteDocument,
  editDocumentType,
} = require("../Controllers/documentController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

// -------------------- Upload Document --------------------
router.post("/upload", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("document"), uploadDocument);

// -------------------- Get Documents by Employee --------------------
router.get("/:employeeId", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("document"),  getDocuments);

// -------------------- Delete Document --------------------
router.delete("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("document"),  deleteDocument);

// -------------------- Edit Document Type --------------------
router.put("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("document"),  editDocumentType);

module.exports = router;
