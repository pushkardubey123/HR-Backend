const express = require("express");
const router = express.Router();
const { setOfficeTiming, getOfficeTiming } = require("../Controllers/settingsController");
const auth = require("../Middleware/auth");

router.post("/timing", auth, setOfficeTiming);
router.get("/timing", auth, getOfficeTiming);

module.exports = router;