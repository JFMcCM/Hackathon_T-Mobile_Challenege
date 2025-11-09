import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const ResultsDisplay = ({ analysisResults }) => {
  if (!analysisResults) return null

  // support both structured parsed object and a { raw: text } fallback
  const data = analysisResults.raw ? null : analysisResults
  const raw = analysisResults.raw

  if (raw) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Gemini response (raw)</Typography>
          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>{raw}</Typography>
        </Paper>
      </Box>
    )
  }

  const { sentiment, score = 0, mainTopics = [], summary = '', categories = {} } = data

  const chartData = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: 'Category Scores',
        data: Object.values(categories),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  }

  const options = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, max: 1 },
    },
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Overall Sentiment: {String(sentiment)}</Typography>
        <Typography>Confidence: {(score * 100).toFixed(1)}%</Typography>
        <Typography>Main Topics: {mainTopics.join(', ')}</Typography>
        <Typography>Summary: {summary}</Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Bar data={chartData} options={options} />
      </Paper>
    </Box>
  )
}

export default ResultsDisplay
