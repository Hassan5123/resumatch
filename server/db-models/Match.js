const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobDescription: {
    type: String,
    required: true,
    maxlength: 5000
  },
  // Core matching results
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  aiSuggestions: [String],
  
  // Enhanced fields for multi-AI and advanced features
  aiAnalysis: {
    primaryProvider: {
      type: String,
      enum: ['openai', 'anthropic', 'google'],
      default: 'openai'
    },
    responses: [{
      provider: {
        type: String,
        enum: ['openai', 'anthropic', 'google']
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      suggestions: [String],
      processingTime: Number, // milliseconds
      cost: Number, // API cost in cents
      model: String // 'gpt-3.5-turbo', etc
    }],
    finalScore: Number, // Computed from multiple AI responses
    confidence: Number, // How much AI responses agreed (0-100)
    fallbackUsed: Boolean // True if backup AI was used
  },
  
  // Real-time processing status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingSteps: [{
    step: String, // 'pdf_extraction', 'ai_analysis', 'scoring'
    status: String, // 'pending', 'in_progress', 'completed', 'failed'
    timestamp: {
      type: Date,
      default: Date.now
    },
    duration: Number // milliseconds
  }],
  
  // Advanced analytics data
  analytics: {
    skillsMatch: {
      matched: [String],
      missing: [String],
      score: Number
    },
    experienceMatch: {
      relevantExperience: Number, // years
      score: Number
    },
    keywordAnalysis: {
      totalKeywords: Number,
      matchedKeywords: Number,
      score: Number
    }
  },
  
  // Performance tracking
  performance: {
    totalProcessingTime: Number,
    cacheUsed: Boolean, // True if cached response was used
    retryCount: Number, // Number of retries if failed
    errorLog: [String]
  }
}, {
  timestamps: true
});

// Indexes for performance
matchSchema.index({ userId: 1, createdAt: -1 }); // User's matches by date
matchSchema.index({ 'aiAnalysis.primaryProvider': 1 }); // AI provider analytics
matchSchema.index({ matchScore: 1 }); // Score-based queries

// Calculate composite score from multiple AI responses
matchSchema.methods.calculateFinalScore = function() {
  const responses = this.aiAnalysis.responses;
  if (responses.length === 0) return this.matchScore;
  
  // Weighted average (primary provider gets more weight)
  let totalWeight = 0;
  let weightedSum = 0;
  
  responses.forEach(response => {
    const weight = response.provider === this.aiAnalysis.primaryProvider ? 0.6 : 0.4;
    weightedSum += response.score * weight;
    totalWeight += weight;
  });
  
  return Math.round(weightedSum / totalWeight);
};

// Calculate confidence based on AI response agreement
matchSchema.methods.calculateConfidence = function() {
  const responses = this.aiAnalysis.responses;
  if (responses.length < 2) return 100;
  
  const scores = responses.map(r => r.score);
  const avgScore = scores.reduce((a, b) => a + b) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
  
  // Convert variance to confidence (lower variance = higher confidence)
  return Math.max(0, 100 - variance);
};

module.exports = mongoose.model('Match', matchSchema);