// server/middleware/dataValidation.js
const fs = require('fs').promises;

const dataValidation = {
  // Validate resume content after text extraction
  validateResumeContent: async (req, res, next) => {
    try {
      const { extractedText } = req;
      
      // Check if text extraction was successful
      if (!extractedText || extractedText.trim().length === 0) {
        // Clean up uploaded file
        if (req.file && req.file.path) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(400).json({ 
          message: 'No text content could be extracted from the file. Please ensure it\'s a readable PDF or DOCX with actual content.' 
        });
      }

      // Check minimum content length (resumes should have substantial content)
      if (extractedText.trim().length < 100) {
        // Clean up uploaded file
        if (req.file && req.file.path) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(400).json({ 
          message: 'Resume content appears too short. Please ensure the file contains a complete resume.' 
        });
      }

      // Check maximum content length (prevent extremely large files)
      if (extractedText.length > 50000) {
        // Clean up uploaded file
        if (req.file && req.file.path) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(400).json({ 
          message: 'Resume content is too long. Please upload a standard resume document.' 
        });
      }

      const lowerText = extractedText.toLowerCase();

      // REJECT: Job descriptions and job postings
      const jobDescriptionIndicators = [
        'we are seeking', 'we are looking for', 'join our team', 'about the company',
        'job description', 'position:', 'location:', 'company:', 'role overview',
        'key responsibilities:', 'responsibilities:', 'qualifications:', 'requirements:',
        'why join', 'about us:', 'the ideal candidate', 'we offer', 'benefits:',
        'apply now', 'send resume', 'years of experience required', 'salary range',
        'compensation:', 'equal opportunity employer'
      ];

      const hasJobDescriptionIndicators = jobDescriptionIndicators.some(indicator => 
        lowerText.includes(indicator)
      );

      if (hasJobDescriptionIndicators) {
        if (req.file && req.file.path) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(400).json({ 
          message: 'This appears to be a job description, not a resume. Please upload your personal resume document instead.' 
        });
      }

      // REJECT: Essays, reports, assignments, and other non-resume documents
      const nonResumeIndicators = [
        'reflection on', 'in conclusion', 'to conclude', 'in summary', 'this essay',
        'this paper', 'this report', 'assignment', 'homework', 'first and foremost',
        'documentary', 'film', 'movie', 'analysis of', 'reflection', 'i apologize',
        'sorry for', 'apology', 'furthermore', 'in addition', 'moreover', 'thesis',
        'abstract:', 'introduction:', 'methodology:', 'discussion:', 'bibliography',
        'works cited', 'references:', 'footnote', 'chapter', 'paragraph', 'side notes:',
        'lastly, i would', 'inspired by', 'this reminded me', 'it made me think'
      ];

      const hasNonResumeIndicators = nonResumeIndicators.some(indicator => 
        lowerText.includes(indicator)
      );

      if (hasNonResumeIndicators) {
        if (req.file && req.file.path) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(400).json({ 
          message: 'This appears to be an essay, report, or other document type. Please upload a professional resume instead.' 
        });
      }

      // REQUIRE: Resume must have actual resume structure indicators
      const resumeStructureIndicators = [
        // Contact information
        'email:', 'phone:', 'linkedin:', 'address:', '@',
        
        // Resume sections
        'experience:', 'work experience:', 'employment:', 'professional experience:',
        'education:', 'academic background:', 'qualifications:',
        'skills:', 'technical skills:', 'core competencies:', 'abilities:',
        'objective:', 'summary:', 'profile:', 'career objective:', 'personal statement:',
        
        // Resume-specific language
        'resume', 'curriculum vitae', 'cv', 'professional summary',
        
        // Work history indicators
        'worked at', 'employed at', 'position at', 'role at', 'served as',
        'responsible for', 'managed', 'led', 'developed', 'created', 'implemented',
        
        // Education indicators  
        'graduated from', 'degree in', 'bachelor', 'master', 'phd', 'university of',
        'college of', 'institute of', 'school of'
      ];

      const resumeStructureScore = resumeStructureIndicators.filter(indicator => 
        lowerText.includes(indicator)
      ).length;

      // Must have at least 3 resume structure indicators
      if (resumeStructureScore < 3) {
        if (req.file && req.file.path) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(400).json({ 
          message: 'This document does not appear to have the structure of a professional resume. Please upload a properly formatted resume with sections like Experience, Education, and Skills.' 
        });
      }

      // REQUIRE: Must have professional work experience indicators
      const workExperienceIndicators = [
        'years of experience', 'experience in', 'worked as', 'served as', 'position as',
        'employed as', 'responsible for', 'duties included', 'achievements include',
        'accomplishments:', 'managed', 'led', 'supervised', 'coordinated', 'developed',
        'created', 'implemented', 'analyzed', 'designed', 'maintained', 'improved'
      ];

      const hasWorkExperience = workExperienceIndicators.some(indicator => 
        lowerText.includes(indicator)
      );

      if (!hasWorkExperience) {
        if (req.file && req.file.path) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(400).json({ 
          message: 'This document does not appear to contain professional work experience. Please upload a complete resume with your work history.' 
        });
      }

      // REQUIRE: Must have education or skills section
      const educationSkillsIndicators = [
        'education:', 'academic background:', 'qualifications:', 'degree in',
        'graduated from', 'university', 'college', 'bachelor', 'master',
        'skills:', 'technical skills:', 'core competencies:', 'proficient in',
        'experience with', 'knowledge of', 'familiar with'
      ];

      const hasEducationOrSkills = educationSkillsIndicators.some(indicator => 
        lowerText.includes(indicator)
      );

      if (!hasEducationOrSkills) {
        if (req.file && req.file.path) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(400).json({ 
          message: 'This document does not appear to contain education or skills information. Please upload a complete resume.' 
        });
      }

      // If all validations pass, continue to next middleware
      next();

    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      next(error);
    }
  }
};

module.exports = dataValidation;