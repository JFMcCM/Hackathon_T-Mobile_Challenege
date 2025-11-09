import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

// Load .env file for Node.js execution
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value && !process.env[key.trim()]) {
      process.env[key.trim()] = value.trim();
    }
  });
}

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnVAnsObBnci0E3xuv3lVoznUnoTqXANE",
  authDomain: "tmobilechallenge.firebaseapp.com",
  projectId: "tmobilechallenge",
  storageBucket: "tmobilechallenge.firebasestorage.app",
  messagingSenderId: "531685921823",
  appId: "1:531685921823:web:bb7e4d4c3021448fd1712a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY not found in .env file. Please check your .env configuration.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Helper function to extract JSON from markdown code blocks
function extractJSON(text) {
    // Remove markdown code block markers (```json or ```)
    let cleaned = text.trim();
    
    // Check if wrapped in code blocks
    if (cleaned.startsWith('```')) {
        // Remove opening ```json or ```
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
        // Remove closing ```
        cleaned = cleaned.replace(/\n?```\s*$/, '');
    }
    
    // Try to find JSON object in the text if it's not clean
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleaned = jsonMatch[0];
    }
    
    return cleaned.trim();
}

export async function analyzeSentiments() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const querySnapshot = await getDocs(collection(db, 'SurveyResponses'));
        const analyses = [];
        
        for (const userDoc of querySnapshot.docs) {
            const userData = userDoc.data();
            
            const textToAnalyze = `
Customer Ratings:
- Connectivity: ${userData.connectivityRating || 'N/A'}/5
- Customer Service: ${userData.customerServiceRating || 'N/A'}/5
- Internet Speed: ${userData.internetSpeedRating || 'N/A'}/5
- Price: ${userData.priceRating || 'N/A'}/5

Customer Feedback:
- Features to Improve: ${userData.featuresToImprove || 'N/A'}
- Most Important Aspects: ${userData.mostImportantAspects || 'N/A'}
- Other Aspects: ${userData.otherAspects || 'N/A'}

Additional Information:
- Location: ${userData.location || 'N/A'}
- Years as Customer: ${userData.yearAsCustomer || 'N/A'}
`;
            
            const prompt = `Analyze the following T-Mobile customer feedback data and provide a comprehensive sentiment analysis. Consider both the numerical ratings and text feedback.

Please analyze:
1. Overall satisfaction based on the numerical ratings
2. Key concerns or positive points from the text feedback
3. Customer loyalty indicators (years as customer)

Provide a rating from 1 to 5 where:
1 = Very Dissatisfied
2 = Dissatisfied
3 = Neutral
4 = Satisfied
5 = Very Satisfied

Format the response as valid JSON only (no markdown code blocks, just the JSON object) with:
- 'rating': numerical rating (1-5)
- 'explanation': detailed analysis explanation
- 'keyIssues': main concerns identified (if any)
- 'positiveAspects': main positive points identified (if any)

Return only the JSON object, no additional text or markdown formatting.

Here's the customer data to analyze:

${textToAnalyze}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            const jsonText = extractJSON(text);
            const analysis = JSON.parse(jsonText);

            await updateDoc(doc(db, 'SurveyResponses', userDoc.id), {
                sentimentRating: analysis.rating,
                sentimentExplanation: analysis.explanation,
                analyzedAt: new Date().toISOString()
            });

            analyses.push({
                userId: userDoc.id,
                ...analysis
            });
        }

        return { 
            success: true, 
            totalAnalyzed: analyses.length,
            analyses: analyses
        };
    } catch (error) {
        console.error('Error in sentiment analysis:', error);
        return { success: false, error: error.message };
    }
}

// Main function to run the analysis
async function main() {
    try {
        console.log("🔍 Checking Firebase connection...");
        
        // Test Firebase connection
        const SurveyResponsesRef = collection(db, 'SurveyResponses');
        const snapshot = await getDocs(SurveyResponsesRef);
        
        console.log(`📊 Found ${snapshot.size} survey responses in database`);
        
        if (snapshot.size > 0) {
            console.log("Starting sentiment analysis...");
            const result = await analyzeSentiments();
            console.log("Analysis complete!");
            console.log("Result:", JSON.stringify(result, null, 2));
        } else {
            console.log("⚠️ No data found in the SurveyResponses collection. Please add some test data first.");
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

// Run the main function if this file is being run directly
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
    main().then(() => {
        console.log("✅ Process complete!");
        process.exit(0);
    }).catch(error => {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    });
}

// Function to analyze a single user's sentiment
export async function analyzeSingleSurveyResponsesentiment(userId, userData) {
    try {
        // Get the model - try gemini-2.5-flash first, then fallback to gemini-1.5-flash
        // Based on Google's latest documentation
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Prepare the text for analysis using the actual T-Mobile survey data
        const textToAnalyze = `
Customer Ratings:
- Connectivity: ${userData.connectivityRating || 'N/A'}/5
- Customer Service: ${userData.customerServiceRating || 'N/A'}/5
- Internet Speed: ${userData.internetSpeedRating || 'N/A'}/5
- Price: ${userData.priceRating || 'N/A'}/5

Customer Feedback:
- Features to Improve: ${userData.featuresToImprove || 'N/A'}
- Most Important Aspects: ${userData.mostImportantAspects || 'N/A'}
- Other Aspects: ${userData.otherAspects || 'N/A'}

Additional Information:
- Location: ${userData.location || 'N/A'}
- Years as Customer: ${userData.yearAsCustomer || 'N/A'}
`;

        const prompt = `Analyze the following T-Mobile customer feedback data and provide a comprehensive sentiment analysis. Consider both the numerical ratings and text feedback.

Please analyze:
1. Overall satisfaction based on the numerical ratings
2. Key concerns or positive points from the text feedback
3. Customer loyalty indicators (years as customer)

Provide a rating from 1 to 5 where:
1 = Very Dissatisfied
2 = Dissatisfied
3 = Neutral
4 = Satisfied
5 = Very Satisfied

Format the response as valid JSON only (no markdown code blocks, just the JSON object) with:
- 'rating': numerical rating (1-5)
- 'explanation': detailed analysis explanation
- 'keyIssues': main concerns identified (if any)
- 'positiveAspects': main positive points identified (if any)

Return only the JSON object, no additional text or markdown formatting.

Here's the customer data to analyze:

${textToAnalyze}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract and parse the JSON response (handles markdown code blocks)
        const jsonText = extractJSON(text);
        const analysis = JSON.parse(jsonText);

        // Update the user document with the new sentiment analysis
        await updateDoc(doc(db, 'SurveyResponses', userId), {
            sentimentRating: analysis.rating,
            sentimentExplanation: analysis.explanation,
            keyIssues: analysis.keyIssues,
            positiveAspects: analysis.positiveAspects,
            analyzedAt: new Date().toISOString()
        });

        return { success: true, ...analysis };
    } catch (error) {
        console.error('Error in single user sentiment analysis:', error);
        return { success: false, error: error.message };
    }
}