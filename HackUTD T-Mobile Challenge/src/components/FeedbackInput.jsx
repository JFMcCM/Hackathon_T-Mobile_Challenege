import React, { useState } from 'react'
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material'
import { analyzeResponseWithGemini } from '../firebase/geminiService'

const FeedbackInput = ({ onAnalysisComplete }) => {
  const [feedbackData, setFeedbackData] = useState({
    socialMedia: '',
    surveys: '',
    emails: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        socialMedia: feedbackData.socialMedia,
        surveys: feedbackData.surveys,
        emails: feedbackData.emails,
      }
      const result = await analyzeResponseWithGemini(payload)
      onAnalysisComplete(result)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Customer Feedback Demo (Gemini)
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={4}
        margin="normal"
        label="Social Media Posts"
        value={feedbackData.socialMedia}
        onChange={(e) => setFeedbackData(prev => ({ ...prev, socialMedia: e.target.value }))}
      />

      <TextField
        fullWidth
        multiline
        rows={4}
        margin="normal"
        label="Survey Responses"
        value={feedbackData.surveys}
        onChange={(e) => setFeedbackData(prev => ({ ...prev, surveys: e.target.value }))}
      />

      <TextField
        fullWidth
        multiline
        rows={4}
        margin="normal"
        label="Customer Emails"
        value={feedbackData.emails}
        onChange={(e) => setFeedbackData(prev => ({ ...prev, emails: e.target.value }))}
      />

      {error && (
        <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleAnalyze}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={20} /> : 'Analyze Feedback'}
      </Button>
    </Box>
  )
}

export default FeedbackInput
