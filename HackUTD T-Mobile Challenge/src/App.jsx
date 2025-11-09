import { useState } from 'react'
import { Container, CssBaseline, ThemeProvider, createTheme, Alert, Snackbar, Tabs, Tab, Box } from '@mui/material'
import './App.css'
import FeedbackInput from './components/FeedbackInput'
import ResultsDisplay from './components/ResultsDisplay'
import MyResponseComponent from './firebase/MyResponseComponent'
import SurveyForm from './components/SurveyForm'
import SummaryReports from './components/SummaryReports'
import ErrorBoundary from './components/common/ErrorBoundary'
import { LoadingOverlay } from './components/common/LoadingStates'

const theme = createTheme({
  palette: {
    primary: { main: '#E20074' },
  },
})

function App() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAnalysis = async (feedback) => {
    try {
      setLoading(true);
      setError(null);
      const results = await MyResponseComponent.analyzeFeedback(feedback);
      if (!results.success) {
        throw new Error(results.error || 'Analysis failed');
      }
      setAnalysisResults(results.analysis);
    } catch (err) {
      console.error('Error during analysis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSurveySubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Container>
          <LoadingOverlay active={loading}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', my: 2 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Survey Form" />
                <Tab label="Summary Report" />
                <Tab label="Free-form Feedback" />
              </Tabs>
            </Box>

            {tabValue === 0 && (
              <SurveyForm key={refreshTrigger} onSurveySubmitted={handleSurveySubmitted} />
            )}

            {tabValue === 1 && (
              <SummaryReports key={refreshTrigger} />
            )}

            {tabValue === 2 && (
              <>
                <FeedbackInput 
                  onAnalysisComplete={handleAnalysis}
                  disabled={loading}
                />
                <ResultsDisplay analysisResults={analysisResults} />
                <MyResponseComponent />
              </>
            )}
          </LoadingOverlay>

          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={() => setError(null)}
          >
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Snackbar>
        </Container>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
