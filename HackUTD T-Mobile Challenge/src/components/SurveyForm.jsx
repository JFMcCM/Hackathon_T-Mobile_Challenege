import React, { useState } from 'react'
import { Box, TextField, Button, Typography, Rating, CircularProgress, Alert } from '@mui/material'
import { addDoc, collection, getFirestore } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { analyzeSingleSurveyResponsesentiment } from '../firebase/geminiService'

const firebaseConfig = {
  apiKey: "AIzaSyCnVAnsObBnci0E3xuv3lVoznUnoTqXANE",
  authDomain: "tmobilechallenge.firebaseapp.com",
  projectId: "tmobilechallenge",
  storageBucket: "tmobilechallenge.firebasestorage.app",
  messagingSenderId: "531685921823",
  appId: "1:531685921823:web:bb7e4d4c3021448fd1712a"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const SurveyForm = ({ onSurveySubmitted }) => {
  const [formData, setFormData] = useState({
    connectivityRating: 3,
    customerServiceRating: 3,
    internetSpeedRating: 3,
    priceRating: 3,
    featuresToImprove: '',
    mostImportantAspects: '',
    otherAspects: '',
    location: '',
    yearAsCustomer: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleRatingChange = (field, newValue) => {
    setFormData(prev => ({ ...prev, [field]: newValue }))
  }

  const handleTextChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const docRef = await addDoc(collection(db, 'SurveyResponses'), {
        ...formData,
        submittedAt: new Date().toISOString()
      })

      await analyzeSingleSurveyResponsesentiment(docRef.id, formData)

      setSuccess(true)
      setFormData({
        connectivityRating: 3,
        customerServiceRating: 3,
        internetSpeedRating: 3,
        priceRating: 3,
        featuresToImprove: '',
        mostImportantAspects: '',
        otherAspects: '',
        location: '',
        yearAsCustomer: ''
      })

      setTimeout(() => setSuccess(false), 3000)
      if (onSurveySubmitted) {
        onSurveySubmitted()
      }
    } catch (err) {
      console.error('Error submitting survey:', err)
      setError(err.message || 'Failed to submit survey')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 2, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        T-Mobile Customer Satisfaction Survey
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Survey submitted successfully!</Alert>}

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Network Connectivity (1-5)</Typography>
        <Rating
          value={formData.connectivityRating}
          onChange={(e, newValue) => handleRatingChange('connectivityRating', newValue)}
          size="large"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Customer Service (1-5)</Typography>
        <Rating
          value={formData.customerServiceRating}
          onChange={(e, newValue) => handleRatingChange('customerServiceRating', newValue)}
          size="large"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Internet Speed (1-5)</Typography>
        <Rating
          value={formData.internetSpeedRating}
          onChange={(e, newValue) => handleRatingChange('internetSpeedRating', newValue)}
          size="large"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Price/Value (1-5)</Typography>
        <Rating
          value={formData.priceRating}
          onChange={(e, newValue) => handleRatingChange('priceRating', newValue)}
          size="large"
        />
      </Box>

      <TextField
        fullWidth
        multiline
        rows={3}
        margin="normal"
        label="Features to Improve"
        name="featuresToImprove"
        value={formData.featuresToImprove}
        onChange={handleTextChange}
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        margin="normal"
        label="Most Important Aspects"
        name="mostImportantAspects"
        value={formData.mostImportantAspects}
        onChange={handleTextChange}
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        margin="normal"
        label="Other Aspects"
        name="otherAspects"
        value={formData.otherAspects}
        onChange={handleTextChange}
      />

      <TextField
        fullWidth
        margin="normal"
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleTextChange}
      />

      <TextField
        fullWidth
        margin="normal"
        label="Years as Customer"
        name="yearAsCustomer"
        value={formData.yearAsCustomer}
        onChange={handleTextChange}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        disabled={loading}
        sx={{ mt: 3 }}
      >
        {loading ? <CircularProgress size={20} /> : 'Submit Survey'}
      </Button>
    </Box>
  )
}

export default SurveyForm
