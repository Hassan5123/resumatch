require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');
const Resume = require('../models/Resume');

async function connectDB() {
  try {
    const connection = process.env.MONGODB_URL;
    
    if (!connection) {
      console.error('Error: MONGODB_URL not found in environment variables');
      process.exit(1);
    }
    
    await mongoose.connect(connection);
    console.log('Connected to MongoDB Atlas for migration');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

async function migrateExistingResumes() {
  console.log('Starting resume migration to base64...');
  
  // Find all resumes that don't have fileData field
  const resumes = await Resume.find({ fileData: { $exists: false } });
  console.log(`Found ${resumes.length} resumes to migrate`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const resume of resumes) {
    try {
      // First check stored path
      let filePath = resume.storedPath;
      let fileExists = existsSync(filePath);
      
      // If file not found at original path, try reconstructing the path
      if (!fileExists) {
        const uploadsDir = path.join(__dirname, '../uploads');
        filePath = path.join(uploadsDir, resume.filename);
        fileExists = existsSync(filePath);
      }
      
      // If file exists, add base64 data
      if (fileExists) {
        console.log(`Processing resume ${resume._id} (${resume.originalName})...`);
        const fileBuffer = await fs.readFile(filePath);
        resume.fileData = fileBuffer.toString('base64');
        await resume.save();
        console.log(`✓ Successfully migrated resume: ${resume._id}`);
        successCount++;
      } else {
        console.log(`✗ Could not find file for resume: ${resume._id} (${resume.originalName})`);
        failCount++;
      }
    } catch (err) {
      console.error(`✗ Failed to migrate resume ${resume._id}:`, err.message);
      failCount++;
    }
  }
  
  console.log('\nMigration Summary:');
  console.log(`- Total resumes found: ${resumes.length}`);
  console.log(`- Successfully migrated: ${successCount}`);
  console.log(`- Failed to migrate: ${failCount}`);
  
  if (failCount > 0) {
    console.log('\nSome resumes could not be migrated. These will only work if:');
    console.log('1. They were already stored in GridFS');
    console.log('2. The local file paths are still valid');
  }
}

// Main function
async function main() {
  await connectDB();
  await migrateExistingResumes();
  console.log('Migration process completed');
  process.exit(0);
}

// Run the script
main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});