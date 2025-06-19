const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/auth");
const documentController = require("../Controllers/documentController");

router.post("/", verifyToken, documentController.uploadDocument);
router.get("/", verifyToken, documentController.getAllDocuments);
router.get("/employee/:id", verifyToken, documentController.getDocumentsByEmployee);
router.delete("/:id", verifyToken, documentController.deleteDocument);

module.exports = router;
