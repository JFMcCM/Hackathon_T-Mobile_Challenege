import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    gap: 2,
    p: 4 
  }}>
    <CircularProgress />
    <Typography>{message}</Typography>
  </Box>
);

export const LoadingOverlay = ({ active, children }) => {
  if (!active) return children;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <CircularProgress />
      </Box>
      <Box sx={{ opacity: 0.3 }}>
        {children}
      </Box>
    </Box>
  );
};