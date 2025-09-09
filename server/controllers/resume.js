const Resume = require('../models/Resume');
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { existsSync } = require('fs');

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
        mimeType: file.mimetype,
storedPath: file.path,
analysisMetadata: {
          processingTime,
          fileType: file.mimetype,
          pageCount
        }
      };

      const newResume = new Resume(resumeData);
      await newResume.save();

      
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

  // Download original resume file (PDF, DOCX, etc.)
  downloadResume: async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { id } = req.params;

      const resume = await Resume.findOne({ 
        _id: id, 
        userId, 
        isActive: true 
      }).select('originalName storedPath mimeType filename');

      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      
      // First try the stored absolute path (for backward compatibility)
      let filePath = resume.storedPath;
      let fileExists = existsSync(filePath);
      
      // If the file doesn't exist at the stored path, try to rebuild the path
      if (!fileExists) {
        // Rebuild path using the uploads directory and filename
        const uploadsDir = path.join(__dirname, '../uploads');
        filePath = path.join(uploadsDir, resume.filename);
        fileExists = existsSync(filePath);
      }
      
      if (!fileExists) {
        console.error(`Resume file not found at path: ${filePath}`);
        return res.status(404).json({ 
          message: 'Resume file not found on server', 
          error: 'FILE_NOT_FOUND'
        });
      }

      // Stream the file back to the client
      res.download(filePath, resume.originalName, (err) => {
        if (err) {
          console.error('File download error:', err);
          return next(err);
        }
      });

    } catch (error) {
      console.error('Resume download error:', error);
      next(error);
    }
  }
};

module.exports = resumeController;
















// const Resume = require('../models/Resume');
// const fs = require('fs').promises;
// const path = require('path');
// const pdfParse = require('pdf-parse');
// const mammoth = require('mammoth');

// const resumeController = {
//   // Extract text from uploaded file (called before validation middleware)
//   extractText: async (req, res, next) => {
//     try {
//       const file = req.file;
      
//       // Extract text from file
//       let extractedText = '';
//       let pageCount = null;
//       const startTime = Date.now();

//       try {
//         const fileBuffer = await fs.readFile(file.path);
        
//         if (file.mimetype === 'application/pdf') {
//           const pdfData = await pdfParse(fileBuffer);
//           extractedText = pdfData.text;
//           pageCount = pdfData.numpages;
//         } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//           // Extract text from DOCX
//           const result = await mammoth.extractRawText({ buffer: fileBuffer });
//           extractedText = result.value;
//           pageCount = null;
//         } else if (file.mimetype === 'application/msword') {
//           // For older DOC files
//           extractedText = 'DOC file format not fully supported. Please convert to DOCX or PDF for better results.';
//           pageCount = null;
//         } else {
//           extractedText = 'Unsupported file format for text extraction.';
//           pageCount = null;
//         }
//       } catch (parseError) {
//         console.error('Error parsing file:', parseError);
//         // Clean up uploaded file if parsing fails
//         await fs.unlink(file.path).catch(console.error);
//         return res.status(400).json({ message: 'Unable to parse resume content. Please ensure it\'s a valid PDF or DOCX file.' });
//       }

//       const processingTime = Date.now() - startTime;

//       // Attach extracted data to request for next middleware
//       req.extractedText = extractedText;
//       req.pageCount = pageCount;
//       req.processingTime = processingTime;

//       next();

//     } catch (error) {
//       // Clean up uploaded file if there's an error
//       if (req.file && req.file.path) {
//         await fs.unlink(req.file.path).catch(console.error);
//       }
//       next(error);
//     }
//   },

//   // Save resume to database (called after validation)
//   saveResume: async (req, res, next) => {
//     try {
//       const { userId } = req.user;
//       const file = req.file;
//       const { extractedText, pageCount, processingTime } = req;

//       // Create resume record in database
//       const resumeData = {
//         userId,
//         filename: file.filename,
//         originalName: file.originalname,
//         fileSize: file.size,
//         extractedText,
//         mimeType: file.mimetype,
// storedPath: file.path,
// analysisMetadata: {
//           processingTime,
//           fileType: file.mimetype,
//           pageCount
//         }
//       };

//       const newResume = new Resume(resumeData);
//       await newResume.save();

      
//       res.status(201).json({
//         message: 'Resume uploaded and processed successfully',
//         resume: {
//           id: newResume._id,
//           originalName: newResume.originalName,
//           fileSize: newResume.fileSize,
//           processingTime: newResume.analysisMetadata.processingTime,
//           uploadDate: newResume.createdAt
//         }
//       });

//     } catch (error) {
//       // Clean up uploaded file if there's an error
//       if (req.file && req.file.path) {
//         await fs.unlink(req.file.path).catch(console.error);
//       }
//       next(error);
//     }
//   },

//   // Get a specific user's resumes
//   getResumes: async (req, res, next) => {
//     try {
//       const { userId } = req.user;
      
//       const resumes = await Resume.find({ 
//         userId, 
//         isActive: true 
//       })
//       .select('originalName fileSize createdAt analysisMetadata')
//       .sort({ createdAt: -1 });

//       res.json({
//         resumes: resumes.map(resume => ({
//           id: resume._id,
//           originalName: resume.originalName,
//           fileSize: resume.fileSize,
//           uploadDate: resume.createdAt,
//           processingTime: resume.analysisMetadata?.processingTime
//         }))
//       });

//     } catch (error) {
//       next(error);
//     }
//   },

//   // Get specific resume details
//   getResumeById: async (req, res, next) => {
//     try {
//       const { userId } = req.user;
//       const { id } = req.params;

//       const resume = await Resume.findOne({ 
//         _id: id, 
//         userId, 
//         isActive: true 
//       });

//       if (!resume) {
//         return res.status(404).json({ message: 'Resume not found' });
//       }

//       res.json({
//         id: resume._id,
//         originalName: resume.originalName,
//         fileSize: resume.fileSize,
//         uploadDate: resume.createdAt,
//         processingTime: resume.analysisMetadata?.processingTime,
//         textLength: resume.extractedText.length,
//         // I shouldn't send full extracted text unless specifically needed
//         preview: resume.extractedText.substring(0, 200) + '...'
//       });

//     } catch (error) {
//       next(error);
//     }
//   },

//   // Download original resume file (PDF, DOCX, etc.)
//   downloadResume: async (req, res, next) => {
//     try {
//       const { userId } = req.user;
//       const { id } = req.params;

//       const resume = await Resume.findOne({ 
//         _id: id, 
//         userId, 
//         isActive: true 
//       }).select('originalName storedPath mimeType');

//       if (!resume) {
//         return res.status(404).json({ message: 'Resume not found' });
//       }

//       // Stream the original file back to the client
//       res.download(resume.storedPath, resume.originalName, (err) => {
//         if (err) {
//           console.error('File download error:', err);
//           return next(err);
//         }
//       });

//     } catch (error) {
//       next(error);
//     }
//   }
// };

// module.exports = resumeController;