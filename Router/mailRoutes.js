const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/auth");
const companyMiddleware = require("../Middleware/companyMiddleware"); // ✅ added like attendance/notification

const {
  sendMail,
  getAllMails,
  getMyMails,
  downloadAttachment,
  getTrashedMails,
  moveToTrash,
  restoreMail,
  deleteMailPermanently,
  getAllUsers,
} = require("../Controllers/sendMailController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

// ✅ Apply auth + company middleware globally
router.use(verifyToken, companyMiddleware,subscriptionMiddleware,moduleAccess("mail"), );

// ✅ Mail routes (same endpoints, just companyId context added)
router.post("/send", sendMail);
router.get("/user/all", getAllUsers);
router.get("/", getAllMails);
router.get("/my-mails", getMyMails);
router.get("/download/:filename", downloadAttachment);

router.get("/trash", getTrashedMails);
router.put("/trash/:id", moveToTrash);
router.put("/restore/:id", restoreMail);
router.delete("/permanent-delete/:id", deleteMailPermanently);

module.exports = router;
