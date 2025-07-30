const Match = require('../models/Match');
const Resume = require('../models/Resume');
const aiService = require('../services/aiService');

const matchController = {
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

      // PERFORM AI ANALYSIS
      console.log('Sending to AI for analysis...');
      const startTime = Date.now(); // Track processing time

      // Call AI service to analyze the match
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
        summary: aiResult.analysis.summary,
        strengths: aiResult.analysis.strengths,
        improvements: aiResult.analysis.improvements,
        missingSkills: aiResult.analysis.missingSkills,
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
  },

  // Get all matches for a user with resume details
  getMatches: async (req, res, next) => {
    try {
      const { userId } = req.user;
      
      // Get matches with resume data populated
      const matches = await Match.find({ userId })
        .populate('resumeId', 'originalName fileSize createdAt')
        .sort({ createdAt: -1 })
        .select('matchScore jobDescription createdAt aiAnalysis performance');

      const formattedMatches = matches.map(match => ({
        id: match._id,
        matchScore: match.matchScore,
        jobDescription: match.jobDescription.substring(0, 200) + '...', // Preview only
        createdAt: match.createdAt,
        resume: {
          id: match.resumeId._id,
          originalName: match.resumeId.originalName,
          fileSize: match.resumeId.fileSize,
          uploadDate: match.resumeId.createdAt
        },
        metadata: {
          processingTime: `${match.performance?.totalProcessingTime || 0}ms`,
          estimatedCost: `$${((match.aiAnalysis?.responses[0]?.cost || 0) / 100).toFixed(6)}`,
          model: match.aiAnalysis?.responses[0]?.model || 'claude-3-5-haiku-20241022'
        }
      }));

      res.json({
        matches: formattedMatches,
        totalMatches: matches.length
      });

    } catch (error) {
      next(error);
    }
  },

  // Get specific match with full details
  getMatchById: async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { id } = req.params;

      const match = await Match.findOne({ 
        _id: id, 
        userId 
      }).populate('resumeId', 'originalName fileSize createdAt extractedText');

      if (!match) {
        return res.status(404).json({ 
          message: 'Match not found' 
        });
      }

      res.json({
        message: 'Match details retrieved successfully',
        match: {
          id: match._id,
          matchScore: match.matchScore,
          summary: match.summary,
          strengths: match.strengths,
          improvements: match.improvements,
          missingSkills: match.missingSkills,
          jobDescription: match.jobDescription,
          createdAt: match.createdAt,
          resume: {
            id: match.resumeId._id,
            originalName: match.resumeId.originalName,
            fileSize: match.resumeId.fileSize,
            uploadDate: match.resumeId.createdAt
          }
        },
        metadata: {
          processingTime: `${match.performance?.totalProcessingTime || 0}ms`,
          estimatedCost: `$${((match.aiAnalysis?.responses[0]?.cost || 0) / 100).toFixed(6)}`,
          tokensUsed: match.aiAnalysis?.responses[0]?.processingTime || 0
        }
      });

    } catch (error) {
      next(error);
    }
  }
};

module.exports = matchController;