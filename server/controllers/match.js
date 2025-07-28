const Match = require('../models/Match');
const Resume = require('../models/Resume');
const aiService = require('../services/aiService');

const matchController = {
  /*
   * Flow:
   * 1. Validate input (resumeId and jobDescription)
   * 2. Get resume text from database
   * 3. Send to AI service for analysis
   * 4. Save match result to database
   * 5. Return analysis to user
   */
  createMatch: async (req, res, next) => {
    try {
      const { userId } = req.user; // From JWT auth middleware
      const { resumeId, jobDescription } = req.body;
      
      if (!resumeId || !jobDescription) {
        return res.status(400).json({
          message: 'Both resumeId and jobDescription are required'
        });
      }

      if (jobDescription.length < 50) {
        return res.status(400).json({
          message: 'Job description too short. Please provide a detailed job description.'
        });
      }

      if (jobDescription.length > 10000) {
        return res.status(400).json({
          message: 'Job description too long. Please keep it under 10,000 characters.'
        });
      }

      console.log(`Creating match for user ${userId}, resume ${resumeId}`);

      // Find the resume and verify it belongs to the current user
      const resume = await Resume.findOne({
        _id: resumeId,
        userId: userId,
        isActive: true
      });

      if (!resume) {
        return res.status(404).json({
          message: 'Resume not found or you do not have access to it'
        });
      }

      // 3. PERFORM AI ANALYSIS
      console.log('Sending to AI for analysis...');
      const startTime = Date.now(); // Track processing time

      // Call our AI service to analyze the match
      const aiResult = await aiService.analyzeResumeMatch(
        resume.extractedText,
        jobDescription
      );

      const processingTime = Date.now() - startTime;
      console.log(`AI analysis completed in ${processingTime}ms`);

      if (!aiResult.success) {
        console.error('AI analysis failed:', aiResult.error);
        return res.status(500).json({
          message: 'Failed to analyze resume match. Please try again.',
          error: 'AI analysis error'
        });
      }
      
      // Create match record with all the data
      const matchData = {
        userId: userId,
        resumeId: resumeId,
        jobDescription: jobDescription,
        matchScore: aiResult.analysis.matchScore,
        aiSuggestions: [
          ...aiResult.analysis.strengths.map(s => `✓ ${s}`),
          ...aiResult.analysis.improvements.map(i => `→ ${i}`)
        ],
        // Enhanced fields (using model's structure)
        aiAnalysis: {
          primaryProvider: 'anthropic',
          responses: [{
            provider: 'anthropic',
            score: aiResult.analysis.matchScore,
            suggestions: aiResult.analysis.improvements,
            processingTime: processingTime,
            cost: Math.round(aiResult.usage.estimatedCost * 100000) / 100, // Convert to cents
            model: 'claude-3-5-haiku-20241022'
          }],
          finalScore: aiResult.analysis.matchScore,
          confidence: 95, // High confidence for single AI provider
          fallbackUsed: false
        },
        status: 'completed',
        performance: {
          totalProcessingTime: processingTime,
          cacheUsed: false,
          retryCount: 0,
          errorLog: []
        }
      };

      // Save to database
      const newMatch = new Match(matchData);
      await newMatch.save();

      console.log(`Match saved with ID: ${newMatch._id}`);
      
      // Return the analysis results to the user
      res.status(201).json({
        message: 'Resume match analysis completed successfully',
        match: {
          id: newMatch._id,
          matchScore: aiResult.analysis.matchScore,
          summary: aiResult.analysis.summary,
          strengths: aiResult.analysis.strengths,
          improvements: aiResult.analysis.improvements,
          missingSkills: aiResult.analysis.missingSkills,
          createdAt: newMatch.createdAt,
          resume: {
            id: resume._id,
            originalName: resume.originalName
          }
        },
        metadata: {
          processingTime: `${processingTime}ms`,
          estimatedCost: `$${aiResult.usage.estimatedCost.toFixed(6)}`,
          tokensUsed: aiResult.usage.inputTokens + aiResult.usage.outputTokens
        }
      });

    } catch (error) {
      console.error('Match creation error:', error);
      next(error);
    }
  }
};

module.exports = matchController;