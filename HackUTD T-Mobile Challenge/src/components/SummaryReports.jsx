import React, { useState } from 'react'
import { Box, Paper, Typography, Button, CircularProgress, Alert, Divider } from '@mui/material'
import { generateReviewsSummary } from '../firebase/geminiService'

const SummaryReports = () => {
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerateSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await generateReviewsSummary()
      if (result.success) {
        setSummaryData(result)
      } else {
        setError(result.error || 'Failed to generate summary')
      }
    } catch (err) {
      console.error('Error generating summary:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!summaryData) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 2, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Generate Reviews Summary Report
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 3 }}>
            Click below to analyze all surveys and generate a comprehensive summary including main talking points and recommendations for negative feedback.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateSummary}
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Summary Report'}
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 2, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Reviews Summary Report
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleGenerateSummary}
            disabled={loading}
            size="small"
          >
            {loading ? 'Refreshing...' : 'Refresh Report'}
          </Button>
        </Box>

        <Typography color="textSecondary" sx={{ mb: 3 }}>
          Total Reviews: <strong>{summaryData.totalReviews}</strong> | Negative Reviews: <strong>{summaryData.negativeReviewsCount}</strong>
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Overall Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#E20074' }}>
            📊 Overall Summary
          </Typography>
          <Typography paragraph>
            {summaryData.summary?.overallSummary}
          </Typography>
        </Box>

        {/* Main Talking Points */}
        {summaryData.summary?.mainTalkingPoints && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#E20074' }}>
              💬 Main Talking Points
            </Typography>
            <ul style={{ marginLeft: '20px' }}>
              {summaryData.summary.mainTalkingPoints.map((point, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                  <Typography component="span">{point}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}

        {/* Top Positive Aspects */}
        {summaryData.summary?.topPositiveAspects && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#2e7d32' }}>
              ✅ Top Positive Aspects
            </Typography>
            <ul style={{ marginLeft: '20px' }}>
              {summaryData.summary.topPositiveAspects.map((aspect, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                  <Typography component="span">{aspect}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}

        {/* Critical Issues */}
        {summaryData.summary?.criticalIssues && summaryData.summary.criticalIssues.length > 0 && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#c62828' }}>
              ⚠️ Critical Issues
            </Typography>
            <ul style={{ marginLeft: '20px' }}>
              {summaryData.summary.criticalIssues.map((issue, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                  <Typography component="span">{issue}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}

        {/* Recommendations */}
        {summaryData.summary?.recommendations && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 1, border: '2px solid #f57f17' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#e65100' }}>
              🎯 Recommendations for Negative Feedback
            </Typography>
            <ol style={{ marginLeft: '20px' }}>
              {summaryData.summary.recommendations.map((rec, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                  <Typography component="span">{rec}</Typography>
                </li>
              ))}
            </ol>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Sentiment Distribution */}
        {summaryData.summary?.sentimentDistribution && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#E20074' }}>
              📈 Sentiment Distribution
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
              {Object.entries(summaryData.summary.sentimentDistribution).map(([key, value]) => (
                <Paper key={key} sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                  <Typography variant="body2" color="textSecondary">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#E20074' }}>
                    {value}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* Average Ratings */}
        {summaryData.summary?.averageRatings && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#E20074' }}>
              ⭐ Average Ratings
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
              {Object.entries(summaryData.summary.averageRatings).map(([key, value]) => (
                <Paper key={key} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="body2" color="textSecondary">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#E20074' }}>
                    {typeof value === 'number' ? value.toFixed(2) : value}/5
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default SummaryReports
