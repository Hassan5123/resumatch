// server/services/aiService.js
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const aiService = {
  // Test connection to make sure API key works
  testConnection: async () => {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-4-5-sonnet-20250514', // Use your exact model string if different
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello! API connection is working." and nothing else.'
          }
        ]
      });

      return {
        success: true,
        message: response.content[0].text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Analyze resume against job description
  analyzeResumeMatch: async (resumeText, jobDescription) => {
    try {
      console.log('=== AI ANALYSIS STARTING ===');
      console.log('Resume length:', resumeText.length);
      console.log('Job description length:', jobDescription.length);

      const prompt = `You are an expert resume analyzer. Compare this resume against the job description and provide a detailed analysis.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Please analyze this resume against the job description and respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, just raw JSON):

{
  "matchScore": 85,
  "summary": "Brief 1-2 sentence summary of overall fit",
  "strengths": [
    "Specific strength 1",
    "Specific strength 2",
    "Specific strength 3"
  ],
  "improvements": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2",
    "Specific improvement suggestion 3"
  ],
  "missingSkills": [
    "Missing skill 1",
    "Missing skill 2"
  ]
}

CRITICAL: Return ONLY the raw JSON object above. Do not wrap it in markdown code blocks. Do not add any explanatory text before or after the JSON.`;

      console.log('Calling Anthropic API...');
      
      const response = await anthropic.messages.create({
        model: 'claude-4-5-sonnet-20250514',
        max_tokens: 1500, // INCREASED from 600 to 1500
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      console.log('API Response received');
      console.log('Input tokens:', response.usage.input_tokens);
      console.log('Output tokens:', response.usage.output_tokens);

      const aiResponseText = response.content[0].text.trim();
      console.log('Raw AI response (first 200 chars):', aiResponseText.substring(0, 200));

      // ✅ IMPROVED: Handle markdown code blocks
      let jsonText = aiResponseText;
      
      // Remove markdown code blocks if present
      if (jsonText.includes('```json')) {
        console.log('Removing markdown code blocks...');
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.includes('```')) {
        console.log('Removing generic code blocks...');
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      
      // Trim again after removing blocks
      jsonText = jsonText.trim();
      
      console.log('Cleaned JSON text (first 200 chars):', jsonText.substring(0, 200));

      // Try to parse the JSON response
      let analysisResult;
      try {
        analysisResult = JSON.parse(jsonText);
        console.log('JSON parsed successfully');
      } catch (parseError) {
        console.error('❌ JSON PARSE ERROR:', parseError.message);
        console.error('Attempted to parse:', jsonText);
        throw new Error(`AI returned invalid JSON format: ${parseError.message}`);
      }

      // ✅ IMPROVED: Validate and sanitize the response
      if (!analysisResult.matchScore && analysisResult.matchScore !== 0) {
        throw new Error('AI response missing matchScore field');
      }
      if (!analysisResult.summary) {
        throw new Error('AI response missing summary field');
      }
      if (!Array.isArray(analysisResult.strengths) || analysisResult.strengths.length === 0) {
        throw new Error('AI response missing or invalid strengths array');
      }
      if (!Array.isArray(analysisResult.improvements)) {
        analysisResult.improvements = []; // Optional field
      }
      if (!Array.isArray(analysisResult.missingSkills)) {
        analysisResult.missingSkills = []; // Optional field
      }

      // ✅ Ensure matchScore is a valid number between 0-100
      analysisResult.matchScore = Math.min(100, Math.max(0, Number(analysisResult.matchScore)));
      
      console.log('✅ Analysis successful! Match score:', analysisResult.matchScore);

      return {
        success: true,
        analysis: analysisResult,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          estimatedCost: ((response.usage.input_tokens * 3) + (response.usage.output_tokens * 15)) / 1000000
        }
      };

    } catch (error) {
      console.error('❌ RESUME ANALYSIS ERROR:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        errorType: error.constructor.name
      };
    }
  }
};

module.exports = aiService;








// const Anthropic = require('@anthropic-ai/sdk');

// // Initialize Anthropic client
// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// });

// const aiService = {
//   // Test connection to make sure API key works
//   testConnection: async () => {
//     try {
//       const response = await anthropic.messages.create({
//         model: 'claude-4-5-sonnet-20250514',
//         max_tokens: 50,
//         messages: [
//           {
//             role: 'user',
//             content: 'Say "Hello! API connection is working." and nothing else.'
//           }
//         ]
//       });

//       return {
//         success: true,
//         message: response.content[0].text,
//         usage: {
//           inputTokens: response.usage.input_tokens,
//           outputTokens: response.usage.output_tokens
//         }
//       };
//     } catch (error) {
//       console.error('AI Service Error:', error);
//       return {
//         success: false,
//         error: error.message
//       };
//     }
//   },

//   // Analyze resume against job description
//   analyzeResumeMatch: async (resumeText, jobDescription) => {
//     try {
//       const prompt = `You are an expert resume analyzer. Compare this resume against the job description and provide a detailed analysis.

// RESUME:
// ${resumeText}

// JOB DESCRIPTION:
// ${jobDescription}

// Please analyze this resume against the job description and respond with ONLY a valid JSON object in this exact format:

// {
//   "matchScore": [number from 0-100],
//   "summary": "[Brief 1-2 sentence summary of overall fit]",
//   "strengths": [
//     "[Specific strength 1]",
//     "[Specific strength 2]",
//     "[Specific strength 3]"
//   ],
//   "improvements": [
//     "[Specific improvement suggestion 1]",
//     "[Specific improvement suggestion 2]",
//     "[Specific improvement suggestion 3]"
//   ],
//   "missingSkills": [
//     "[Missing skill 1]",
//     "[Missing skill 2]"
//   ]
// }

// Requirements:
// - matchScore must be realistic
// - Be specific in strengths and improvements
// - Focus on relevant skills, experience, and qualifications
// - Keep suggestions actionable and concrete
// - Return ONLY the JSON object, no other text`;

//       const response = await anthropic.messages.create({
//         model: 'claude-4-5-sonnet-20250514',
//         max_tokens: 600,
//         messages: [
//           {
//             role: 'user',
//             content: prompt
//           }
//         ]
//       });

//       const aiResponseText = response.content[0].text.trim();
      
//       // Try to parse the JSON response
//       let analysisResult;
//       try {
//         analysisResult = JSON.parse(aiResponseText);
//       } catch (parseError) {
//         console.error('Failed to parse AI response as JSON:', aiResponseText);
//         throw new Error('AI returned invalid JSON format');
//       }

//       // Validate the response has required fields
//       if (!analysisResult.matchScore || !analysisResult.summary || !analysisResult.strengths) {
//         throw new Error('AI response missing required fields');
//       }

//       return {
//         success: true,
//         analysis: analysisResult,
//         usage: {
//           inputTokens: response.usage.input_tokens,
//           outputTokens: response.usage.output_tokens,
//           estimatedCost: ((response.usage.input_tokens * 3) + (response.usage.output_tokens * 15)) / 1000000
//         }
//       };

//     } catch (error) {
//       console.error('Resume analysis error:', error);
//       return {
//         success: false,
//         error: error.message
//       };
//     }
//   }
// };

// module.exports = aiService;