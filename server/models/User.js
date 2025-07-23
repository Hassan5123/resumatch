const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Fields for enhanced features for potential future use
  preferences: {
    aiProvider: {
      type: String,
      enum: ['openai', 'anthropic', 'google'],
      default: 'openai'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalMatches: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    lastMatchScore: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Update user stats after new match
userSchema.methods.updateStats = async function(newScore) {
  this.stats.totalMatches += 1;
  this.stats.lastMatchScore = newScore;
  
  // Calculate new average
  const matches = await mongoose.model('Match').find({ userId: this._id });
  const totalScore = matches.reduce((sum, match) => sum + match.matchScore, 0);
  this.stats.averageScore = Math.round(totalScore / matches.length);
  
  await this.save();
};

module.exports = mongoose.model('User', userSchema);