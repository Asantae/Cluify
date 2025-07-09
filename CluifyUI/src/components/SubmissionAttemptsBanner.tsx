import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface SubmissionAttemptsBannerProps {
  attempts: number;
  maxAttempts: number;
  hasWon: boolean;
  isLockedOut: boolean;
  isCaseActive: boolean;
  darkMode: boolean;
}

const SubmissionAttemptsBanner: React.FC<SubmissionAttemptsBannerProps> = ({
  attempts,
  maxAttempts,
  hasWon,
  isLockedOut,
  isCaseActive,
  darkMode,
}) => {
  const theme = useTheme();
  // Responsive font size
  const fontSize = {
    xs: '0.95rem', // mobile
    sm: '1.1rem', // tablet
    md: '1.25rem', // desktop
  };
  // Color logic for dark/light mode
  const getBgColor = (type: 'info' | 'success' | 'error' | 'warning') => {
    if (type === 'info') {
      return 'transparent'; // transparent for attempts remaining
    }
    if (type === 'success') {
      return theme.palette.success.main;
    }
    if (type === 'error') {
      return theme.palette.error.main;
    }
    if (type === 'warning') {
      return theme.palette.warning.main;
    }
    return 'transparent';
  };
  const getTextColor = (type: 'info' | 'success' | 'error' | 'warning', remainingAttempts?: number) => {
    if (type === 'info') {
      // Color logic for attempts remaining: redder as attempts decrease
      if (typeof remainingAttempts === 'number') {
        if (remainingAttempts === 1) {
          return theme.palette.error.main;
        } else if (!darkMode) {
          return '#111'; // always pure black in light mode for readability
        } else if (remainingAttempts === 2) {
          return '#ff9800'; // orange in dark mode
        } else if (remainingAttempts === 3) {
          return '#fff176'; // yellow in dark mode
        } else {
          return theme.palette.grey[100]; // light gray in dark mode
        }
      }
      return darkMode ? theme.palette.grey[100] : '#111';
    }
    if (type === 'success' || type === 'error') {
      return darkMode ? '#fff' : '#111';
    }
    if (type === 'warning') {
      return '#111';
    }
    return 'inherit';
  };

  // Banner content logic
  let content = null;
  let bgType: 'info' | 'success' | 'error' | 'warning' = 'info';
  let remaining = maxAttempts - attempts;
  if (!isCaseActive) {
    content = 'Case no longer active';
    bgType = 'warning';
  } else if (hasWon) {
    content = 'Congratulations!';
    bgType = 'success';
  } else if (isLockedOut) {
    content = 'Thanks for playing today!';
    bgType = 'error';
  } else {
    content = `${remaining} more attempt${remaining === 1 ? '' : 's'}`;
    bgType = 'info';
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '64px', // directly under header
        right: 0,
        zIndex: 1500,
        bgcolor: 'transparent',
        p: 0,
        m: 0,
        minWidth: 0,
        boxShadow: 'none',
        width: 'auto',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        pointerEvents: 'none', // allow clicks through the banner
      }}
    >
      <Typography
        variant="h6"
        sx={{
          bgcolor: getBgColor(bgType),
          color: bgType === 'info' && theme.palette.mode === 'light' ? '#111 !important' : getTextColor(bgType, bgType === 'info' ? remaining : undefined),
          borderRadius: bgType === 'info' ? 0 : 1,
          px: bgType === 'info' ? 0 : 2,
          py: bgType === 'info' ? 0 : 0.5,
          fontSize,
          mt: 0,
          mr: 2,
          boxShadow: bgType === 'info' ? 'none' : 2,
          pointerEvents: 'auto', // allow interaction with the text if needed
          fontWeight: 600,
        }}
      >
        {content}
      </Typography>
    </Box>
  );
};

export default SubmissionAttemptsBanner; 