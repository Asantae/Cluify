import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const WinOverlay: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      bgcolor: 'rgba(0,0,0,0.85)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      p: 3, // Add padding to prevent text from touching edges
      boxSizing: 'border-box',
    }}
  >
    <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ textAlign: 'center' }}>
      Congratulations!
    </Typography>
    <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
      You solved the case!
    </Typography>
    <Button
      variant="contained"
      size="large"
      onClick={onClose}
      sx={{
        fontSize: 16,
        px: 3,
        py: 1,
        borderRadius: 50,
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        letterSpacing: 1,
        outline: 'none',
        backgroundColor: '#fff',
        color: '#000',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
      }}
    >
      Return to Main Menu
    </Button>
  </Box>
);

export default WinOverlay; 