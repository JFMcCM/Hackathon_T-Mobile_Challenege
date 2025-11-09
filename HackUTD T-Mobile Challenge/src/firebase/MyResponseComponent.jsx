import React, { useEffect, useState } from 'react';
import { getResponseData, addFeedback, updateFeedbackAnalysis } from './firestoreService';
import { analyzeResponseWithGemini, generateReviewsSummary } from './geminiService';

function MyResponseComponent() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Function to analyze and store new feedback
  const analyzeFeedback = async (feedback) => {
    try {
      // 1. Store the feedback in Firestore first
      const docId = await addFeedback({
        type: feedback.type,
        content: feedback.content,
        metadata: feedback.metadata
      });

      // 2. Analyze with Gemini
      const analysis = await analyzeResponseWithGemini({
        content: feedback.content,
        type: feedback.type
      });

      // 3. Update the document with analysis results
      await updateFeedbackAnalysis(docId, analysis);

      return { success: true, analysis };
    } catch (err) {
      console.error('Error processing feedback:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const generateSummary = async () => {
    try {
      setSummaryLoading(true);
      const result = await generateReviewsSummary();
      if (result.success) {
        setSummaryData(result);
      } else {
        setError(result.error || 'Failed to generate summary');
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Load existing feedback on component mount
  useEffect(() => {
    async function loadFeedback() {
      try {
        setLoading(true);
        // Get the last 5 analyzed responses
        const data = await getResponseData();
        setResponses(data || []);
      } catch (err) {
        console.error('Error loading feedback:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadFeedback();
  }, []); 

  if (loading) return <div>Loading responses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Customer Feedback Analysis</h2>
      
      {/* Summary Section */}
      {responses.length > 0 && (
        <div className="mb-6 border-2 border-blue-200 p-4 rounded-lg bg-blue-50">
          <button
            onClick={generateSummary}
            disabled={summaryLoading}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {summaryLoading ? 'Generating Summary...' : 'Generate Reviews Summary'}
          </button>

          {summaryData && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-blue-800 mb-2">Overall Summary</h3>
                <p className="text-gray-800">{summaryData.summary?.overallSummary}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Total Reviews: {summaryData.totalReviews} | Negative Reviews: {summaryData.negativeReviewsCount}
                </p>
              </div>

              {summaryData.summary?.mainTalkingPoints && (
                <div>
                  <h4 className="font-bold text-blue-700 mb-2">Main Talking Points</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-800">
                    {summaryData.summary.mainTalkingPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summaryData.summary?.topPositiveAspects && (
                <div>
                  <h4 className="font-bold text-green-700 mb-2">Top Positive Aspects</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-800">
                    {summaryData.summary.topPositiveAspects.map((aspect, idx) => (
                      <li key={idx}>{aspect}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summaryData.summary?.criticalIssues && summaryData.summary.criticalIssues.length > 0 && (
                <div>
                  <h4 className="font-bold text-red-700 mb-2">Critical Issues</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-800">
                    {summaryData.summary.criticalIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summaryData.summary?.recommendations && (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-2">Recommendations for Negative Feedback</h4>
                  <ul className="list-decimal list-inside space-y-1 text-gray-800">
                    {summaryData.summary.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summaryData.summary?.sentimentDistribution && (
                <div>
                  <h4 className="font-bold text-blue-700 mb-2">Sentiment Distribution</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(summaryData.summary.sentimentDistribution).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {summaryData.summary?.averageRatings && (
                <div>
                  <h4 className="font-bold text-blue-700 mb-2">Average Ratings</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(summaryData.summary.averageRatings).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {typeof value === 'number' ? value.toFixed(2) : value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Display existing analyzed feedback */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Individual Reviews</h3>
        {responses.map((response) => (
          <div key={response.id} className="border p-4 rounded-lg">
            <div className="font-semibold">Type: {response.type}</div>
            <div className="mt-2">{response.content}</div>
            {response.analysis && (
              <div className="mt-2 bg-gray-50 p-2 rounded">
                <div>Sentiment: {response.analysis.sentiment}</div>
                <div>Score: {(response.analysis.score * 100).toFixed(1)}%</div>
                <div>Topics: {response.analysis.mainTopics.join(', ')}</div>
                <div>Summary: {response.analysis.summary}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {responses.length === 0 && (
        <p className="text-gray-500">No analyzed feedback yet.</p>
      )}
    </div>
  );
}

export default MyResponseComponent;
