const Resume = require('../models/Resume');
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const resumeController = {
  // Extract text from uploaded file (called before validation middleware)
  extractText: async (req, res, next) => {
    try {
      const file = req.file;
      
      // Extract text from file
      let extractedText = '';
      let pageCount = null;
      const startTime = Date.now();

      try {
        const fileBuffer = await fs.readFile(file.path);
        
        if (file.mimetype === 'application/pdf') {
          const pdfData = await pdfParse(fileBuffer);
          extractedText = pdfData.text;
          pageCount = pdfData.numpages;
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Extract text from DOCX
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = result.value;
          pageCount = null;
        } else if (file.mimetype === 'application/msword') {
          // For older DOC files
          extractedText = 'DOC file format not fully supported. Please convert to DOCX or PDF for better results.';
          pageCount = null;
        } else {
          extractedText = 'Unsupported file format for text extraction.';
          pageCount = null;
        }
      } catch (parseError) {
        console.error('Error parsing file:', parseError);
        // Clean up uploaded file if parsing fails
        await fs.unlink(file.path).catch(console.error);
        return res.status(400).json({ message: 'Unable to parse resume content. Please ensure it\'s a valid PDF or DOCX file.' });
      }

      const processingTime = Date.now() - startTime;

      // Attach extracted data to request for next middleware
      req.extractedText = extractedText;
      req.pageCount = pageCount;
      req.processingTime = processingTime;

      next();

    } catch (error) {
      // Clean up uploaded file if there's an error
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      next(error);
    }
  },

  // Save resume to database (called after validation)
  saveResume: async (req, res, next) => {
    try {
      const { userId } = req.user;
      const file = req.file;
      const { extractedText, pageCount, processingTime } = req;

      // Create resume record in database
      const resumeData = {
        userId,
        filename: file.filename,
        originalName: file.originalname,
        fileSize: file.size,
        extractedText,
        analysisMetadata: {
          processingTime,
          fileType: file.mimetype,
          pageCount
        }
      };

      const newResume = new Resume(resumeData);
      await newResume.save();

      // Clean up uploaded file from disk (I've stored the data in DB)
      await fs.unlink(file.path).catch(console.error);

      res.status(201).json({
        message: 'Resume uploaded and processed successfully',
        resume: {
          id: newResume._id,
          originalName: newResume.originalName,
          fileSize: newResume.fileSize,
          processingTime: newResume.analysisMetadata.processingTime,
          uploadDate: newResume.createdAt
        }
      });

    } catch (error) {
      // Clean up uploaded file if there's an error
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      next(error);
    }
  },

  // Get a specific user's resumes
  getResumes: async (req, res, next) => {
    try {
      const { userId } = req.user;
      
      const resumes = await Resume.find({ 
        userId, 
        isActive: true 
      })
      .select('originalName fileSize createdAt analysisMetadata')
      .sort({ createdAt: -1 });

      res.json({
        resumes: resumes.map(resume => ({
          id: resume._id,
          originalName: resume.originalName,
          fileSize: resume.fileSize,
          uploadDate: resume.createdAt,
          processingTime: resume.analysisMetadata?.processingTime
        }))
      });

    } catch (error) {
      next(error);
    }
  },

  // Get specific resume details
  getResumeById: async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { id } = req.params;

      const resume = await Resume.findOne({ 
        _id: id, 
        userId, 
        isActive: true 
      });

      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      res.json({
        id: resume._id,
        originalName: resume.originalName,
        fileSize: resume.fileSize,
        uploadDate: resume.createdAt,
        processingTime: resume.analysisMetadata?.processingTime,
        textLength: resume.extractedText.length,
        // I shouldn't send full extracted text unless specifically needed
        preview: resume.extractedText.substring(0, 200) + '...'
      });

    } catch (error) {
      next(error);
    }
  },

  // Soft delete resume
  deleteResume: async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { id } = req.params;

      const resume = await Resume.findOne({ 
        _id: id, 
        userId, 
        isActive: true 
      });

      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      // Soft delete
      resume.isActive = false;
      await resume.save();

      res.json({ message: 'Resume deleted successfully' });

    } catch (error) {
      next(error);
    }
  },

  // Get resume text for matching (internal use)
  getResumeText: async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { id } = req.params;

      const resume = await Resume.findOne({ 
        _id: id, 
        userId, 
        isActive: true 
      }).select('extractedText originalName');

      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      res.json({
        id: resume._id,
        originalName: resume.originalName,
        extractedText: resume.extractedText
      });

    } catch (error) {
      next(error);
    }
  },

  // Download resume as text file (since original files aren't stored)
  downloadResume: async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { id } = req.params;

      const resume = await Resume.findOne({ 
        _id: id, 
        userId, 
        isActive: true 
      }).select('originalName extractedText createdAt');

      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      // Create filename without extension, add .txt
      const baseFilename = resume.originalName.replace(/\.[^/.]+$/, "");
      const filename = `${baseFilename}_extracted.txt`;

      // Set headers for file download
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Send the extracted text as downloadable file
      res.send(resume.extractedText);

    } catch (error) {
      next(error);
    }
  }
};

module.exports = resumeController;