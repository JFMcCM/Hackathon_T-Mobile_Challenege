// Simple test runner for geminiService.js
import { analyzeResponseWithGemini } from './geminiService.js';

// Sample feedback data to test the analysis
const sampleFeedback = {
  socialMedia: "Love the new T-Mobile 5G coverage in my area! Super fast speeds. #TMobile",
  surveys: "Customer service was helpful but wait times were long. 4/5 stars.",
  emails: "Having issues with billing. Please help resolve ASAP."
};

console.log('Testing Gemini service with sample feedback...');

try {
  const result = await analyzeResponseWithGemini(sampleFeedback);
  console.log('\nAnalysis Results:');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('\nError testing Gemini service:', error.message);
  if (!process.env.VITE_GEMINI_API_KEY) {
    console.log('\nTip: Set VITE_GEMINI_API_KEY in .env file or environment to test with real API');
  }
}