const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const companyMw = require("../Middleware/companyMiddleware");
const subCtrl = require("../Controllers/SubscriptionController");

router.get("/price", auth, companyMw, subCtrl.getPrice);
router.post("/subscribe", auth, companyMw, subCtrl.subscribe);
router.get("/status", auth, companyMw, subCtrl.getStatus);

module.exports = router;
