const router = require("express").Router();
const auth = require("../Middleware/auth");
const {
  createExitRequest,
  getAllExitRequests,
  getExitRequestsByEmployee,
  updateExitRequestByAdmin,
  deleteExitRequest
} = require("../Controllers/exitController");

router.post("/submit", auth, createExitRequest); // Employee submit
router.get("/my-requests", auth, getExitRequestsByEmployee); // Employee view
router.get("/", auth, getAllExitRequests); // Admin view all
router.put("/:id", auth, updateExitRequestByAdmin); // Admin update
router.delete("/:id", auth, deleteExitRequest); // Admin delete

module.exports = router;
