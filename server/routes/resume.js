const express = require('express');
const resumeController = require('../controllers/resume');
const userAuth = require('../middleware/userAuth');
const { uploadMiddleware } = require('../middleware/uploadHandler');
const { validateResumeContent } = require('../middleware/dataValidation');

const router = express.Router();

// All resume routes require JWT authentication
router.use(userAuth);

// Upload new resume with validation chain
router.post('/upload', 
  uploadMiddleware,                          // Handle file upload
  resumeController.extractText,              // Extract text from file
  validateResumeContent,                     // Validate resume content  
  resumeController.saveResume                // Save to database
);

router.get('/', resumeController.getResumes);

router.get('/:id', resumeController.getResumeById);

// Get resume text content (for matching)
router.get('/:id/text', resumeController.getResumeText);

router.delete('/:id', resumeController.deleteResume);

module.exports = router;