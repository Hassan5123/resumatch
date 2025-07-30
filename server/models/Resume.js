const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  
  // Fields for enhanced features for potential future use
  processedData: {
    skills: [String],
    experience: [{
      company: String,
      role: String,
      duration: String
    }],
    education: [{
      institution: String,
      degree: String,
      year: String
    }],
    keywordsFrequency: mongoose.Schema.Types.Mixed, // Object with keyword counts
    qualityScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  mimeType: {
    type: String,
    required: true
  },
  storedPath: {
    type: String,
    required: true
  },
  analysisMetadata: {
    processingTime: Number,
    fileType: String,
    pageCount: Number
  }
}, {
  timestamps: true
});

// Index for faster queries
resumeSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Resume', resumeSchema);