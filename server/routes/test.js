const express = require('express');
const aiService = require('../services/aiService');
const userAuth = require('../middleware/userAuth');

const router = express.Router();

// Test AI connection (protected route)
router.get('/ai-connection', userAuth, async (req, res) => {
  try {
    console.log('Testing AI connection...');
    const result = await aiService.testConnection();
    
    if (result.success) {
      res.json({
        message: 'AI connection successful!',
        aiResponse: result.message,
        tokenUsage: result.usage
      });
    } else {
      res.status(500).json({
        message: 'AI connection failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({
      message: 'Server error during AI test',
      error: error.message
    });
  }
});

// Test resume matching (protected route)
router.post('/resume-match', userAuth, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    // Basic validation
    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        message: 'Both resumeText and jobDescription are required'
      });
    }

    console.log('Testing resume matching...');
    const result = await aiService.analyzeResumeMatch(resumeText, jobDescription);
    
    if (result.success) {
      res.json({
        message: 'Resume analysis successful!',
        analysis: result.analysis,
        usage: result.usage,
        estimatedCost: `${result.usage.estimatedCost.toFixed(6)}`
      });
    } else {
      res.status(500).json({
        message: 'Resume analysis failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Resume match test error:', error);
    res.status(500).json({
      message: 'Server error during resume analysis',
      error: error.message
    });
  }
});

module.exports = router;