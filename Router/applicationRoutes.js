const express = require('express');
const router = express.Router();
const { 
  applyJob, 
  getApplications, 
  getApplicationById,
  rejectApplication, 
  shortlistApplication 
} = require('../Controllers/applicationController');
const auth = require('../Middleware/auth');

// Public → apply job
router.post('/', applyJob);

// Admin → see applications
router.get('/', auth, getApplications);
router.get('/:id', auth, getApplicationById);

// Application status change
router.put("/:id/reject", auth, rejectApplication);
router.put("/:id/shortlist", auth, shortlistApplication);

module.exports = router;
